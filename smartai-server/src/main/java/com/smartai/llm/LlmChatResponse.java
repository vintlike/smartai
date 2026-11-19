package com.smartai.llm;

import lombok.Data;

import java.util.List;

@Data
public class LlmChatResponse {

    private String id;
    private String object;
    private Long created;
    private String model;
    private List<Choice> choices;
    private Usage usage;
    private Error error;

    public String getContent() {
        if (choices == null || choices.isEmpty() || choices.get(0).getMessage() == null) {
            return null;
        }
        return choices.get(0).getMessage().getContent();
    }

    public String getDeltaContent() {
        if (choices == null || choices.isEmpty() || choices.get(0).getDelta() == null) {
            return null;
        }
        return choices.get(0).getDelta().getContent();
    }

    public String getFinishReason() {
        if (choices == null || choices.isEmpty()) {
            return null;
        }
        return choices.get(0).getFinishReason();
    }

    @Data
    public static class Choice {
        private Integer index;
        private Message message;
        private Message delta;
        private String finishReason;
    }

    @Data
    public static class Message {
        private String role;
        private String content;
    }

    @Data
    public static class Usage {
        private Integer promptTokens;
        private Integer completionTokens;
        private Integer totalTokens;
    }

    @Data
    public static class Error {
        private String message;
        private String type;
        private String code;
    }
}
