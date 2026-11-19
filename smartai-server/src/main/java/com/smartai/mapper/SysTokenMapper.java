package com.smartai.mapper;

import com.smartai.entity.SysToken;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface SysTokenMapper {

    List<SysToken> selectList(@Param("account") String account);

    int deleteById(String id);
}
