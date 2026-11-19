package com.smartai.service;

import com.smartai.entity.AigcAppApi;

import java.util.List;

public interface AigcAppApiService {

    List<AigcAppApi> listByAppId(String appId);

    AigcAppApi create(AigcAppApi api);

    void delete(String id);
}
