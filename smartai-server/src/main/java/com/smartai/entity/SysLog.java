package com.smartai.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class SysLog {

    public static final Integer RESULT_SUCCESS = 1;
    public static final Integer RESULT_FAIL = 2;

    private String id;
    private Integer resultStatus;
    private String username;
    private String operation;
    private String url;
    private Long durationMs;
    private String method;
    private String requestParams;
    private String ip;
    private String userAgent;
    private LocalDateTime createTime;
}
