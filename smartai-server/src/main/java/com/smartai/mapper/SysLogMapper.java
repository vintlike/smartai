package com.smartai.mapper;

import com.smartai.entity.SysLog;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface SysLogMapper {

    SysLog selectById(String id);

    List<SysLog> selectList(@Param("username") String username,
                            @Param("operation") String operation,
                            @Param("resultStatus") Integer resultStatus);

    int insert(SysLog log);

    int deleteById(String id);

    int deleteAll();
}
