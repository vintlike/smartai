package com.smartai.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AigcMessage {

    private String id;
    private String userId;
    private String conversationId;
    private String username;
    private String ip;
    private String role;
    private String model;
    private String content;
    private Integer totalTokens;
    private Integer promptTokens;
    private LocalDateTime createTime;
}
