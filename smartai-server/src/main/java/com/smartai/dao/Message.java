package com.smartai.dao;

import java.util.Objects;

/**
 * 参考工程遗留的通用消息封装，主链路未使用，按要求保留。
 */
public final class Message {

    private final Role role;
    private final String content;
    private final String name;
    private final FunctionCall functionCall;

    private Message(Role role, String content, String name, FunctionCall functionCall) {
        this.role = role;
        this.content = content;
        this.name = name;
        this.functionCall = functionCall;
    }

    public static Message system(String content) {
        return builder().role(Role.SYSTEM).content(content).build();
    }

    public static Message user(String content) {
        return builder().role(Role.USER).content(content).build();
    }

    public static Message assistant(String content) {
        return builder().role(Role.ASSISTANT).content(content).build();
    }

    public static Builder builder() {
        return new Builder();
    }

    public Role getRole() {
        return role;
    }

    public String getContent() {
        return content;
    }

    public String getName() {
        return name;
    }

    public FunctionCall getFunctionCall() {
        return functionCall;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Message message)) {
            return false;
        }
        return role == message.role
                && Objects.equals(content, message.content)
                && Objects.equals(name, message.name)
                && Objects.equals(functionCall, message.functionCall);
    }

    @Override
    public int hashCode() {
        return Objects.hash(role, content, name, functionCall);
    }

    @Override
    public String toString() {
        return "Message{role=" + role + ", content='" + content + "', name='" + name
                + "', functionCall=" + functionCall + "}";
    }

    public static final class Builder {

        private Role role;
        private String content;
        private String name;
        private FunctionCall functionCall;

        private Builder() {
        }

        public Builder role(Role role) {
            this.role = role;
            return this;
        }

        public Builder content(String content) {
            this.content = content;
            return this;
        }

        public Builder name(String name) {
            this.name = name;
            return this;
        }

        public Builder functionCall(FunctionCall functionCall) {
            this.functionCall = functionCall;
            return this;
        }

        public Message build() {
            return new Message(role, content, name, functionCall);
        }
    }
}
