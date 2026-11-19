package com.smartai.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class SysUser {

    private String id;
    private String username;
    private String password;
    private String realName;
    private String gender;
    private String phone;
    private String email;
    private String deptId;
    private String avatar;
    private Boolean isEnabled;
    private LocalDateTime createTime;
}
