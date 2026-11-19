package com.smartai.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class SysToken {

    private String id;
    private String token;
    private String account;
    private LocalDateTime expireTime;
    private LocalDateTime createTime;
}
