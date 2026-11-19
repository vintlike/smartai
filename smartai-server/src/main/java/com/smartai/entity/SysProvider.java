package com.smartai.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class SysProvider {

    private String id;
    private String name;
    private String code;
    private String remark;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
