package com.smartai.mapper;

import com.smartai.entity.AigcApp;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface AigcAppMapper {

    AigcApp selectById(String id);

    List<AigcApp> selectList(@Param("name") String name);

    int insert(AigcApp app);

    int updateById(AigcApp app);

    int deleteById(String id);
}
