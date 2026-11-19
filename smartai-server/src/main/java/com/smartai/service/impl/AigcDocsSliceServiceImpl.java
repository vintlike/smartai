package com.smartai.service.impl;

import com.smartai.entity.AigcDocsSlice;
import com.smartai.mapper.AigcDocsSliceMapper;
import com.smartai.service.AigcDocsSliceService;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class AigcDocsSliceServiceImpl implements AigcDocsSliceService {

    public static final int SEARCH_LIMIT = 50;

    private final AigcDocsSliceMapper aigcDocsSliceMapper;

    public AigcDocsSliceServiceImpl(AigcDocsSliceMapper aigcDocsSliceMapper) {
        this.aigcDocsSliceMapper = aigcDocsSliceMapper;
    }

    @Override
    public List<AigcDocsSlice> list(String docId, String knowledgeId) {
        return aigcDocsSliceMapper.selectList(docId, knowledgeId);
    }

    @Override
    public List<AigcDocsSlice> search(String knowledgeId, String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return Collections.emptyList();
        }
        return aigcDocsSliceMapper.search(knowledgeId, keyword, SEARCH_LIMIT);
    }
}
