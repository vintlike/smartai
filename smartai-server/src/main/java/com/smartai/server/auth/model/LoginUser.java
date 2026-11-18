package com.smartai.server.auth.model;

import java.util.List;
import java.util.Set;

public record LoginUser(
        String id,
        String username,
        String realName,
        List<String> roleCodes,
        Set<String> perms,
        boolean admin
) {
}
