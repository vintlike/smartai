package com.smartai.mapper;

import com.smartai.entity.AigcDocsSliceVector;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface AigcDocsSliceVectorMapper {

    int insertBatch(@Param("list") List<AigcDocsSliceVector> list);

    int deleteByDocId(String docId);

    int deleteByKnowledgeId(String knowledgeId);
}
