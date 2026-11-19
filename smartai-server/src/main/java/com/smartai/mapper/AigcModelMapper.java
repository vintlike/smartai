package com.smartai.mapper;

import com.smartai.entity.AigcModel;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface AigcModelMapper {

    AigcModel selectById(String id);

    AigcModel selectByModel(String model);

    List<AigcModel> selectList(@Param("type") String type,
                               @Param("provider") String provider,
                               @Param("name") String name,
                               @Param("showStatus") Integer showStatus);

    int insert(AigcModel model);

    int updateById(AigcModel model);

    int deleteById(String id);
}
