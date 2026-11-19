package com.smartai.vo;

import lombok.Data;

import java.util.List;

@Data
public class AuthUserVO {

    private String id;
    private String username;
    private String realName;
    private String avatar;
    private List<String> roles;
    private List<String> roleCodes;
    private List<String> perms;
    private Boolean superAdmin;
}
