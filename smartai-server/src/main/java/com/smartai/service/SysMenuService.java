package com.smartai.service;

import com.smartai.entity.SysMenu;

import java.util.List;

public interface SysMenuService {

    SysMenu create(SysMenu menu);

    SysMenu update(SysMenu menu);

    void delete(String id);

    SysMenu getById(String id);

    List<SysMenu> list(String name, String type, String parentId);

    List<SysMenu> currentMenus();

    List<SysMenu> listByRoleId(String roleId);

    List<SysMenu> listByUserId(String userId);
}
