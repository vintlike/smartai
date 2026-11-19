package com.smartai.mapper;

import com.smartai.entity.AnnotationCategory;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface AnnotationCategoryMapper {

    AnnotationCategory selectById(String id);

    List<AnnotationCategory> selectList(@Param("keyword") String keyword);

    int countByParentId(String parentId);

    int insert(AnnotationCategory category);

    int updateById(AnnotationCategory category);

    int updateSort(@Param("id") String id, @Param("sortOrder") Integer sortOrder);

    int deleteById(String id);
}
