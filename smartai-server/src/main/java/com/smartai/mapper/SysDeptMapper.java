package com.smartai.mapper;

import com.smartai.entity.SysDept;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface SysDeptMapper {

    SysDept selectById(String id);

    List<SysDept> selectList(@Param("name") String name, @Param("parentId") String parentId);

    int insert(SysDept dept);

    int updateById(SysDept dept);

    int deleteById(String id);

    int deleteByParentId(String parentId);
}
