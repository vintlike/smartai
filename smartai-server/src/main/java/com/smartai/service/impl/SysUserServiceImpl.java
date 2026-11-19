package com.smartai.service.impl;

import com.smartai.auth.PasswordEncoder;
import com.smartai.common.Secrets;
import com.smartai.entity.SysUser;
import com.smartai.exception.BusinessException;
import com.smartai.mapper.SysUserMapper;
import com.smartai.mapper.SysUserRoleMapper;
import com.smartai.service.SysUserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.UUID;

@Service
public class SysUserServiceImpl implements SysUserService {

    public static final int MIN_PASSWORD_LENGTH = 6;

    private final SysUserMapper sysUserMapper;
    private final SysUserRoleMapper sysUserRoleMapper;

    public SysUserServiceImpl(SysUserMapper sysUserMapper, SysUserRoleMapper sysUserRoleMapper) {
        this.sysUserMapper = sysUserMapper;
        this.sysUserRoleMapper = sysUserRoleMapper;
    }

    @Override
    public SysUser create(SysUser user) {
        if (sysUserMapper.selectByUsername(user.getUsername()) != null) {
            throw new BusinessException("用户名已存在");
        }
        if (user.getPassword() == null || user.getPassword().isBlank()) {
            throw new BusinessException("密码不能为空");
        }
        if (user.getPassword().length() < MIN_PASSWORD_LENGTH) {
            throw new BusinessException("密码至少 6 位");
        }
        user.setId(UUID.randomUUID().toString().replace("-", ""));
        if (user.getIsEnabled() == null) {
            user.setIsEnabled(Boolean.TRUE);
        }
        user.setPassword(PasswordEncoder.encode(user.getPassword()));
        user.setCreateTime(LocalDateTime.now());
        sysUserMapper.insert(user);
        return sysUserMapper.selectById(user.getId());
    }

    @Override
    public SysUser update(SysUser user) {
        if (sysUserMapper.selectById(user.getId()) == null) {
            throw new BusinessException("用户不存在");
        }
        if (user.getPassword() != null && !user.getPassword().isBlank()
                && !Secrets.MASK.equals(user.getPassword())) {
            user.setPassword(PasswordEncoder.encode(user.getPassword()));
        } else {
            user.setPassword(null);
        }
        sysUserMapper.updateById(user);
        return sysUserMapper.selectById(user.getId());
    }

    @Override
    @Transactional
    public void delete(String id) {
        if (sysUserMapper.selectById(id) == null) {
            throw new BusinessException("用户不存在");
        }
        sysUserRoleMapper.deleteByUserId(id);
        sysUserMapper.deleteById(id);
    }

    @Override
    public SysUser getById(String id) {
        SysUser user = sysUserMapper.selectById(id);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        return user;
    }

    @Override
    public List<SysUser> list(String username, String realName, String phone, String deptId, Boolean isEnabled) {
        return sysUserMapper.selectList(username, realName, phone, deptId, isEnabled);
    }

    @Override
    @Transactional
    public void assignRoles(String userId, List<String> roleIds) {
        if (sysUserMapper.selectById(userId) == null) {
            throw new BusinessException("用户不存在");
        }
        sysUserRoleMapper.deleteByUserId(userId);
        if (roleIds == null || roleIds.isEmpty()) {
            return;
        }
        List<String> distinct = new ArrayList<>(new LinkedHashSet<>(roleIds));
        sysUserRoleMapper.batchInsert(userId, distinct);
    }

    @Override
    public void resetPassword(String userId, String password) {
        if (sysUserMapper.selectById(userId) == null) {
            throw new BusinessException("用户不存在");
        }
        if (password == null || password.isBlank()) {
            throw new BusinessException("密码不能为空");
        }
        if (password.length() < MIN_PASSWORD_LENGTH) {
            throw new BusinessException("密码至少 6 位");
        }
        sysUserMapper.updatePassword(userId, PasswordEncoder.encode(password));
    }
}
