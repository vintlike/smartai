package com.smartai.mapper;

import com.smartai.entity.SysUserRole;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface SysUserRoleMapper {

    int deleteByUserId(String userId);

    int deleteByRoleId(String roleId);

    int batchInsert(@Param("userId") String userId, @Param("roleIds") List<String> roleIds);

    List<SysUserRole> selectByUserIds(@Param("userIds") List<String> userIds);
}
