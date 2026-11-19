package com.smartai.llm;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * OpenAI 兼容的向量化客户端。
 */
public class EmbeddingClient {

    private static final String EMBEDDINGS_PATH = "/v1/embeddings";
    private static final int BATCH_SIZE = 16;
    private static final String EMPTY_KEY = "EMPTY";

    private static final Gson GSON = new Gson();

    private final String endpoint;
    private final String apiKey;
    private final String model;
    private final HttpClient httpClient;
    private final Duration readTimeout;
    private final int maxRetries;
    private final long retryBackoffMillis;

    private EmbeddingClient(Builder builder) {
        this.endpoint = normalizeEndpoint(builder.baseUrl);
        this.apiKey = resolveApiKey(builder.baseUrl, builder.apiKey);
        this.model = builder.model;
        this.httpClient = HttpClient.newBuilder().connectTimeout(builder.connectTimeout).build();
        this.readTimeout = builder.readTimeout;
        this.maxRetries = Math.max(0, builder.maxRetries);
        this.retryBackoffMillis = Math.max(0, builder.retryBackoffMillis);
    }

    public static Builder builder() {
        return new Builder();
    }

    public List<float[]> embed(List<String> inputs) {
        List<float[]> result = new ArrayList<>();
        if (inputs == null || inputs.isEmpty()) {
            return result;
        }
        for (int start = 0; start < inputs.size(); start += BATCH_SIZE) {
            List<String> batch = inputs.subList(start, Math.min(start + BATCH_SIZE, inputs.size()));
            result.addAll(embedBatch(batch));
        }
        return result;
    }

    public float[] embed(String input) {
        List<float[]> vectors = embed(List.of(input));
        return vectors.isEmpty() ? null : vectors.get(0);
    }

    private List<float[]> embedBatch(List<String> batch) {
        JsonObject body = new JsonObject();
        body.addProperty("model", model);
        JsonArray inputArray = new JsonArray();
        batch.forEach(inputArray::add);
        body.add("input", inputArray);
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(endpoint))
                .timeout(readTimeout)
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(GSON.toJson(body), StandardCharsets.UTF_8))
                .build();
        for (int attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                HttpResponse<String> response = httpClient.send(request,
                        HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
                int status = response.statusCode();
                if (status < 200 || status >= 300) {
                    String error = "向量化接口返回 httpStatus:" + status + ",body:" + truncate(response.body());
                    if ((status == 429 || status >= 500) && attempt < maxRetries) {
                        sleep(backoff(attempt));
                        continue;
                    }
                    throw new LlmException(error, status, null, status == 429 || status >= 500);
                }
                return parse(response.body(), batch.size());
            } catch (java.net.http.HttpTimeoutException ex) {
                if (attempt < maxRetries) {
                    sleep(backoff(attempt));
                    continue;
                }
                throw new LlmException("向量化调用超时(" + readTimeout.toSeconds() + "s)", ex, true);
            } catch (IOException | InterruptedException ex) {
                if (ex instanceof InterruptedException) {
                    Thread.currentThread().interrupt();
                }
                if (attempt < maxRetries) {
                    sleep(backoff(attempt));
                    continue;
                }
                throw new LlmException("向量化调用IO异常:" + ex.getMessage(), ex, true);
            } catch (LlmException ex) {
                if (ex.isRetryable() && attempt < maxRetries) {
                    sleep(backoff(attempt));
                    continue;
                }
                throw ex;
            }
        }
        throw new LlmException("向量化调用失败");
    }

    private List<float[]> parse(String body, int expected) {
        JsonObject json;
        try {
            json = GSON.fromJson(body, JsonObject.class);
        } catch (RuntimeException ex) {
            throw new LlmException("向量化响应解析失败:" + ex.getMessage(), ex, false);
        }
        if (json == null) {
            throw new LlmException("向量化响应解析失败: 响应为空", false);
        }
        if (json.has("error") && !json.get("error").isJsonNull()) {
            throw new LlmException("向量化接口返回错误:" + json.get("error"), false);
        }
        if (!json.has("data") || !json.get("data").isJsonArray()) {
            throw new LlmException("向量化响应缺少 data 字段:" + truncate(body), false);
        }
        JsonArray data = json.getAsJsonArray("data");
        List<JsonObject> items = new ArrayList<>();
        for (JsonElement element : data) {
            if (element.isJsonObject()) {
                items.add(element.getAsJsonObject());
            }
        }
        items.sort(Comparator.comparingInt(item -> item.has("index") ? item.get("index").getAsInt() : 0));
        List<float[]> vectors = new ArrayList<>();
        for (JsonObject item : items) {
            JsonArray embedding = item.getAsJsonArray("embedding");
            float[] vector = new float[embedding.size()];
            for (int i = 0; i < embedding.size(); i++) {
                vector[i] = embedding.get(i).getAsFloat();
            }
            vectors.add(vector);
        }
        if (vectors.size() != expected) {
            throw new LlmException("向量化返回数量不匹配，期望" + expected + "条，实际" + vectors.size() + "条", false);
        }
        return vectors;
    }

    private static String resolveApiKey(String baseUrl, String explicit) {
        if (explicit != null && !explicit.isBlank()) {
            return explicit;
        }
        if (baseUrl != null
                && (baseUrl.contains("vua-ai-gateway.vmic.xyz") || baseUrl.contains("vua-ai-gateway.vivo.lan"))) {
            String gatewayKey = LlmConfig.getApiKey();
            if (gatewayKey != null && !gatewayKey.isBlank()) {
                return gatewayKey;
            }
        }
        return EMPTY_KEY;
    }

    static String normalizeEndpoint(String baseUrl) {
        String url = baseUrl == null ? "" : baseUrl.trim();
        while (url.endsWith("/")) {
            url = url.substring(0, url.length() - 1);
        }
        if (url.endsWith(EMBEDDINGS_PATH)) {
            return url;
        }
        if (url.endsWith("/v1/chat/completions")) {
            return url.substring(0, url.length() - "/chat/completions".length()) + "/embeddings";
        }
        if (url.endsWith("/v1")) {
            return url + "/embeddings";
        }
        if (url.endsWith("/embeddings")) {
            return url;
        }
        return url + EMBEDDINGS_PATH;
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

    public static final class Builder {

        private String baseUrl;
        private String apiKey;
        private String model;
        private Duration connectTimeout = Duration.ofSeconds(10);
        private Duration readTimeout = Duration.ofSeconds(60);
        private int maxRetries = 2;
        private long retryBackoffMillis = 1000;

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

        public Builder model(String model) {
            this.model = model;
            return this;
        }

        public Builder connectTimeout(Duration connectTimeout) {
            this.connectTimeout = connectTimeout;
            return this;
        }

        public Builder readTimeout(Duration readTimeout) {
            this.readTimeout = readTimeout;
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

        public EmbeddingClient build() {
            if (model == null || model.isBlank()) {
                throw new IllegalArgumentException("向量模型名称不能为空");
            }
            return new EmbeddingClient(this);
        }
    }
}
