package com.smartai.llm;

/**
 * 网关可用模型清单，code 必须与网关模型名完全一致。
 */
public enum LlmModel {

    DEEPSEEK_V4_FLASH_AUTO("DeepSeek-V4-Flash-auto"),
    DOUBAO_SEED_2_1_PRO("Doubao-Seed-2.1-pro"),
    DOUBAO_SEED_2_0_MINI("Doubao-Seed-2.0-mini"),
    BLUELM_QWEN3_5_35B_A3B("BlueLM-Qwen3.5-35B-A3B"),
    BLUELM_QWEN3_5_27B("BlueLM-Qwen3.5-27B");

    private final String code;

    LlmModel(String code) {
        this.code = code;
    }

    public String getCode() {
        return code;
    }

    public static LlmModel of(String code) {
        if (code == null) {
            return null;
        }
        String trimmed = code.trim();
        for (LlmModel model : values()) {
            if (model.code.equals(trimmed)) {
                return model;
            }
        }
        return null;
    }
}
