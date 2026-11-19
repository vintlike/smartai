package com.smartai.mapper;

import com.smartai.entity.AigcAppApi;

import java.util.List;

public interface AigcAppApiMapper {

    AigcAppApi selectById(String id);

    List<AigcAppApi> selectByAppId(String appId);

    int insert(AigcAppApi api);

    int deleteById(String id);

    int deleteByAppId(String appId);
}
