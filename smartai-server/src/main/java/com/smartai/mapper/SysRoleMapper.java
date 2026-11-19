package com.smartai.mapper;

import com.smartai.entity.SysRole;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface SysRoleMapper {

    SysRole selectById(String id);

    List<SysRole> selectList(@Param("name") String name, @Param("code") String code);

    List<SysRole> selectByUserId(String userId);

    int insert(SysRole role);

    int updateById(SysRole role);

    int deleteById(String id);
}
