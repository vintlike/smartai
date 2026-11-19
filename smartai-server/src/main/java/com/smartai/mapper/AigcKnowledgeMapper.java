package com.smartai.mapper;

import com.smartai.entity.AigcKnowledge;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface AigcKnowledgeMapper {

    AigcKnowledge selectById(String id);

    List<AigcKnowledge> selectList(@Param("name") String name, @Param("userId") String userId);

    int countByEmbedStoreId(String embedStoreId);

    int insert(AigcKnowledge knowledge);

    int updateById(AigcKnowledge knowledge);

    int deleteById(String id);
}
