package com.smartai.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AigcAppApi {

    private String id;
    private String appId;
    private String channel;
    private String apiKey;
    private LocalDateTime createTime;
}
