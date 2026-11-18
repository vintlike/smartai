package com.smartai.server.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.smartai.server.common.api.PageQuery;
import com.smartai.server.common.api.PageResult;
import com.smartai.server.common.exception.BizException;
import com.smartai.server.common.util.IdUtils;
import com.smartai.server.system.dto.RoleSaveRequest;
import com.smartai.server.system.entity.SysRole;
import com.smartai.server.system.entity.SysRoleMenu;
import com.smartai.server.system.entity.SysUserRole;
import com.smartai.server.system.mapper.SysRoleMapper;
import com.smartai.server.system.mapper.SysRoleMenuMapper;
import com.smartai.server.system.mapper.SysUserRoleMapper;
import com.smartai.server.system.vo.RoleVO;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class SysRoleService {

    private static final String BUILT_IN_ADMIN = "administrator";

    private final SysRoleMapper roleMapper;
    private final SysRoleMenuMapper roleMenuMapper;
    private final SysUserRoleMapper userRoleMapper;

    public PageResult<RoleVO> page(PageQuery query) {
        Page<SysRole> page = roleMapper.selectPage(
                new Page<>(query.getPage(), query.getPageSize()),
                Wrappers.<SysRole>lambdaQuery()
                        .and(StringUtils.hasText(query.getKeyword()), wrapper -> wrapper
                                .like(SysRole::getName, query.getKeyword())
                                .or().like(SysRole::getCode, query.getKeyword()))
                        .orderByAsc(SysRole::getCode));
        return PageResult.of(page.getRecords().stream().map(this::toVO).toList(), page.getTotal());
    }

    public PageResult<RoleVO> rolesOfUser(String userId) {
        List<RoleVO> roles = roleMapper.selectByUserId(userId).stream().map(this::toVO).toList();
        return PageResult.of(roles, roles.size());
    }

    @Transactional
    public void create(RoleSaveRequest request) {
        if (!StringUtils.hasText(request.getName())) {
            throw new BizException("角色名称不能为空");
        }
        String code = resolveCode(request.getCode(), request.getName());
        if (roleMapper.selectCount(Wrappers.<SysRole>lambdaQuery().eq(SysRole::getCode, code)) > 0) {
            throw new BizException("角色标识已存在");
        }
        SysRole role = new SysRole();
        role.setId(IdUtils.generate());
        role.setName(request.getName().trim());
        role.setCode(code);
        role.setDescription(request.getDescription());
        roleMapper.insert(role);
    }

    public void update(String id, RoleSaveRequest request) {
        SysRole existing = require(id);
        SysRole update = new SysRole();
        update.setId(id);
        if (StringUtils.hasText(request.getName())) {
            update.setName(request.getName().trim());
        }
        if (StringUtils.hasText(request.getCode()) && !request.getCode().equals(existing.getCode())) {
            if (BUILT_IN_ADMIN.equals(existing.getCode())) {
                throw new BizException("内置管理员角色标识不能修改");
            }
            long duplicated = roleMapper.selectCount(Wrappers.<SysRole>lambdaQuery()
                    .eq(SysRole::getCode, request.getCode())
                    .ne(SysRole::getId, id));
            if (duplicated > 0) {
                throw new BizException("角色标识已存在");
            }
            update.setCode(request.getCode().trim());
        }
        update.setDescription(request.getDescription());
        roleMapper.updateById(update);
    }

    @Transactional
    public void delete(String id) {
        SysRole role = require(id);
        if (BUILT_IN_ADMIN.equals(role.getCode())) {
            throw new BizException("内置管理员角色不能删除");
        }
        roleMenuMapper.delete(Wrappers.<SysRoleMenu>lambdaQuery().eq(SysRoleMenu::getRoleId, id));
        userRoleMapper.delete(Wrappers.<SysUserRole>lambdaQuery().eq(SysUserRole::getRoleId, id));
        roleMapper.deleteById(id);
    }

    @Transactional
    public void assignMenus(String roleId, List<String> menuIds) {
        require(roleId);
        roleMenuMapper.delete(Wrappers.<SysRoleMenu>lambdaQuery().eq(SysRoleMenu::getRoleId, roleId));
        if (menuIds == null) {
            return;
        }
        for (String menuId : menuIds.stream().filter(StringUtils::hasText).distinct().toList()) {
            SysRoleMenu link = new SysRoleMenu();
            link.setRoleId(roleId);
            link.setMenuId(menuId);
            roleMenuMapper.insert(link);
        }
    }

    private String resolveCode(String code, String name) {
        if (StringUtils.hasText(code)) {
            return code.trim();
        }
        String fallback = name.trim().toLowerCase().replaceAll("[^a-z0-9]+", "_");
        return fallback.isBlank() ? IdUtils.generate().substring(0, 16) : fallback;
    }

    private SysRole require(String id) {
        SysRole role = roleMapper.selectById(id);
        if (role == null) {
            throw new BizException("角色不存在");
        }
        return role;
    }

    private RoleVO toVO(SysRole role) {
        return RoleVO.builder()
                .id(role.getId())
                .name(role.getName())
                .code(role.getCode())
                .description(role.getDescription())
                .build();
    }
}
