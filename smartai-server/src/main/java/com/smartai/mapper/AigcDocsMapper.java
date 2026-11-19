package com.smartai.mapper;

import com.smartai.entity.AigcDocs;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface AigcDocsMapper {

    AigcDocs selectById(String id);

    List<AigcDocs> selectList(@Param("knowledgeId") String knowledgeId,
                              @Param("name") String name,
                              @Param("sourceType") String sourceType);

    List<AigcDocs> selectByKnowledgeId(String knowledgeId);

    int insert(AigcDocs docs);

    int updateById(AigcDocs docs);

    int deleteById(String id);

    int deleteByKnowledgeId(String knowledgeId);
}
