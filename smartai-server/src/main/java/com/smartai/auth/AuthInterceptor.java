package com.smartai.auth;

import com.smartai.exception.ForbiddenException;
import com.smartai.exception.UnauthorizedException;
import com.smartai.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.AnnotatedElementUtils;
import org.springframework.stereotype.Component;
import org.springframework.web.cors.CorsUtils;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    private final JwtTokenService jwtTokenService;
    private final AuthService authService;

    public AuthInterceptor(JwtTokenService jwtTokenService, AuthService authService) {
        this.jwtTokenService = jwtTokenService;
        this.authService = authService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (CorsUtils.isPreFlightRequest(request)) {
            return true;
        }
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            throw new UnauthorizedException("请先登录");
        }
        String token = header.substring("Bearer ".length()).trim();
        if (token.isEmpty()) {
            throw new UnauthorizedException("请先登录");
        }
        String userId = jwtTokenService.resolveUserId(token);
        if (userId == null) {
            throw new UnauthorizedException("登录状态已失效，请重新登录");
        }
        LoginUser user = authService.loadLoginUser(userId);
        if (user == null) {
            throw new UnauthorizedException("登录状态已失效，请重新登录");
        }
        UserContext.set(user);

        if (handler instanceof HandlerMethod handlerMethod) {
            RequiresPermission permission = AnnotatedElementUtils.findMergedAnnotation(
                    handlerMethod.getMethod(), RequiresPermission.class);
            if (permission == null) {
                permission = AnnotatedElementUtils.findMergedAnnotation(
                        handlerMethod.getBeanType(), RequiresPermission.class);
            }
            if (permission != null) {
                String[] required = permission.value();
                boolean allowed = required.length == 0;
                for (String perm : required) {
                    if (user.hasPerm(perm)) {
                        allowed = true;
                        break;
                    }
                }
                if (!allowed) {
                    throw new ForbiddenException("没有该操作权限");
                }
            }
        }
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response,
                                Object handler, Exception ex) {
        UserContext.clear();
    }
}
