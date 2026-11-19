package com.smartai.mapper;

import com.smartai.entity.SysMenu;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface SysMenuMapper {

    SysMenu selectById(String id);

    List<SysMenu> selectList(@Param("name") String name,
                             @Param("type") String type,
                             @Param("parentId") String parentId);

    List<SysMenu> selectByRoleId(String roleId);

    List<SysMenu> selectByUserId(String userId);

    List<String> selectPermsByUserId(String userId);

    int insert(SysMenu menu);

    int updateById(SysMenu menu);

    int deleteById(String id);
}
