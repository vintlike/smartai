package com.smartai.service;

import com.smartai.entity.AigcKnowledge;

import java.util.List;

public interface AigcKnowledgeService {

    AigcKnowledge create(AigcKnowledge knowledge);

    AigcKnowledge update(AigcKnowledge knowledge);

    void delete(String id);

    AigcKnowledge getById(String id);

    List<AigcKnowledge> list(String name, String userId);
}
