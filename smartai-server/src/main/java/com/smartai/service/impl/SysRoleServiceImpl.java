package com.smartai.service.impl;

import com.smartai.entity.SysRole;
import com.smartai.entity.SysUserRole;
import com.smartai.exception.BusinessException;
import com.smartai.mapper.SysRoleMapper;
import com.smartai.mapper.SysRoleMenuMapper;
import com.smartai.mapper.SysUserRoleMapper;
import com.smartai.service.SysRoleService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.UUID;

@Service
public class SysRoleServiceImpl implements SysRoleService {

    private final SysRoleMapper sysRoleMapper;
    private final SysRoleMenuMapper sysRoleMenuMapper;
    private final SysUserRoleMapper sysUserRoleMapper;

    public SysRoleServiceImpl(SysRoleMapper sysRoleMapper, SysRoleMenuMapper sysRoleMenuMapper,
                              SysUserRoleMapper sysUserRoleMapper) {
        this.sysRoleMapper = sysRoleMapper;
        this.sysRoleMenuMapper = sysRoleMenuMapper;
        this.sysUserRoleMapper = sysUserRoleMapper;
    }

    @Override
    public SysRole create(SysRole role) {
        role.setId(UUID.randomUUID().toString().replace("-", ""));
        sysRoleMapper.insert(role);
        return sysRoleMapper.selectById(role.getId());
    }

    @Override
    public SysRole update(SysRole role) {
        if (sysRoleMapper.selectById(role.getId()) == null) {
            throw new BusinessException("角色不存在");
        }
        sysRoleMapper.updateById(role);
        return sysRoleMapper.selectById(role.getId());
    }

    @Override
    @Transactional
    public void delete(String id) {
        if (sysRoleMapper.selectById(id) == null) {
            throw new BusinessException("角色不存在");
        }
        sysUserRoleMapper.deleteByRoleId(id);
        sysRoleMenuMapper.deleteByRoleId(id);
        sysRoleMapper.deleteById(id);
    }

    @Override
    public SysRole getById(String id) {
        SysRole role = sysRoleMapper.selectById(id);
        if (role == null) {
            throw new BusinessException("角色不存在");
        }
        return role;
    }

    @Override
    public List<SysRole> list(String name, String code) {
        return sysRoleMapper.selectList(name, code);
    }

    @Override
    @Transactional
    public void assignMenus(String roleId, List<String> menuIds) {
        if (sysRoleMapper.selectById(roleId) == null) {
            throw new BusinessException("角色不存在");
        }
        sysRoleMenuMapper.deleteByRoleId(roleId);
        if (menuIds == null || menuIds.isEmpty()) {
            return;
        }
        List<String> distinct = new ArrayList<>(new LinkedHashSet<>(menuIds));
        sysRoleMenuMapper.batchInsert(roleId, distinct);
    }

    @Override
    public List<SysRole> listByUserId(String userId) {
        return sysRoleMapper.selectByUserId(userId);
    }

    @Override
    public List<SysUserRole> listUserRoles(List<String> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return new ArrayList<>();
        }
        return sysUserRoleMapper.selectByUserIds(userIds);
    }
}
