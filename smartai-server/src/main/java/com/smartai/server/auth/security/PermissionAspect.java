package com.smartai.server.auth.security;

import com.smartai.server.auth.model.CurrentUser;
import com.smartai.server.auth.model.LoginUser;
import com.smartai.server.common.api.Result;
import com.smartai.server.common.exception.BizException;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class PermissionAspect {

    @Before("@annotation(requiresPerm)")
    public void check(RequiresPerm requiresPerm) {
        LoginUser user = CurrentUser.require();
        if (user.admin() || user.perms().contains(requiresPerm.value())) {
            return;
        }
        throw new BizException(Result.FORBIDDEN, "没有操作权限");
    }
}
