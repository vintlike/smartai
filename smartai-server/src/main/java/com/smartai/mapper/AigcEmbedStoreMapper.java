package com.smartai.mapper;

import com.smartai.entity.AigcEmbedStore;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface AigcEmbedStoreMapper {

    AigcEmbedStore selectById(String id);

    AigcEmbedStore selectByName(String name);

    List<AigcEmbedStore> selectList(@Param("name") String name, @Param("provider") String provider);

    int insert(AigcEmbedStore store);

    int updateById(AigcEmbedStore store);

    int deleteById(String id);
}
