package com.smartai.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AigcConversation {

    private String id;
    private String userId;
    private String title;
    private LocalDateTime createTime;

    private String username;
    private Integer messageCount;
    private Long tokenUsed;
    private LocalDateTime lastConversationTime;
}
