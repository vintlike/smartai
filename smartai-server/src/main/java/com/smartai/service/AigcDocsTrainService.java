package com.smartai.service;

import com.smartai.dto.DocsTrainSummary;

public interface AigcDocsTrainService {

    DocsTrainSummary trainByKnowledge(String knowledgeId);
}
