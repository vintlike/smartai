package com.smartai.llm;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Properties;

/**
 * 网关配置读取：JVM 系统属性（-Dllm.xxx） > llm.properties > 内置默认值。
 */
public final class LlmConfig {

    private static final String DEFAULT_MODEL = "DeepSeek-V4-Flash-auto";
    private static final int DEFAULT_MAX_CONCURRENCY = 3;

    private static final Properties PROPERTIES = loadProperties();

    private LlmConfig() {
    }

    private static Properties loadProperties() {
        Properties properties = new Properties();
        try (InputStream input = LlmConfig.class.getClassLoader().getResourceAsStream("llm.properties")) {
            if (input != null) {
                properties.load(new InputStreamReader(input, StandardCharsets.UTF_8));
            }
        } catch (IOException ignored) {
            // 配置文件缺失时使用内置默认值
        }
        return properties;
    }

    public static String getApiKey() {
        return resolve("llm.apiKey", "");
    }

    public static String getBaseUrl() {
        String property = System.getProperty("llm.baseUrl");
        if (property != null && !property.isBlank()) {
            return property.trim();
        }
        String fromConfigCenter = resolveBaseUrlFromConfigCenter();
        if (fromConfigCenter != null && !fromConfigCenter.isBlank()) {
            return fromConfigCenter;
        }
        String fromFile = PROPERTIES.getProperty("llm.baseUrl");
        if (fromFile != null && !fromFile.isBlank()) {
            return fromFile.trim();
        }
        return isLocalDev() ? LlmClient.DEFAULT_OFFICE_BASE_URL : LlmClient.DEFAULT_INNER_BASE_URL;
    }

    public static String getDefaultModel() {
        return resolve("llm.defaultModel", DEFAULT_MODEL);
    }

    public static int getMaxConcurrency() {
        try {
            return Integer.parseInt(resolve("llm.maxConcurrency", String.valueOf(DEFAULT_MAX_CONCURRENCY)));
        } catch (NumberFormatException ex) {
            return DEFAULT_MAX_CONCURRENCY;
        }
    }

    public static LlmModel getDefaultLlmModel() {
        return LlmModel.of(getDefaultModel());
    }

    private static String resolveBaseUrlFromConfigCenter() {
        // 预留配置中心接入，当前固定返回 null
        return null;
    }

    private static boolean isLocalDev() {
        return "dev".equalsIgnoreCase(System.getProperty("app.env"))
                || "dev".equalsIgnoreCase(System.getProperty("com.smartai.service.app.env"));
    }

    private static String resolve(String key, String defaultValue) {
        String property = System.getProperty(key);
        if (property != null && !property.isBlank()) {
            return property.trim();
        }
        String value = PROPERTIES.getProperty(key);
        return value == null || value.isBlank() ? defaultValue : value.trim();
    }
}
