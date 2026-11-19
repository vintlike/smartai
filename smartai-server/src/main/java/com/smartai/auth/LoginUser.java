package com.smartai.auth;

import lombok.Data;

import java.util.List;

@Data
public class LoginUser {

    public static final String SUPER_ADMIN_ROLE = "administrator";

    private String id;
    private String username;
    private String realName;
    private String avatar;
    private List<String> roleCodes;
    private List<String> roleNames;
    private List<String> perms;
    private boolean superAdmin;

    public boolean hasPerm(String perm) {
        return superAdmin || (perms != null && perms.contains(perm));
    }
}
