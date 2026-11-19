package com.smartai.llm;

import lombok.Data;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
public class LlmChatRequest {

    private String model;
    private List<LlmChatMessage> messages = new ArrayList<>();
    private Double temperature;
    private Double topP;
    private Integer maxTokens;
    private Map<String, Object> extra = new HashMap<>();

    public static LlmChatRequest of(String model) {
        LlmChatRequest request = new LlmChatRequest();
        request.setModel(model);
        return request;
    }

    public LlmChatRequest addMessage(LlmChatMessage message) {
        this.messages.add(message);
        return this;
    }

    public LlmChatRequest addUserMessage(String content) {
        return addMessage(LlmChatMessage.user(content));
    }

    public LlmChatRequest addAssistantMessage(String content) {
        return addMessage(LlmChatMessage.assistant(content));
    }
}
