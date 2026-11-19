package com.smartai.service;

import com.smartai.entity.AigcDocsSlice;

import java.util.List;

public interface AigcDocsSliceService {

    List<AigcDocsSlice> list(String docId, String knowledgeId);

    List<AigcDocsSlice> search(String knowledgeId, String keyword);
}
