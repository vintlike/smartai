package com.smartai.service;

import com.smartai.entity.AigcEmbedStore;

import java.util.List;

public interface AigcEmbedStoreService {

    AigcEmbedStore create(AigcEmbedStore store);

    AigcEmbedStore update(AigcEmbedStore store);

    void delete(String id);

    AigcEmbedStore getById(String id);

    List<AigcEmbedStore> list(String name, String provider);
}
