package com.smartai.service;

import com.smartai.entity.AigcDocs;

import java.util.List;

public interface AigcDocsService {

    AigcDocs create(AigcDocs docs);

    AigcDocs update(AigcDocs docs);

    AigcDocs train(String id);

    void delete(String id);

    AigcDocs getById(String id);

    List<AigcDocs> list(String knowledgeId, String name, String sourceType);
}
