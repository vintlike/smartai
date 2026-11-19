package com.smartai.service.impl;

import com.smartai.auth.JwtTokenService;
import com.smartai.auth.LoginUser;
import com.smartai.auth.PasswordEncoder;
import com.smartai.auth.UserContext;
import com.smartai.dto.ChangePasswordRequest;
import com.smartai.dto.LoginRequest;
import com.smartai.entity.SysLog;
import com.smartai.entity.SysRole;
import com.smartai.entity.SysUser;
import com.smartai.exception.BusinessException;
import com.smartai.exception.UnauthorizedException;
import com.smartai.mapper.SysLogMapper;
import com.smartai.mapper.SysMenuMapper;
import com.smartai.mapper.SysRoleMapper;
import com.smartai.mapper.SysUserMapper;
import com.smartai.service.AuthService;
import com.smartai.vo.AuthUserVO;
import com.smartai.vo.LoginVO;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
public class AuthServiceImpl implements AuthService {

    public static final int MIN_PASSWORD_LENGTH = 6;

    private final SysUserMapper sysUserMapper;
    private final SysRoleMapper sysRoleMapper;
    private final SysMenuMapper sysMenuMapper;
    private final SysLogMapper sysLogMapper;
    private final JwtTokenService jwtTokenService;

    public AuthServiceImpl(SysUserMapper sysUserMapper, SysRoleMapper sysRoleMapper,
                           SysMenuMapper sysMenuMapper, SysLogMapper sysLogMapper,
                           JwtTokenService jwtTokenService) {
        this.sysUserMapper = sysUserMapper;
        this.sysRoleMapper = sysRoleMapper;
        this.sysMenuMapper = sysMenuMapper;
        this.sysLogMapper = sysLogMapper;
        this.jwtTokenService = jwtTokenService;
    }

    @Override
    public LoginVO login(LoginRequest request, HttpServletRequest httpRequest) {
        String username = request.getUsername();
        SysUser user = sysUserMapper.selectByUsername(username);
        if (user == null || !PasswordEncoder.matches(request.getPassword(), user.getPassword())) {
            writeLog(username, "登录失败", SysLog.RESULT_FAIL, httpRequest);
            throw new BusinessException("用户名或密码错误");
        }
        if (!Boolean.TRUE.equals(user.getIsEnabled())) {
            writeLog(username, "登录失败：账号已锁定", SysLog.RESULT_FAIL, httpRequest);
            throw new BusinessException("账号已被锁定，请联系管理员");
        }
        if (!PasswordEncoder.isEncoded(user.getPassword())) {
            String encoded = PasswordEncoder.encode(request.getPassword());
            sysUserMapper.updatePassword(user.getId(), encoded);
            user.setPassword(encoded);
        }
        writeLog(username, "登录成功", SysLog.RESULT_SUCCESS, httpRequest);
        LoginUser loginUser = buildLoginUser(user);
        LoginVO result = new LoginVO();
        result.setToken(jwtTokenService.create(user.getId(), user.getUsername()));
        result.setUser(toAuthUser(loginUser));
        return result;
    }

    @Override
    public LoginUser loadLoginUser(String userId) {
        SysUser user = sysUserMapper.selectById(userId);
        if (user == null || !Boolean.TRUE.equals(user.getIsEnabled())) {
            return null;
        }
        return buildLoginUser(user);
    }

    @Override
    public AuthUserVO currentUser() {
        LoginUser loginUser = UserContext.get();
        if (loginUser == null) {
            throw new UnauthorizedException("请先登录");
        }
        return toAuthUser(loginUser);
    }

    @Override
    public void changePassword(ChangePasswordRequest request) {
        LoginUser loginUser = UserContext.get();
        if (loginUser == null) {
            throw new UnauthorizedException("请先登录");
        }
        SysUser user = sysUserMapper.selectById(loginUser.getId());
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        if (!PasswordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new BusinessException("原密码不正确");
        }
        if (request.getNewPassword().length() < MIN_PASSWORD_LENGTH) {
            throw new BusinessException("新密码至少 6 位");
        }
        sysUserMapper.updatePassword(user.getId(), PasswordEncoder.encode(request.getNewPassword()));
    }

    private LoginUser buildLoginUser(SysUser user) {
        LoginUser loginUser = new LoginUser();
        loginUser.setId(user.getId());
        loginUser.setUsername(user.getUsername());
        loginUser.setRealName(user.getRealName());
        loginUser.setAvatar(user.getAvatar());
        List<SysRole> roles = sysRoleMapper.selectByUserId(user.getId());
        List<String> roleCodes = new ArrayList<>();
        List<String> roleNames = new ArrayList<>();
        for (SysRole role : roles) {
            roleCodes.add(role.getCode());
            roleNames.add(role.getName());
        }
        loginUser.setRoleCodes(roleCodes);
        loginUser.setRoleNames(roleNames);
        boolean superAdmin = roleCodes.contains(LoginUser.SUPER_ADMIN_ROLE);
        loginUser.setSuperAdmin(superAdmin);
        if (superAdmin) {
            loginUser.setPerms(Collections.emptyList());
        } else {
            List<String> perms = sysMenuMapper.selectPermsByUserId(user.getId());
            loginUser.setPerms(perms == null ? new ArrayList<>() : perms);
        }
        return loginUser;
    }

    private AuthUserVO toAuthUser(LoginUser loginUser) {
        AuthUserVO vo = new AuthUserVO();
        vo.setId(loginUser.getId());
        vo.setUsername(loginUser.getUsername());
        vo.setRealName(loginUser.getRealName());
        vo.setAvatar(loginUser.getAvatar());
        vo.setRoles(loginUser.getRoleNames() == null ? new ArrayList<>() : new ArrayList<>(loginUser.getRoleNames()));
        vo.setRoleCodes(loginUser.getRoleCodes() == null ? new ArrayList<>() : new ArrayList<>(loginUser.getRoleCodes()));
        vo.setPerms(loginUser.getPerms() == null ? new ArrayList<>() : new ArrayList<>(loginUser.getPerms()));
        vo.setSuperAdmin(loginUser.isSuperAdmin());
        return vo;
    }

    private void writeLog(String username, String operation, Integer resultStatus, HttpServletRequest request) {
        SysLog log = new SysLog();
        log.setId(UUID.randomUUID().toString().replace("-", ""));
        log.setResultStatus(resultStatus);
        log.setUsername(username);
        log.setOperation(operation);
        log.setUrl("/api/auth/login");
        log.setDurationMs(0L);
        log.setMethod("POST");
        log.setIp(resolveIp(request));
        log.setUserAgent(request.getHeader("User-Agent"));
        log.setCreateTime(LocalDateTime.now());
        sysLogMapper.insert(log);
    }

    private String resolveIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
