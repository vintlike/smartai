package com.smartai.service.impl;

import com.smartai.entity.AigcKnowledge;
import com.smartai.exception.BusinessException;
import com.smartai.mapper.AigcDocsMapper;
import com.smartai.mapper.AigcDocsSliceMapper;
import com.smartai.mapper.AigcDocsSliceVectorMapper;
import com.smartai.mapper.AigcKnowledgeMapper;
import com.smartai.service.AigcKnowledgeService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class AigcKnowledgeServiceImpl implements AigcKnowledgeService {

    private final AigcKnowledgeMapper aigcKnowledgeMapper;
    private final AigcDocsMapper aigcDocsMapper;
    private final AigcDocsSliceMapper aigcDocsSliceMapper;
    private final AigcDocsSliceVectorMapper aigcDocsSliceVectorMapper;

    public AigcKnowledgeServiceImpl(AigcKnowledgeMapper aigcKnowledgeMapper, AigcDocsMapper aigcDocsMapper,
                                    AigcDocsSliceMapper aigcDocsSliceMapper,
                                    AigcDocsSliceVectorMapper aigcDocsSliceVectorMapper) {
        this.aigcKnowledgeMapper = aigcKnowledgeMapper;
        this.aigcDocsMapper = aigcDocsMapper;
        this.aigcDocsSliceMapper = aigcDocsSliceMapper;
        this.aigcDocsSliceVectorMapper = aigcDocsSliceVectorMapper;
    }

    @Override
    public AigcKnowledge create(AigcKnowledge knowledge) {
        knowledge.setId(UUID.randomUUID().toString().replace("-", ""));
        knowledge.setCreateTime(LocalDateTime.now());
        aigcKnowledgeMapper.insert(knowledge);
        return aigcKnowledgeMapper.selectById(knowledge.getId());
    }

    @Override
    public AigcKnowledge update(AigcKnowledge knowledge) {
        if (aigcKnowledgeMapper.selectById(knowledge.getId()) == null) {
            throw new BusinessException("知识库不存在");
        }
        aigcKnowledgeMapper.updateById(knowledge);
        return aigcKnowledgeMapper.selectById(knowledge.getId());
    }

    @Override
    @Transactional
    public void delete(String id) {
        if (aigcKnowledgeMapper.selectById(id) == null) {
            throw new BusinessException("知识库不存在");
        }
        aigcDocsSliceVectorMapper.deleteByKnowledgeId(id);
        aigcDocsSliceMapper.deleteByKnowledgeId(id);
        aigcDocsMapper.deleteByKnowledgeId(id);
        aigcKnowledgeMapper.deleteById(id);
    }

    @Override
    public AigcKnowledge getById(String id) {
        AigcKnowledge knowledge = aigcKnowledgeMapper.selectById(id);
        if (knowledge == null) {
            throw new BusinessException("知识库不存在");
        }
        return knowledge;
    }

    @Override
    public List<AigcKnowledge> list(String name, String userId) {
        return aigcKnowledgeMapper.selectList(name, userId);
    }
}
