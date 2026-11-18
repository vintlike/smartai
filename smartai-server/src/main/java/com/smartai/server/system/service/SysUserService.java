package com.smartai.server.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.smartai.server.auth.model.CurrentUser;
import com.smartai.server.auth.model.LoginUser;
import com.smartai.server.common.api.PageQuery;
import com.smartai.server.common.api.PageResult;
import com.smartai.server.common.api.Result;
import com.smartai.server.common.exception.BizException;
import com.smartai.server.common.util.IdUtils;
import com.smartai.server.system.dto.UserSaveRequest;
import com.smartai.server.system.entity.SysDept;
import com.smartai.server.system.entity.SysRole;
import com.smartai.server.system.entity.SysUser;
import com.smartai.server.system.entity.SysUserRole;
import com.smartai.server.system.mapper.SysDeptMapper;
import com.smartai.server.system.mapper.SysRoleMapper;
import com.smartai.server.system.mapper.SysUserMapper;
import com.smartai.server.system.mapper.SysUserRoleMapper;
import com.smartai.server.system.vo.RoleVO;
import com.smartai.server.system.vo.UserVO;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class SysUserService {

    private static final String DEFAULT_PASSWORD = "123456";

    private final SysUserMapper userMapper;
    private final SysRoleMapper roleMapper;
    private final SysUserRoleMapper userRoleMapper;
    private final SysDeptMapper deptMapper;
    private final PasswordEncoder passwordEncoder;

    public PageResult<UserVO> page(PageQuery query, String deptId, Integer isEnabled) {
        Page<SysUser> page = userMapper.selectPage(
                new Page<>(query.getPage(), query.getPageSize()),
                Wrappers.<SysUser>lambdaQuery()
                        .and(StringUtils.hasText(query.getKeyword()), wrapper -> wrapper
                                .like(SysUser::getUsername, query.getKeyword())
                                .or().like(SysUser::getRealName, query.getKeyword())
                                .or().like(SysUser::getPhone, query.getKeyword())
                                .or().like(SysUser::getEmail, query.getKeyword()))
                        .eq(StringUtils.hasText(deptId), SysUser::getDeptId, deptId)
                        .eq(isEnabled != null, SysUser::getIsEnabled, isEnabled)
                        .orderByDesc(SysUser::getCreateTime));

        List<SysUser> records = page.getRecords();
        if (records.isEmpty()) {
            return PageResult.of(List.of(), page.getTotal());
        }

        List<String> userIds = records.stream().map(SysUser::getId).toList();
        List<SysUserRole> links = userRoleMapper.selectList(
                Wrappers.<SysUserRole>lambdaQuery().in(SysUserRole::getUserId, userIds));
        Map<String, List<String>> roleIdsByUser = links.stream().collect(Collectors.groupingBy(
                SysUserRole::getUserId, Collectors.mapping(SysUserRole::getRoleId, Collectors.toList())));
        Set<String> roleIds = links.stream().map(SysUserRole::getRoleId).collect(Collectors.toSet());
        Map<String, SysRole> roles = roleIds.isEmpty()
                ? Map.of()
                : roleMapper.selectByIds(roleIds).stream().collect(Collectors.toMap(SysRole::getId, Function.identity()));

        Set<String> deptIds = records.stream()
                .map(SysUser::getDeptId)
                .filter(StringUtils::hasText)
                .collect(Collectors.toSet());
        Map<String, String> deptNames = deptIds.isEmpty()
                ? Map.of()
                : deptMapper.selectByIds(deptIds).stream().collect(Collectors.toMap(SysDept::getId, SysDept::getName));

        List<UserVO> list = records.stream()
                .map(user -> toVO(user, roleIdsByUser.getOrDefault(user.getId(), List.of()), roles, deptNames))
                .toList();
        return PageResult.of(list, page.getTotal());
    }

    public PageResult<RoleVO> rolesOfUser(String userId) {
        require(userId);
        List<RoleVO> roles = roleMapper.selectByUserId(userId).stream()
                .map(role -> RoleVO.builder()
                        .id(role.getId())
                        .name(role.getName())
                        .code(role.getCode())
                        .description(role.getDescription())
                        .build())
                .toList();
        return PageResult.of(roles, roles.size());
    }

    @Transactional
    public void create(UserSaveRequest request) {
        if (!StringUtils.hasText(request.getUsername())) {
            throw new BizException("用户名不能为空");
        }
        String username = request.getUsername().trim();
        if (userMapper.selectCount(Wrappers.<SysUser>lambdaQuery().eq(SysUser::getUsername, username)) > 0) {
            throw new BizException("用户名已存在");
        }
        SysUser user = new SysUser();
        user.setId(IdUtils.generate());
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(
                StringUtils.hasText(request.getPassword()) ? request.getPassword() : DEFAULT_PASSWORD));
        user.setRealName(request.getRealName());
        user.setGender(request.getGender());
        user.setPhone(request.getPhone());
        user.setEmail(request.getEmail());
        user.setDeptId(request.getDeptId());
        user.setAvatar(request.getAvatar());
        user.setIsEnabled(request.getIsEnabled() == null ? 1 : request.getIsEnabled());
        user.setCreateTime(LocalDateTime.now());
        userMapper.insert(user);
        replaceRoles(user.getId(), request.getRoleIds());
    }

    @Transactional
    public void update(String id, UserSaveRequest request) {
        LoginUser current = CurrentUser.require();
        boolean self = current.id().equals(id);
        boolean canManage = current.admin() || current.perms().contains("upms:user:update");
        if (!canManage && !self) {
            throw new BizException(Result.FORBIDDEN, "没有操作权限");
        }
        if (!canManage) {
            // 非管理权限用户只能维护自己的基础资料
            request.setUsername(null);
            request.setPassword(null);
            request.setDeptId(null);
            request.setIsEnabled(null);
            request.setRoleIds(null);
        }

        SysUser existing = require(id);
        SysUser update = new SysUser();
        update.setId(id);

        if (request.getUsername() != null && !request.getUsername().equals(existing.getUsername())) {
            if (!StringUtils.hasText(request.getUsername())) {
                throw new BizException("用户名不能为空");
            }
            String username = request.getUsername().trim();
            long duplicated = userMapper.selectCount(Wrappers.<SysUser>lambdaQuery()
                    .eq(SysUser::getUsername, username)
                    .ne(SysUser::getId, id));
            if (duplicated > 0) {
                throw new BizException("用户名已存在");
            }
            update.setUsername(username);
        }
        if (StringUtils.hasText(request.getPassword())) {
            update.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        update.setRealName(request.getRealName());
        update.setGender(request.getGender());
        update.setPhone(request.getPhone());
        update.setEmail(request.getEmail());
        update.setDeptId(request.getDeptId());
        update.setAvatar(request.getAvatar());
        update.setIsEnabled(request.getIsEnabled());
        userMapper.updateById(update);

        if (request.getRoleIds() != null) {
            replaceRoles(id, request.getRoleIds());
        }
    }

    @Transactional
    public void delete(String id) {
        if (id.equals(CurrentUser.id())) {
            throw new BizException("不能删除当前登录用户");
        }
        require(id);
        userRoleMapper.delete(Wrappers.<SysUserRole>lambdaQuery().eq(SysUserRole::getUserId, id));
        userMapper.deleteById(id);
    }

    @Transactional
    public void assignRoles(String id, List<String> roleIds) {
        require(id);
        replaceRoles(id, roleIds);
    }

    private void replaceRoles(String userId, List<String> roleIds) {
        if (roleIds == null) {
            return;
        }
        userRoleMapper.delete(Wrappers.<SysUserRole>lambdaQuery().eq(SysUserRole::getUserId, userId));
        for (String roleId : roleIds.stream().filter(StringUtils::hasText).distinct().toList()) {
            SysUserRole link = new SysUserRole();
            link.setUserId(userId);
            link.setRoleId(roleId);
            userRoleMapper.insert(link);
        }
    }

    private SysUser require(String id) {
        SysUser user = userMapper.selectById(id);
        if (user == null) {
            throw new BizException("用户不存在");
        }
        return user;
    }

    private UserVO toVO(SysUser user, List<String> roleIds, Map<String, SysRole> roleMap, Map<String, String> deptNames) {
        List<String> roleNames = roleIds.stream()
                .map(roleMap::get)
                .filter(role -> role != null)
                .map(SysRole::getName)
                .toList();
        return UserVO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .realName(user.getRealName())
                .gender(user.getGender())
                .phone(user.getPhone())
                .email(user.getEmail())
                .deptId(user.getDeptId())
                .deptName(StringUtils.hasText(user.getDeptId()) ? deptNames.get(user.getDeptId()) : null)
                .avatar(user.getAvatar())
                .isEnabled(user.getIsEnabled())
                .createTime(user.getCreateTime())
                .roles(roleNames)
                .roleIds(roleIds)
                .build();
    }
}
