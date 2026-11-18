package com.smartai.server.system.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.LocalDateTime;
import lombok.Data;

@Data
@TableName("sys_log")
public class SysLog {

    @TableId(type = IdType.INPUT)
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
