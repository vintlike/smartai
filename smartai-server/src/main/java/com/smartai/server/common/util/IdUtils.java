package com.smartai.server.common.util;

import java.util.UUID;

public final class IdUtils {

    private IdUtils() {
    }

    public static String generate() {
        return UUID.randomUUID().toString().replace("-", "");
    }
}
