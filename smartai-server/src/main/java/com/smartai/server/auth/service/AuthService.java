package com.smartai.server.auth.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.smartai.server.auth.dto.ChangePasswordRequest;
import com.smartai.server.auth.dto.LoginRequest;
import com.smartai.server.auth.model.CurrentUser;
import com.smartai.server.auth.model.LoginUser;
import com.smartai.server.auth.security.JwtTokenProvider;
import com.smartai.server.auth.vo.LoginVO;
import com.smartai.server.auth.vo.UserInfoVO;
import com.smartai.server.common.api.Result;
import com.smartai.server.common.exception.BizException;
import com.smartai.server.system.entity.SysDept;
import com.smartai.server.system.entity.SysRole;
import com.smartai.server.system.entity.SysUser;
import com.smartai.server.system.mapper.SysDeptMapper;
import com.smartai.server.system.mapper.SysRoleMapper;
import com.smartai.server.system.mapper.SysUserMapper;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final SysUserMapper userMapper;
    private final SysRoleMapper roleMapper;
    private final SysDeptMapper deptMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public LoginVO login(LoginRequest request) {
        SysUser user = userMapper.selectOne(Wrappers.<SysUser>lambdaQuery()
                .eq(SysUser::getUsername, request.username())
                .last("LIMIT 1"));
        if (user == null || !StringUtils.hasText(user.getPassword())
                || !passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BizException("用户名或密码错误");
        }
        if (!Integer.valueOf(1).equals(user.getIsEnabled())) {
            throw new BizException("账号已被禁用");
        }
        List<SysRole> roles = roleMapper.selectByUserId(user.getId());
        return LoginVO.builder()
                .token(tokenProvider.generate(user.getId(), user.getUsername()))
                .user(buildUserInfo(user, roles))
                .build();
    }

    public UserInfoVO currentUser() {
        LoginUser loginUser = CurrentUser.require();
        SysUser user = userMapper.selectById(loginUser.id());
        if (user == null) {
            throw new BizException(Result.UNAUTHORIZED, "登录状态已失效，请重新登录");
        }
        return buildUserInfo(user, roleMapper.selectByUserId(user.getId()));
    }

    public void changePassword(ChangePasswordRequest request) {
        SysUser user = userMapper.selectById(CurrentUser.id());
        if (user == null) {
            throw new BizException(Result.UNAUTHORIZED, "登录状态已失效，请重新登录");
        }
        if (!StringUtils.hasText(user.getPassword())
                || !passwordEncoder.matches(request.oldPassword(), user.getPassword())) {
            throw new BizException("原密码不正确");
        }
        if (passwordEncoder.matches(request.newPassword(), user.getPassword())) {
            throw new BizException("新密码不能与原密码相同");
        }
        SysUser update = new SysUser();
        update.setId(user.getId());
        update.setPassword(passwordEncoder.encode(request.newPassword()));
        userMapper.updateById(update);
    }

    private UserInfoVO buildUserInfo(SysUser user, List<SysRole> roles) {
        String deptName = null;
        if (StringUtils.hasText(user.getDeptId())) {
            SysDept dept = deptMapper.selectById(user.getDeptId());
            if (dept != null) {
                deptName = dept.getName();
            }
        }
        return UserInfoVO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .name(StringUtils.hasText(user.getRealName()) ? user.getRealName() : user.getUsername())
                .account(StringUtils.hasText(user.getEmail()) ? user.getEmail() : user.getUsername())
                .avatar(user.getAvatar())
                .roles(roles.stream().map(SysRole::getName).toList())
                .realName(user.getRealName())
                .sex(user.getGender())
                .email(user.getEmail())
                .phone(user.getPhone())
                .deptName(deptName)
                .createTime(user.getCreateTime())
                .build();
    }
}
