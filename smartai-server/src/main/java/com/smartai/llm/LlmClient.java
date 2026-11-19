package com.smartai.llm;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import lombok.extern.slf4j.Slf4j;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.Semaphore;

/**
 * OpenAI 兼容网关客户端，支持同步与 SSE 流式调用。
 */
@Slf4j
public class LlmClient {

    public static final String DEFAULT_OFFICE_BASE_URL = "https://vua-ai-gateway.vmic.xyz";
    public static final String DEFAULT_INNER_BASE_URL = "http://vua-ai-gateway.vivo.lan:8080";
    public static final String CHAT_COMPLETIONS_PATH = "/v1/chat/completions";

    private static final Gson GSON = new GsonBuilder()
            .setFieldNamingPolicy(com.google.gson.FieldNamingPolicy.LOWER_CASE_WITH_UNDERSCORES)
            .create();

    private final String endpoint;
    private final String apiKey;
    private final HttpClient httpClient;
    private final Duration readTimeout;
    private final Duration streamTotalTimeout;
    private final int maxRetries;
    private final long retryBackoffMillis;
    private final Semaphore semaphore;
    private final int maxWaitSeconds;
    private final boolean disableReasoning;

    private LlmClient(Builder builder) {
        this.endpoint = normalizeEndpoint(builder.baseUrl);
        this.apiKey = builder.apiKey;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(builder.connectTimeout)
                .build();
        this.readTimeout = builder.readTimeout;
        this.streamTotalTimeout = builder.streamTotalTimeout;
        this.maxRetries = Math.max(0, builder.maxRetries);
        this.retryBackoffMillis = Math.max(0, builder.retryBackoffMillis);
        this.semaphore = builder.maxConcurrency > 0 ? new Semaphore(builder.maxConcurrency) : null;
        this.maxWaitSeconds = Math.max(1, builder.maxWaitSeconds);
        this.disableReasoning = builder.disableReasoning;
    }

    public static LlmClient createDefault() {
        return builder()
                .baseUrl(LlmConfig.getBaseUrl())
                .apiKey(LlmConfig.getApiKey())
                .maxConcurrency(LlmConfig.getMaxConcurrency())
                .build();
    }

    public static Builder builder() {
        return new Builder();
    }

    public String endpoint() {
        return endpoint;
    }

    public LlmChatResponse chat(LlmChatRequest request) {
        return chat(request, "unknown");
    }

    public LlmChatResponse chat(LlmChatRequest request, String caller) {
        validate(request);
        acquire();
        try {
            JsonObject body = buildBody(request, false);
            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(endpoint))
                    .timeout(readTimeout)
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(GSON.toJson(body), StandardCharsets.UTF_8))
                    .build();
            long start = System.currentTimeMillis();
            LlmException lastError = null;
            for (int attempt = 0; attempt <= maxRetries; attempt++) {
                try {
                    HttpResponse<String> response = httpClient.send(httpRequest,
                            HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
                    int status = response.statusCode();
                    if (status >= 200 && status < 300) {
                        LlmChatResponse parsed = GSON.fromJson(response.body(), LlmChatResponse.class);
                        if (parsed == null) {
                            throw new LlmException("响应解析失败: " + truncate(response.body()));
                        }
                        if (parsed.getContent() == null || parsed.getContent().isEmpty()) {
                            if (attempt < maxRetries) {
                                sleep(backoff(attempt));
                                continue;
                            }
                            throw new LlmException("大模型返回空内容: " + truncate(response.body()), true);
                        }
                        log.info("LlmClient.chat完成，caller:{}，model:{}，id:{}，cost:{}ms，finishReason:{}，totalTokens:{}，res:{}",
                                caller, request.getModel(), parsed.getId(), System.currentTimeMillis() - start,
                                parsed.getFinishReason(),
                                parsed.getUsage() == null ? null : parsed.getUsage().getTotalTokens(),
                                truncate(parsed.getContent()));
                        return parsed;
                    }
                    boolean retryable = status == 429 || status >= 500;
                    lastError = new LlmException(buildErrorMessage(status, response.body(), request.getModel()),
                            status, null, retryable);
                    if (!retryable || attempt == maxRetries) {
                        throw lastError;
                    }
                } catch (IOException | InterruptedException ex) {
                    if (ex instanceof InterruptedException) {
                        Thread.currentThread().interrupt();
                    }
                    lastError = new LlmException("大模型调用IO异常: " + ex.getMessage(), ex, true);
                    if (attempt == maxRetries) {
                        throw lastError;
                    }
                }
                sleep(backoff(attempt));
            }
            throw lastError == null ? new LlmException("大模型调用失败") : lastError;
        } finally {
            release();
        }
    }

    public String chatContent(String user, double temperature) {
        return chatContent(LlmConfig.getDefaultModel(), null, user, temperature);
    }

    public String chatContent(String model, String user, double temperature) {
        return chatContent(model, null, user, temperature);
    }

    public String chatContent(String model, String system, String user, double temperature) {
        LlmChatRequest request = LlmChatRequest.of(model);
        if (system != null && !system.isBlank()) {
            request.addMessage(LlmChatMessage.system(system));
        }
        request.addUserMessage(user);
        request.setTemperature(temperature);
        LlmChatResponse response = chat(request, "chatContent");
        return response.getContent();
    }

    public void chatStream(LlmChatRequest request, LlmStreamListener listener) {
        try {
            validate(request);
            acquire();
            try {
                JsonObject body = buildBody(request, true);
                JsonObject streamOptions = new JsonObject();
                streamOptions.addProperty("include_usage", true);
                body.add("stream_options", streamOptions);
                HttpRequest httpRequest = HttpRequest.newBuilder()
                        .uri(URI.create(endpoint))
                        .timeout(streamTotalTimeout)
                        .header("Content-Type", "application/json")
                        .header("Accept", "text/event-stream")
                        .header("Authorization", "Bearer " + apiKey)
                        .POST(HttpRequest.BodyPublishers.ofString(GSON.toJson(body), StandardCharsets.UTF_8))
                        .build();
                HttpResponse<InputStream> response = httpClient.send(httpRequest,
                        HttpResponse.BodyHandlers.ofInputStream());
                if (response.statusCode() < 200 || response.statusCode() >= 300) {
                    String errorBody = new String(response.body().readAllBytes(), StandardCharsets.UTF_8);
                    throw new LlmException(buildErrorMessage(response.statusCode(), errorBody, request.getModel()),
                            response.statusCode(), null, false);
                }
                listener.onOpen();
                StringBuilder full = new StringBuilder();
                LlmChatResponse lastChunk = null;
                try (BufferedReader reader = new BufferedReader(
                        new InputStreamReader(response.body(), StandardCharsets.UTF_8))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        if (!line.startsWith("data:")) {
                            continue;
                        }
                        String data = line.substring("data:".length()).trim();
                        if (data.isEmpty()) {
                            continue;
                        }
                        if ("[DONE]".equals(data)) {
                            break;
                        }
                        LlmChatResponse chunk;
                        try {
                            chunk = GSON.fromJson(data, LlmChatResponse.class);
                        } catch (RuntimeException ex) {
                            continue;
                        }
                        if (chunk == null) {
                            continue;
                        }
                        lastChunk = chunk;
                        String delta = chunk.getDeltaContent();
                        if (delta != null && !delta.isEmpty()) {
                            full.append(delta);
                            listener.onDelta(delta);
                        }
                    }
                }
                listener.onComplete(full.toString(), lastChunk);
            } finally {
                release();
            }
        } catch (Exception ex) {
            if (ex instanceof LlmException llmException) {
                listener.onError(llmException);
            } else {
                listener.onError(new LlmException("大模型流式调用异常: " + ex.getMessage(), ex, false));
            }
        }
    }

    private JsonObject buildBody(LlmChatRequest request, boolean stream) {
        JsonObject body = new JsonObject();
        body.addProperty("model", request.getModel());
        JsonArray messages = new JsonArray();
        for (LlmChatMessage message : request.getMessages()) {
            JsonObject item = new JsonObject();
            item.addProperty("role", message.getRole());
            item.addProperty("content", message.getContent());
            messages.add(item);
        }
        body.add("messages", messages);
        if (request.getTemperature() != null) {
            body.addProperty("temperature", request.getTemperature());
        }
        if (request.getTopP() != null) {
            body.addProperty("top_p", request.getTopP());
        }
        if (request.getMaxTokens() != null) {
            body.addProperty("max_tokens", request.getMaxTokens());
        }
        body.addProperty("stream", stream);
        Map<String, Object> extra = request.getExtra();
        boolean reasoningHandled = extra != null
                && (extra.containsKey("enable_reasoning") || extra.containsKey("thinking")
                || extra.containsKey("chat_template_kwargs"));
        if (extra != null) {
            for (Map.Entry<String, Object> entry : extra.entrySet()) {
                body.add(entry.getKey(), GSON.toJsonTree(entry.getValue()));
            }
        }
        if (disableReasoning && !reasoningHandled) {
            if (request.getModel() != null && request.getModel().toLowerCase().contains("qwen")) {
                JsonObject kwargs = new JsonObject();
                kwargs.addProperty("enable_thinking", false);
                body.add("chat_template_kwargs", kwargs);
            } else {
                body.addProperty("enable_reasoning", false);
                JsonObject thinking = new JsonObject();
                thinking.addProperty("type", "disabled");
                body.add("thinking", thinking);
            }
        }
        return body;
    }

    private void validate(LlmChatRequest request) {
        if (request == null) {
            throw new LlmException("请求不能为空");
        }
        if (request.getModel() == null || request.getModel().isBlank()) {
            throw new LlmException("模型不能为空");
        }
        if (request.getMessages() == null || request.getMessages().isEmpty()) {
            throw new LlmException("消息不能为空");
        }
    }

    private String buildErrorMessage(int status, String body, String model) {
        String code = null;
        String message = null;
        try {
            JsonObject json = GSON.fromJson(body, JsonObject.class);
            if (json != null && json.has("error") && json.get("error").isJsonObject()) {
                JsonObject error = json.getAsJsonObject("error");
                code = error.has("code") && !error.get("code").isJsonNull() ? error.get("code").getAsString() : null;
                if (error.has("message") && !error.get("message").isJsonNull()) {
                    message = error.get("message").getAsString();
                }
            }
        } catch (RuntimeException ignored) {
            // 响应体非 JSON 时直接截断输出
        }
        if (message == null || message.isBlank()) {
            message = truncate(body);
        }
        return "大模型调用失败，endpoint=" + endpoint + "，model=" + model + "，httpStatus=" + status
                + "，code=" + code + "，message=" + message;
    }

    private void acquire() {
        if (semaphore == null) {
            return;
        }
        long deadline = System.currentTimeMillis() + maxWaitSeconds * 1000L;
        while (!semaphore.tryAcquire()) {
            if (System.currentTimeMillis() > deadline) {
                throw new LlmException("等待大模型调用并发配额超时(" + maxWaitSeconds + "s)", false);
            }
            sleep(1000);
        }
    }

    private void release() {
        if (semaphore != null) {
            semaphore.release();
        }
    }

    private long backoff(int attempt) {
        return retryBackoffMillis * (attempt + 1);
    }

    private static void sleep(long millis) {
        if (millis <= 0) {
            return;
        }
        try {
            Thread.sleep(millis);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
        }
    }

    private static String truncate(String text) {
        if (text == null) {
            return "";
        }
        return text.length() > 500 ? text.substring(0, 500) : text;
    }

    static String normalizeEndpoint(String baseUrl) {
        String url = baseUrl == null ? "" : baseUrl.trim();
        while (url.endsWith("/")) {
            url = url.substring(0, url.length() - 1);
        }
        if (url.endsWith(CHAT_COMPLETIONS_PATH)) {
            return url;
        }
        if (url.endsWith("/v1")) {
            return url + "/chat/completions";
        }
        if (url.endsWith("/chat/completions")) {
            return url;
        }
        return url + CHAT_COMPLETIONS_PATH;
    }

    public static final class Builder {

        private String baseUrl = LlmConfig.getBaseUrl();
        private String apiKey = LlmConfig.getApiKey();
        private Duration connectTimeout = Duration.ofSeconds(10);
        private Duration writeTimeout = Duration.ofSeconds(30);
        private Duration readTimeout = Duration.ofSeconds(120);
        private Duration streamReadTimeout = Duration.ofSeconds(600);
        private Duration streamTotalTimeout = Duration.ofSeconds(600);
        private int maxRetries = 3;
        private long retryBackoffMillis = 1000;
        private int maxConcurrency = 3;
        private int maxWaitSeconds = 60;
        private boolean disableReasoning = true;

        private Builder() {
        }

        public Builder baseUrl(String baseUrl) {
            this.baseUrl = baseUrl;
            return this;
        }

        public Builder apiKey(String apiKey) {
            this.apiKey = apiKey;
            return this;
        }

        public Builder connectTimeout(Duration connectTimeout) {
            this.connectTimeout = connectTimeout;
            return this;
        }

        public Builder writeTimeout(Duration writeTimeout) {
            this.writeTimeout = writeTimeout;
            return this;
        }

        public Builder readTimeout(Duration readTimeout) {
            this.readTimeout = readTimeout;
            return this;
        }

        public Builder streamReadTimeout(Duration streamReadTimeout) {
            this.streamReadTimeout = streamReadTimeout;
            return this;
        }

        public Builder streamTotalTimeout(Duration streamTotalTimeout) {
            this.streamTotalTimeout = streamTotalTimeout;
            return this;
        }

        public Builder maxRetries(int maxRetries) {
            this.maxRetries = maxRetries;
            return this;
        }

        public Builder retryBackoffMillis(long retryBackoffMillis) {
            this.retryBackoffMillis = retryBackoffMillis;
            return this;
        }

        public Builder maxConcurrency(int maxConcurrency) {
            this.maxConcurrency = maxConcurrency;
            return this;
        }

        public Builder maxWaitSeconds(int maxWaitSeconds) {
            this.maxWaitSeconds = maxWaitSeconds;
            return this;
        }

        public Builder disableReasoning(boolean disableReasoning) {
            this.disableReasoning = disableReasoning;
            return this;
        }

        public LlmClient build() {
            if (apiKey == null || apiKey.isBlank()) {
                throw new IllegalArgumentException("apiKey不能为空，请填入网关分发的虚拟key");
            }
            return new LlmClient(this);
        }
    }
}
