package com.smartai.server.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.smartai.server.system.entity.SysRole;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface SysRoleMapper extends BaseMapper<SysRole> {

    @Select("""
            SELECT r.*
            FROM sys_role r
            JOIN sys_user_role ur ON ur.role_id = r.id
            WHERE ur.user_id = #{userId}
            """)
    List<SysRole> selectByUserId(@Param("userId") String userId);
}
