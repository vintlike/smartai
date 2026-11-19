package com.smartai.llm;

import lombok.Data;

@Data
public class LlmChatMessage {

    public static final String ROLE_SYSTEM = "system";
    public static final String ROLE_USER = "user";
    public static final String ROLE_ASSISTANT = "assistant";

    private String role;
    private String content;

    public LlmChatMessage() {
    }

    public LlmChatMessage(String role, String content) {
        this.role = role;
        this.content = content;
    }

    public static LlmChatMessage system(String content) {
        return new LlmChatMessage(ROLE_SYSTEM, content);
    }

    public static LlmChatMessage user(String content) {
        return new LlmChatMessage(ROLE_USER, content);
    }

    public static LlmChatMessage assistant(String content) {
        return new LlmChatMessage(ROLE_ASSISTANT, content);
    }
}
