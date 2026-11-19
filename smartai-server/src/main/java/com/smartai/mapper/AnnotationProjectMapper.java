package com.smartai.mapper;

import com.smartai.entity.AnnotationProject;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface AnnotationProjectMapper {

    AnnotationProject selectById(String id);

    AnnotationProject selectByName(String name);

    List<AnnotationProject> selectList(@Param("keyword") String keyword);

    int insert(AnnotationProject project);

    int updateById(AnnotationProject project);

    int deleteById(String id);
}
