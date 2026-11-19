package com.smartai.mapper;

import com.smartai.entity.SysProvider;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface SysProviderMapper {

    SysProvider selectById(String id);

    SysProvider selectByCode(String code);

    List<SysProvider> selectList(@Param("name") String name, @Param("code") String code);

    int countByProvider(String code);

    int insert(SysProvider provider);

    int updateById(SysProvider provider);

    int updateProviderCode(@Param("oldCode") String oldCode, @Param("newCode") String newCode);

    int deleteById(String id);
}
