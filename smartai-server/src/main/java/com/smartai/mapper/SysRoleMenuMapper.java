package com.smartai.mapper;

import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface SysRoleMenuMapper {

    int deleteByRoleId(String roleId);

    int deleteByMenuId(String menuId);

    int batchInsert(@Param("roleId") String roleId, @Param("menuIds") List<String> menuIds);
}
