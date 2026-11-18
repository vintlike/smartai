package com.smartai.server.auth.model;

import com.smartai.server.common.api.Result;
import com.smartai.server.common.exception.BizException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class CurrentUser {

    private CurrentUser() {
    }

    public static LoginUser get() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof LoginUser loginUser) {
            return loginUser;
        }
        return null;
    }

    public static LoginUser require() {
        LoginUser loginUser = get();
        if (loginUser == null) {
            throw new BizException(Result.UNAUTHORIZED, "登录状态已失效，请重新登录");
        }
        return loginUser;
    }

    public static String id() {
        return require().id();
    }
}
