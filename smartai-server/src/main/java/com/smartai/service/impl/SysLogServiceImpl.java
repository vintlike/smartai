package com.smartai.service.impl;

import com.smartai.entity.SysLog;
import com.smartai.exception.BusinessException;
import com.smartai.mapper.SysLogMapper;
import com.smartai.service.SysLogService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class SysLogServiceImpl implements SysLogService {

    private final SysLogMapper sysLogMapper;

    public SysLogServiceImpl(SysLogMapper sysLogMapper) {
        this.sysLogMapper = sysLogMapper;
    }

    @Override
    public SysLog create(SysLog log) {
        log.setId(UUID.randomUUID().toString().replace("-", ""));
        if (log.getCreateTime() == null) {
            log.setCreateTime(LocalDateTime.now());
        }
        if (log.getResultStatus() == null) {
            log.setResultStatus(SysLog.RESULT_SUCCESS);
        }
        sysLogMapper.insert(log);
        return log;
    }

    @Override
    public void delete(String id) {
        if (sysLogMapper.selectById(id) == null) {
            throw new BusinessException("日志不存在");
        }
        sysLogMapper.deleteById(id);
    }

    @Override
    public SysLog getById(String id) {
        SysLog log = sysLogMapper.selectById(id);
        if (log == null) {
            throw new BusinessException("日志不存在");
        }
        return log;
    }

    @Override
    public List<SysLog> list(String username, String operation, Integer resultStatus) {
        return sysLogMapper.selectList(username, operation, resultStatus);
    }

    @Override
    public void deleteAll() {
        sysLogMapper.deleteAll();
    }
}
