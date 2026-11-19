package com.smartai.service.impl;

import com.smartai.dto.DocsTrainSummary;
import com.smartai.entity.AigcDocs;
import com.smartai.exception.BusinessException;
import com.smartai.mapper.AigcDocsMapper;
import com.smartai.service.AigcDocsService;
import com.smartai.service.AigcDocsTrainService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
public class AigcDocsTrainServiceImpl implements AigcDocsTrainService {

    public static final int ERROR_LIMIT = 20;

    private final AigcDocsMapper aigcDocsMapper;
    private final AigcDocsService aigcDocsService;

    public AigcDocsTrainServiceImpl(AigcDocsMapper aigcDocsMapper, AigcDocsService aigcDocsService) {
        this.aigcDocsMapper = aigcDocsMapper;
        this.aigcDocsService = aigcDocsService;
    }

    @Override
    public DocsTrainSummary trainByKnowledge(String knowledgeId) {
        if (knowledgeId == null || knowledgeId.isBlank()) {
            throw new BusinessException("知识库ID不能为空");
        }
        List<AigcDocs> docsList = aigcDocsMapper.selectByKnowledgeId(knowledgeId);
        DocsTrainSummary summary = new DocsTrainSummary();
        summary.setTotal(docsList.size());
        for (AigcDocs docs : docsList) {
            String name = docs.getName();
            if (docs.getSliceCount() == null || docs.getSliceCount() == 0) {
                summary.setSkipped(summary.getSkipped() + 1);
                addError(summary, name + "：文档暂无切片，无法训练");
                continue;
            }
            try {
                AigcDocs trained = aigcDocsService.train(docs.getId());
                summary.setSuccess(summary.getSuccess() + 1);
                int count = trained == null || trained.getSliceCount() == null ? 0 : trained.getSliceCount();
                summary.setVectorCount(summary.getVectorCount() + count);
            } catch (BusinessException ex) {
                summary.setFailed(summary.getFailed() + 1);
                addError(summary, name + "：" + ex.getMessage());
            } catch (Exception ex) {
                summary.setFailed(summary.getFailed() + 1);
                addError(summary, name + "：训练异常：" + ex.getClass().getSimpleName());
                log.warn("训练文档失败，docId:{}，name:{}", docs.getId(), name, ex);
            }
        }
        return summary;
    }

    private void addError(DocsTrainSummary summary, String error) {
        if (summary.getErrors().size() < ERROR_LIMIT) {
            summary.getErrors().add(error);
        }
    }
}
