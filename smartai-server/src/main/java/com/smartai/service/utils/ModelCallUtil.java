package com.smartai.service.utils;

import com.smartai.llm.LlmClient;
import com.smartai.llm.LlmConfig;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 网关模型调用工具：按 baseUrl + apiKey 复用客户端。
 */
public final class ModelCallUtil {

    public static final float DEFAULT_GATEWAY_TEMPERATURE = 0.01f;

    private static final String EMPTY_KEY = "EMPTY";
    private static final String CACHE_SEPARATOR = "\u0000";

    private static final Map<String, LlmClient> CLIENTS = new ConcurrentHashMap<>();

    private ModelCallUtil() {
    }

    public static LlmClient gatewayClient() {
        return gatewayClient(null, null);
    }

    public static LlmClient gatewayClient(String baseUrl, String apiKey) {
        String resolvedBaseUrl = baseUrl == null || baseUrl.isBlank() ? LlmConfig.getBaseUrl() : baseUrl.trim();
        String resolvedApiKey = resolveApiKey(resolvedBaseUrl, apiKey);
        String cacheKey = resolvedBaseUrl + CACHE_SEPARATOR + resolvedApiKey;
        return CLIENTS.computeIfAbsent(cacheKey, key -> LlmClient.builder()
                .baseUrl(resolvedBaseUrl)
                .apiKey(resolvedApiKey)
                .build());
    }

    public static String chatByGateway(String prompt) {
        return chatByGateway(null, null, prompt);
    }

    public static String chatByGateway(String model, String prompt) {
        return chatByGateway(model, null, prompt);
    }

    public static String chatByGateway(String model, String system, String prompt) {
        return gatewayClient().chatContent(
                model == null || model.isBlank() ? LlmConfig.getDefaultModel() : model,
                system,
                prompt,
                DEFAULT_GATEWAY_TEMPERATURE);
    }

    private static String resolveApiKey(String baseUrl, String apiKey) {
        if (apiKey != null && !apiKey.isBlank()) {
            return apiKey.trim();
        }
        if (isVuaGateway(baseUrl)) {
            String gatewayKey = LlmConfig.getApiKey();
            if (gatewayKey != null && !gatewayKey.isBlank()) {
                return gatewayKey;
            }
        }
        return EMPTY_KEY;
    }

    private static boolean isVuaGateway(String baseUrl) {
        return baseUrl.contains("vua-ai-gateway.vmic.xyz") || baseUrl.contains("vua-ai-gateway.vivo.lan");
    }
}
