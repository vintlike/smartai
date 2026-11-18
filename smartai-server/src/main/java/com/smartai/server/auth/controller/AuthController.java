package com.smartai.server.auth.controller;

import com.smartai.server.auth.dto.ChangePasswordRequest;
import com.smartai.server.auth.dto.LoginRequest;
import com.smartai.server.auth.service.AuthService;
import com.smartai.server.auth.vo.LoginVO;
import com.smartai.server.auth.vo.UserInfoVO;
import com.smartai.server.common.api.Result;
import com.smartai.server.common.util.ClientIp;
import com.smartai.server.system.service.SysLogService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final SysLogService sysLogService;

    @PostMapping("/login")
    public Result<LoginVO> login(@Valid @RequestBody LoginRequest request, HttpServletRequest servletRequest) {
        try {
            LoginVO login = authService.login(request);
            sysLogService.recordLogin(request.username(), true,
                    ClientIp.resolve(servletRequest), servletRequest.getHeader("User-Agent"));
            return Result.ok(login);
        } catch (RuntimeException e) {
            sysLogService.recordLogin(request.username(), false,
                    ClientIp.resolve(servletRequest), servletRequest.getHeader("User-Agent"));
            throw e;
        }
    }

    @PostMapping("/logout")
    public Result<Void> logout() {
        return Result.ok();
    }

    @GetMapping("/current")
    public Result<UserInfoVO> current() {
        return Result.ok(authService.currentUser());
    }

    @PutMapping("/password")
    public Result<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(request);
        return Result.ok();
    }
}
