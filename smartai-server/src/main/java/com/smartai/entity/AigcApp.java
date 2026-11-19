package com.smartai.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AigcApp {

    private String id;
    private String userId;
    private String username;
    private String modelId;
    private String knowledgeIds;
    private String cover;
    private String name;
    private String prompt;
    private String description;
    private LocalDateTime updateTime;
    private LocalDateTime createTime;
}
