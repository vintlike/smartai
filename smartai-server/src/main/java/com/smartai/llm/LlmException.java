package com.smartai.llm;

/**
 * 大模型调用异常。
 */
public class LlmException extends RuntimeException {

    private final Integer httpStatus;
    private final String errorCode;
    private final boolean retryable;

    public LlmException(String message) {
        this(message, null, null, false);
    }

    public LlmException(String message, boolean retryable) {
        this(message, null, null, retryable);
    }

    public LlmException(String message, Throwable cause, boolean retryable) {
        super(message, cause);
        this.httpStatus = null;
        this.errorCode = null;
        this.retryable = retryable;
    }

    public LlmException(String message, Integer httpStatus, String errorCode, boolean retryable) {
        super(message);
        this.httpStatus = httpStatus;
        this.errorCode = errorCode;
        this.retryable = retryable;
    }

    public Integer getHttpStatus() {
        return httpStatus;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public boolean isRetryable() {
        return retryable;
    }
}
