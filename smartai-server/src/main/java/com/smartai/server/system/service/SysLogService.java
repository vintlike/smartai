package com.smartai.server.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.smartai.server.common.api.PageQuery;
import com.smartai.server.common.api.PageResult;
import com.smartai.server.common.util.IdUtils;
import com.smartai.server.system.entity.SysLog;
import com.smartai.server.system.mapper.SysLogMapper;
import com.smartai.server.system.vo.LogVO;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Slf4j
@Service
@RequiredArgsConstructor
public class SysLogService {

    private static final int MAX_OPERATION = 100;
    private static final int MAX_URL = 255;
    private static final int MAX_IP = 50;
    private static final int MAX_USER_AGENT = 255;
    private static final int MAX_PARAMS = 2000;

    private final SysLogMapper logMapper;

    public PageResult<LogVO> page(PageQuery query, Integer resultStatus) {
        Page<SysLog> page = logMapper.selectPage(
                new Page<>(query.getPage(), query.getPageSize()),
                Wrappers.<SysLog>lambdaQuery()
                        .and(StringUtils.hasText(query.getKeyword()), wrapper -> wrapper
                                .like(SysLog::getUsername, query.getKeyword())
                                .or()
                                .like(SysLog::getOperation, query.getKeyword()))
                        .eq(resultStatus != null, SysLog::getResultStatus, resultStatus)
                        .orderByDesc(SysLog::getCreateTime));
        return PageResult.of(page.getRecords().stream().map(this::toVO).toList(), page.getTotal());
    }

    public void deleteAll() {
        logMapper.deleteAll();
    }

    public void delete(String id) {
        logMapper.deleteById(id);
    }

    public void recordLogin(String username, boolean success, String ip, String userAgent) {
        SysLog log = new SysLog();
        log.setId(IdUtils.generate());
        log.setResultStatus(success ? 1 : 2);
        log.setUsername(truncate(username, 50));
        log.setOperation(success ? "登录成功" : "登录失败");
        log.setUrl("/api/auth/login");
        log.setMethod("POST");
        log.setIp(truncate(ip, MAX_IP));
        log.setUserAgent(truncate(userAgent, MAX_USER_AGENT));
        log.setCreateTime(LocalDateTime.now());
        safeInsert(log);
    }

    public void recordOperation(String username, String method, String uri, String query,
                                long durationMs, String ip, String userAgent, boolean success) {
        SysLog log = new SysLog();
        log.setId(IdUtils.generate());
        log.setResultStatus(success ? 1 : 2);
        log.setUsername(truncate(username, 50));
        log.setOperation(truncate(method + " " + uri, MAX_OPERATION));
        log.setUrl(truncate(uri, MAX_URL));
        log.setDurationMs(durationMs);
        log.setMethod(truncate(method, 100));
        log.setRequestParams(truncate(maskSensitive(query), MAX_PARAMS));
        log.setIp(truncate(ip, MAX_IP));
        log.setUserAgent(truncate(userAgent, MAX_USER_AGENT));
        log.setCreateTime(LocalDateTime.now());
        safeInsert(log);
    }

    private void safeInsert(SysLog entry) {
        try {
            logMapper.insert(entry);
        } catch (Exception e) {
            log.warn("写入操作日志失败: {}", e.getMessage());
        }
    }

    private LogVO toVO(SysLog log) {
        return LogVO.builder()
                .id(log.getId())
                .resultStatus(log.getResultStatus())
                .username(log.getUsername())
                .operation(log.getOperation())
                .url(log.getUrl())
                .durationMs(log.getDurationMs())
                .method(log.getMethod())
                .requestParams(log.getRequestParams())
                .ip(log.getIp())
                .userAgent(log.getUserAgent())
                .createTime(log.getCreateTime())
                .build();
    }

    private static String maskSensitive(String value) {
        if (value == null) {
            return null;
        }
        return value.replaceAll("(?i)([^&=]*password[^&=]*)=([^&]*)", "$1=***");
    }

    private static String truncate(String value, int maxLength) {
        if (value == null || value.length() <= maxLength) {
            return value;
        }
        return value.substring(0, maxLength);
    }
}
