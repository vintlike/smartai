package com.smartai.server.system.vo;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LogVO {

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
