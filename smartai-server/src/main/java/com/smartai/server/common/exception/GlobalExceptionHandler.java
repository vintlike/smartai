package com.smartai.server.common.exception;

import com.smartai.server.common.api.Result;
import com.smartai.server.log.OperationLogInterceptor;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 业务异常统一转换为 Result，HTTP 状态保持 200，便于前端直接展示 message。
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BizException.class)
    public Result<Void> handleBiz(BizException e, HttpServletRequest request) {
        markFailed(request);
        return Result.fail(e.getCode(), e.getMessage());
    }

    @ExceptionHandler(BindException.class)
    public Result<Void> handleBind(BindException e, HttpServletRequest request) {
        markFailed(request);
        String message = e.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(FieldError::getDefaultMessage)
                .orElse("请求参数不合法");
        return Result.fail(Result.BAD_REQUEST, message);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public Result<Void> handleConstraint(ConstraintViolationException e, HttpServletRequest request) {
        markFailed(request);
        String message = e.getConstraintViolations().stream()
                .findFirst()
                .map(violation -> violation.getMessage())
                .orElse("请求参数不合法");
        return Result.fail(Result.BAD_REQUEST, message);
    }

    @ExceptionHandler(DuplicateKeyException.class)
    public Result<Void> handleDuplicate(DuplicateKeyException e, HttpServletRequest request) {
        markFailed(request);
        return Result.fail(Result.BAD_REQUEST, "数据已存在，请勿重复提交");
    }

    @ExceptionHandler(AccessDeniedException.class)
    public Result<Void> handleAccessDenied(AccessDeniedException e, HttpServletRequest request) {
        markFailed(request);
        return Result.fail(Result.FORBIDDEN, "没有操作权限");
    }

    @ExceptionHandler(Exception.class)
    public Result<Void> handleException(Exception e, HttpServletRequest request) {
        markFailed(request);
        log.error("Unhandled exception", e);
        return Result.fail(Result.ERROR, "系统异常，请稍后重试");
    }

    private void markFailed(HttpServletRequest request) {
        request.setAttribute(OperationLogInterceptor.FAILED_ATTR, Boolean.TRUE);
    }
}
