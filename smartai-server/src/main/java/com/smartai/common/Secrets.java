package com.smartai.common;

/**
 * 敏感字段脱敏工具。
 */
public final class Secrets {

    public static final String MASK = "********";

    private Secrets() {
    }

    public static String mask(String value) {
        if (value == null) {
            return null;
        }
        return value.isEmpty() ? value : MASK;
    }

    public static boolean isUnchanged(String value) {
        return value == null || value.isBlank() || MASK.equals(value);
    }
}
