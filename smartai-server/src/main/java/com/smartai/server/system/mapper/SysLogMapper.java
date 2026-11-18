package com.smartai.server.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.smartai.server.system.entity.SysLog;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface SysLogMapper extends BaseMapper<SysLog> {

    @Delete("DELETE FROM sys_log")
    int deleteAll();
}
