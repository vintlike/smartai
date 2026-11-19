package com.smartai.mapper;

import com.smartai.entity.AigcDocsSlice;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface AigcDocsSliceMapper {

    List<AigcDocsSlice> selectList(@Param("docId") String docId,
                                   @Param("knowledgeId") String knowledgeId);

    List<AigcDocsSlice> search(@Param("knowledgeId") String knowledgeId,
                               @Param("keyword") String keyword,
                               @Param("limit") int limit);

    int insertBatch(@Param("list") List<AigcDocsSlice> list);

    int deleteByDocId(String docId);

    int deleteByKnowledgeId(String knowledgeId);

    int markTrainedBatch(@Param("ids") List<String> ids, @Param("vectorIds") List<String> vectorIds);
}
