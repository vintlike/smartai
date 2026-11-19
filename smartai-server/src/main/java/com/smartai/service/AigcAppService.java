package com.smartai.service;

import com.smartai.entity.AigcApp;

import java.util.List;

public interface AigcAppService {

    AigcApp create(AigcApp app);

    AigcApp update(AigcApp app);

    void delete(String id);

    AigcApp getById(String id);

    List<AigcApp> list(String name);
}
