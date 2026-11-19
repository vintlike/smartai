package com.smartai.service;

import com.smartai.entity.SysLog;

import java.util.List;

public interface SysLogService {

    SysLog create(SysLog log);

    void delete(String id);

    SysLog getById(String id);

    List<SysLog> list(String username, String operation, Integer resultStatus);

    void deleteAll();
}
