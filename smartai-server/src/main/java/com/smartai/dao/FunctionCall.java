package com.smartai.dao;

import java.util.Objects;

/**
 * 参考工程遗留的通用函数调用封装，主链路未使用，按要求保留。
 */
public final class FunctionCall {

    private final String name;
    private final String arguments;

    private FunctionCall(String name, String arguments) {
        this.name = name;
        this.arguments = arguments;
    }

    public static Builder builder() {
        return new Builder();
    }

    public String getName() {
        return name;
    }

    public String getArguments() {
        return arguments;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof FunctionCall that)) {
            return false;
        }
        return Objects.equals(name, that.name) && Objects.equals(arguments, that.arguments);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, arguments);
    }

    @Override
    public String toString() {
        return "FunctionCall{name='" + name + "', arguments='" + arguments + "'}";
    }

    public static final class Builder {

        private String name;
        private String arguments;

        private Builder() {
        }

        public Builder name(String name) {
            this.name = name;
            return this;
        }

        public Builder arguments(String arguments) {
            this.arguments = arguments;
            return this;
        }

        public FunctionCall build() {
            return new FunctionCall(name, arguments);
        }
    }
}
