package com.smartai.service;

import com.smartai.entity.SysRole;
import com.smartai.entity.SysUserRole;

import java.util.List;

public interface SysRoleService {

    SysRole create(SysRole role);

    SysRole update(SysRole role);

    void delete(String id);

    SysRole getById(String id);

    List<SysRole> list(String name, String code);

    void assignMenus(String roleId, List<String> menuIds);

    List<SysRole> listByUserId(String userId);

    List<SysUserRole> listUserRoles(List<String> userIds);
}
