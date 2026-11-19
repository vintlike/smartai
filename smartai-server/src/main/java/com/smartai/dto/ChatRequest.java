package com.smartai.dto;

import com.smartai.llm.LlmChatMessage;
import lombok.Data;

import java.util.List;

@Data
public class ChatRequest {

    private String model;
    private String systemPrompt;
    private String conversationId;
    private List<LlmChatMessage> messages;
}
