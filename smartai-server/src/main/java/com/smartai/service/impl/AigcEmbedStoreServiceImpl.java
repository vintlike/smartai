package com.smartai.service.impl;

import com.smartai.common.Secrets;
import com.smartai.entity.AigcEmbedStore;
import com.smartai.exception.BusinessException;
import com.smartai.mapper.AigcEmbedStoreMapper;
import com.smartai.mapper.AigcKnowledgeMapper;
import com.smartai.service.AigcEmbedStoreService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class AigcEmbedStoreServiceImpl implements AigcEmbedStoreService {

    private final AigcEmbedStoreMapper aigcEmbedStoreMapper;
    private final AigcKnowledgeMapper aigcKnowledgeMapper;

    public AigcEmbedStoreServiceImpl(AigcEmbedStoreMapper aigcEmbedStoreMapper,
                                     AigcKnowledgeMapper aigcKnowledgeMapper) {
        this.aigcEmbedStoreMapper = aigcEmbedStoreMapper;
        this.aigcKnowledgeMapper = aigcKnowledgeMapper;
    }

    @Override
    public AigcEmbedStore create(AigcEmbedStore store) {
        if (store.getName() == null || store.getName().isBlank()) {
            throw new BusinessException("请输入数据库别名");
        }
        if (aigcEmbedStoreMapper.selectByName(store.getName()) != null) {
            throw new BusinessException("数据库别名已存在");
        }
        store.setId(UUID.randomUUID().toString().replace("-", ""));
        aigcEmbedStoreMapper.insert(store);
        return aigcEmbedStoreMapper.selectById(store.getId());
    }

    @Override
    public AigcEmbedStore update(AigcEmbedStore store) {
        AigcEmbedStore existing = aigcEmbedStoreMapper.selectById(store.getId());
        if (existing == null) {
            throw new BusinessException("向量库不存在");
        }
        if (store.getName() != null && !store.getName().equals(existing.getName())) {
            AigcEmbedStore sameName = aigcEmbedStoreMapper.selectByName(store.getName());
            if (sameName != null && !sameName.getId().equals(store.getId())) {
                throw new BusinessException("数据库别名已存在");
            }
        }
        if (Secrets.isUnchanged(store.getPassword())) {
            store.setPassword(null);
        }
        aigcEmbedStoreMapper.updateById(store);
        return aigcEmbedStoreMapper.selectById(store.getId());
    }

    @Override
    public void delete(String id) {
        if (aigcEmbedStoreMapper.selectById(id) == null) {
            throw new BusinessException("向量库不存在");
        }
        if (aigcKnowledgeMapper.countByEmbedStoreId(id) > 0) {
            throw new BusinessException("该向量库已被知识库关联，无法删除");
        }
        aigcEmbedStoreMapper.deleteById(id);
    }

    @Override
    public AigcEmbedStore getById(String id) {
        AigcEmbedStore store = aigcEmbedStoreMapper.selectById(id);
        if (store == null) {
            throw new BusinessException("向量库不存在");
        }
        return store;
    }

    @Override
    public List<AigcEmbedStore> list(String name, String provider) {
        return aigcEmbedStoreMapper.selectList(name, provider);
    }
}
