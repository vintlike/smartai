package com.smartai.service;

import com.smartai.entity.SysUser;

import java.util.List;

public interface SysUserService {

    SysUser create(SysUser user);

    SysUser update(SysUser user);

    void delete(String id);

    SysUser getById(String id);

    List<SysUser> list(String username, String realName, String phone, String deptId, Boolean isEnabled);

    void assignRoles(String userId, List<String> roleIds);

    void resetPassword(String userId, String password);
}
