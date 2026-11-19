package com.smartai.llm;

/**
 * 历史接入凭据常量（真实密钥不入仓库，运行时由部署环境注入）。
 */
public final class LlmAppKeys {

    public static final AppKeyPair VUA = new AppKeyPair("vua-gateway", "vua-gateway", "<REDACTED>");

    public static final AppKeyPair CHATGPT = new AppKeyPair("chatgpt-gateway", "chatgpt-gateway", "<REDACTED>");
    public static final AppKeyPair CHATGPT_DEEPSEEK = new AppKeyPair("chatgpt-gateway", "chatgpt-gateway-deepseek", "<REDACTED>");

    public static final AppKeyPair QWEN_TXT = new AppKeyPair("qwen", "qwen-txt", "<REDACTED>");
    public static final AppKeyPair QWEN_VL = new AppKeyPair("qwen", "qwen-vl", "<REDACTED>");
    public static final AppKeyPair QWEN_VL_MAX = new AppKeyPair("qwen", "qwen-vl-max", "<REDACTED>");

    public static final AppKeyPair MOONSHOT_KIMI = new AppKeyPair("moonshot", "moonshot-kimi", "<REDACTED>");

    private LlmAppKeys() {
    }

    public static final class AppKeyPair {

        private final String appId;
        private final String appKey;
        private final String apiKey;

        public AppKeyPair(String appId, String appKey, String apiKey) {
            this(appId, appKey, apiKey, null);
        }

        public AppKeyPair(String appId, String appKey, String apiKey, String remark) {
            this.appId = appId;
            this.appKey = appKey;
            this.apiKey = apiKey;
        }

        public String getAppId() {
            return appId;
        }

        public String getAppKey() {
            return appKey;
        }

        public String getApiKey() {
            return apiKey;
        }
    }
}
