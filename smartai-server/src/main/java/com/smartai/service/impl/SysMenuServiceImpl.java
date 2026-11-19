package com.smartai.service.impl;

import com.smartai.auth.LoginUser;
import com.smartai.auth.UserContext;
import com.smartai.entity.SysMenu;
import com.smartai.exception.BusinessException;
import com.smartai.mapper.SysMenuMapper;
import com.smartai.mapper.SysRoleMenuMapper;
import com.smartai.service.SysMenuService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class SysMenuServiceImpl implements SysMenuService {

    public static final String ROOT_PARENT_ID = "0";

    private final SysMenuMapper sysMenuMapper;
    private final SysRoleMenuMapper sysRoleMenuMapper;

    public SysMenuServiceImpl(SysMenuMapper sysMenuMapper, SysRoleMenuMapper sysRoleMenuMapper) {
        this.sysMenuMapper = sysMenuMapper;
        this.sysRoleMenuMapper = sysRoleMenuMapper;
    }

    @Override
    public SysMenu create(SysMenu menu) {
        if (menu.getName() == null || menu.getName().isBlank()) {
            throw new BusinessException("菜单名称不能为空");
        }
        if (menu.getType() == null || menu.getType().isBlank()) {
            throw new BusinessException("菜单类型不能为空");
        }
        if (menu.getParentId() == null || menu.getParentId().isBlank()) {
            menu.setParentId(ROOT_PARENT_ID);
        }
        menu.setId(UUID.randomUUID().toString().replace("-", ""));
        if (menu.getSortOrder() == null) {
            menu.setSortOrder(0);
        }
        if (menu.getIsDisabled() == null) {
            menu.setIsDisabled(Boolean.FALSE);
        }
        if (menu.getIsExternal() == null) {
            menu.setIsExternal(Boolean.FALSE);
        }
        if (menu.getIsKeepalive() == null) {
            menu.setIsKeepalive(Boolean.FALSE);
        }
        if (menu.getIsVisible() == null) {
            menu.setIsVisible(Boolean.TRUE);
        }
        sysMenuMapper.insert(menu);
        return sysMenuMapper.selectById(menu.getId());
    }

    @Override
    public SysMenu update(SysMenu menu) {
        if (sysMenuMapper.selectById(menu.getId()) == null) {
            throw new BusinessException("菜单不存在");
        }
        if (menu.getParentId() != null && !menu.getParentId().isBlank()
                && !ROOT_PARENT_ID.equals(menu.getParentId())) {
            validateParent(menu.getId(), menu.getParentId());
        }
        if (menu.getName() != null && menu.getName().isBlank()) {
            throw new BusinessException("菜单名称不能为空");
        }
        if (menu.getType() != null && menu.getType().isBlank()) {
            throw new BusinessException("菜单类型不能为空");
        }
        sysMenuMapper.updateById(menu);
        return sysMenuMapper.selectById(menu.getId());
    }

    @Override
    @Transactional
    public void delete(String id) {
        if (sysMenuMapper.selectById(id) == null) {
            throw new BusinessException("菜单不存在");
        }
        List<SysMenu> all = sysMenuMapper.selectList(null, null, null);
        Map<String, List<String>> children = new HashMap<>();
        for (SysMenu menu : all) {
            children.computeIfAbsent(menu.getParentId(), key -> new ArrayList<>()).add(menu.getId());
        }
        List<String> ids = new ArrayList<>();
        Deque<String> stack = new ArrayDeque<>();
        stack.push(id);
        while (!stack.isEmpty()) {
            String current = stack.pop();
            ids.add(current);
            for (String child : children.getOrDefault(current, List.of())) {
                stack.push(child);
            }
        }
        for (String menuId : ids) {
            sysRoleMenuMapper.deleteByMenuId(menuId);
            sysMenuMapper.deleteById(menuId);
        }
    }

    @Override
    public SysMenu getById(String id) {
        SysMenu menu = sysMenuMapper.selectById(id);
        if (menu == null) {
            throw new BusinessException("菜单不存在");
        }
        return menu;
    }

    @Override
    public List<SysMenu> list(String name, String type, String parentId) {
        return sysMenuMapper.selectList(name, type, parentId);
    }

    @Override
    public List<SysMenu> currentMenus() {
        LoginUser loginUser = UserContext.get();
        if (loginUser == null) {
            return new ArrayList<>();
        }
        if (loginUser.isSuperAdmin()) {
            return sysMenuMapper.selectList(null, null, null);
        }
        return sysMenuMapper.selectByUserId(loginUser.getId());
    }

    @Override
    public List<SysMenu> listByRoleId(String roleId) {
        return sysMenuMapper.selectByRoleId(roleId);
    }

    @Override
    public List<SysMenu> listByUserId(String userId) {
        return sysMenuMapper.selectByUserId(userId);
    }

    private void validateParent(String menuId, String parentId) {
        if (menuId.equals(parentId)) {
            throw new BusinessException("上级菜单不能选择自身");
        }
        Set<String> visited = new HashSet<>();
        String current = parentId;
        while (current != null && !current.isBlank() && !ROOT_PARENT_ID.equals(current)) {
            if (!visited.add(current)) {
                throw new BusinessException("上级菜单存在循环依赖");
            }
            if (current.equals(menuId)) {
                throw new BusinessException("上级菜单不能选择自身的子菜单");
            }
            SysMenu parent = sysMenuMapper.selectById(current);
            if (parent == null) {
                break;
            }
            current = parent.getParentId();
        }
        if (sysMenuMapper.selectById(parentId) == null) {
            throw new BusinessException("上级菜单不存在");
        }
    }
}
