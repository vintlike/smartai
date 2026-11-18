package com.smartai.server.log;

import com.smartai.server.auth.model.CurrentUser;
import com.smartai.server.auth.model.LoginUser;
import com.smartai.server.common.util.ClientIp;
import com.smartai.server.system.service.SysLogService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * 统一记录后台写操作日志，无需在业务方法上逐个加注解。
 */
@Component
@RequiredArgsConstructor
public class OperationLogInterceptor implements HandlerInterceptor {

    private static final String START_ATTR = OperationLogInterceptor.class.getName() + ".start";
    public static final String FAILED_ATTR = OperationLogInterceptor.class.getName() + ".failed";
    private static final Set<String> WRITE_METHODS = Set.of("POST", "PUT", "PATCH", "DELETE");

    private final SysLogService sysLogService;
    private final OperationLogProperties properties;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        request.setAttribute(START_ATTR, System.nanoTime());
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        if (!properties.isEnabled()) {
            return;
        }
        String method = request.getMethod();
        String uri = request.getRequestURI();
        if (!WRITE_METHODS.contains(method) || !uri.startsWith("/api/") || "/api/auth/login".equals(uri)) {
            return;
        }
        LoginUser user = CurrentUser.get();
        if (user == null) {
            return;
        }
        Object start = request.getAttribute(START_ATTR);
        long durationMs = start instanceof Long nanoStart ? (System.nanoTime() - nanoStart) / 1_000_000 : 0;
        boolean success = ex == null && response.getStatus() < 400
                && !Boolean.TRUE.equals(request.getAttribute(FAILED_ATTR));
        sysLogService.recordOperation(
                user.username(),
                method,
                uri,
                request.getQueryString(),
                durationMs,
                ClientIp.resolve(request),
                request.getHeader("User-Agent"),
                success);
    }
}
