package com.smartai.service.impl;

import com.google.gson.Gson;
import com.smartai.entity.AigcDocs;
import com.smartai.entity.AigcDocsSlice;
import com.smartai.entity.AigcDocsSliceVector;
import com.smartai.entity.AigcEmbedStore;
import com.smartai.entity.AigcKnowledge;
import com.smartai.entity.AigcModel;
import com.smartai.exception.BusinessException;
import com.smartai.llm.EmbeddingClient;
import com.smartai.llm.LlmException;
import com.smartai.mapper.AigcDocsMapper;
import com.smartai.mapper.AigcDocsSliceMapper;
import com.smartai.mapper.AigcDocsSliceVectorMapper;
import com.smartai.mapper.AigcEmbedStoreMapper;
import com.smartai.mapper.AigcKnowledgeMapper;
import com.smartai.mapper.AigcModelMapper;
import com.smartai.service.AigcDocsService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
public class AigcDocsServiceImpl implements AigcDocsService {

    public static final int SLICE_MAX_CHARS = 1024;
    public static final int VECTOR_INSERT_BATCH = 20;
    public static final int SLICE_BATCH = 100;

    private static final int SLICE_MIN_BREAK_OFFSET = SLICE_MAX_CHARS / 2;
    private static final String MODEL_TYPE_EMBEDDING = "EMBEDDING";

    private static final Gson GSON = new Gson();

    private final AigcDocsMapper aigcDocsMapper;
    private final AigcDocsSliceMapper aigcDocsSliceMapper;
    private final AigcDocsSliceVectorMapper aigcDocsSliceVectorMapper;
    private final AigcKnowledgeMapper aigcKnowledgeMapper;
    private final AigcModelMapper aigcModelMapper;
    private final AigcEmbedStoreMapper aigcEmbedStoreMapper;
    private final TransactionTemplate transactionTemplate;

    public AigcDocsServiceImpl(AigcDocsMapper aigcDocsMapper, AigcDocsSliceMapper aigcDocsSliceMapper,
                               AigcDocsSliceVectorMapper aigcDocsSliceVectorMapper,
                               AigcKnowledgeMapper aigcKnowledgeMapper, AigcModelMapper aigcModelMapper,
                               AigcEmbedStoreMapper aigcEmbedStoreMapper,
                               PlatformTransactionManager transactionManager) {
        this.aigcDocsMapper = aigcDocsMapper;
        this.aigcDocsSliceMapper = aigcDocsSliceMapper;
        this.aigcDocsSliceVectorMapper = aigcDocsSliceVectorMapper;
        this.aigcKnowledgeMapper = aigcKnowledgeMapper;
        this.aigcModelMapper = aigcModelMapper;
        this.aigcEmbedStoreMapper = aigcEmbedStoreMapper;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
    }

    @Override
    public AigcDocs create(AigcDocs docs) {
        docs.setId(UUID.randomUUID().toString().replace("-", ""));
        docs.setCreateTime(LocalDateTime.now());
        docs.setFileSize(docs.getContent() == null ? 0L : docs.getContent().getBytes(StandardCharsets.UTF_8).length);
        List<AigcDocsSlice> slices = splitSlices(docs);
        docs.setSliceCount(slices.size());
        docs.setSliceStatus(AigcDocs.SLICE_STATUS_UNTRAINED);
        aigcDocsMapper.insert(docs);
        insertSlices(slices);
        return aigcDocsMapper.selectById(docs.getId());
    }

    @Override
    public AigcDocs update(AigcDocs docs) {
        AigcDocs existing = aigcDocsMapper.selectById(docs.getId());
        if (existing == null) {
            throw new BusinessException("文档不存在");
        }
        String content = docs.getContent() == null ? existing.getContent() : docs.getContent();
        String name = docs.getName() == null ? existing.getName() : docs.getName();
        docs.setContent(content);
        docs.setName(name);
        docs.setFileSize(content == null ? 0L : content.getBytes(StandardCharsets.UTF_8).length);
        if (!Objects.equals(existing.getContent(), content) || !Objects.equals(existing.getName(), name)) {
            List<AigcDocsSlice> slices = splitSlices(docs);
            docs.setSliceCount(slices.size());
            docs.setSliceStatus(AigcDocs.SLICE_STATUS_UNTRAINED);
            transactionTemplate.executeWithoutResult(status -> {
                aigcDocsSliceVectorMapper.deleteByDocId(docs.getId());
                aigcDocsSliceMapper.deleteByDocId(docs.getId());
                insertSlices(slices);
            });
        }
        aigcDocsMapper.updateById(docs);
        return aigcDocsMapper.selectById(docs.getId());
    }

    @Override
    public AigcDocs train(String id) {
        AigcDocs docs = aigcDocsMapper.selectById(id);
        if (docs == null) {
            throw new BusinessException("文档不存在");
        }
        List<AigcDocsSlice> slices = aigcDocsSliceMapper.selectList(id, null);
        if (slices == null || slices.isEmpty()) {
            throw new BusinessException("文档暂无切片，无法训练");
        }
        AigcKnowledge knowledge = aigcKnowledgeMapper.selectById(docs.getKnowledgeId());
        if (knowledge == null) {
            throw new BusinessException("文档所属知识库不存在");
        }
        String embedModelId = knowledge.getEmbedModelId();
        if (embedModelId == null || embedModelId.isBlank()) {
            throw new BusinessException("知识库未配置向量模型，无法训练");
        }
        AigcModel model = aigcModelMapper.selectById(embedModelId);
        if (model == null) {
            throw new BusinessException("知识库关联的向量模型不存在，请重新配置");
        }
        if (!MODEL_TYPE_EMBEDDING.equalsIgnoreCase(model.getType())) {
            throw new BusinessException("知识库关联的模型不是向量模型，请重新配置");
        }
        if (model.getModel() == null || model.getModel().isBlank()) {
            throw new BusinessException("向量模型未配置模型名称");
        }
        String embedStoreId = knowledge.getEmbedStoreId();
        if (embedStoreId == null || embedStoreId.isBlank()) {
            throw new BusinessException("知识库未配置向量库，无法训练");
        }
        AigcEmbedStore embedStore = aigcEmbedStoreMapper.selectById(embedStoreId);
        if (embedStore == null) {
            throw new BusinessException("知识库关联的向量库不存在，请重新配置");
        }

        List<String> inputs = new ArrayList<>(slices.size());
        for (AigcDocsSlice slice : slices) {
            inputs.add(slice.getContent() == null ? "" : slice.getContent());
        }
        List<float[]> vectors;
        try {
            vectors = EmbeddingClient.builder()
                    .baseUrl(model.getBaseUrl())
                    .apiKey(model.getApiKey())
                    .model(model.getModel())
                    .build()
                    .embed(inputs);
        } catch (LlmException ex) {
            throw new BusinessException("向量化失败：" + ex.getMessage());
        }
        if (vectors == null || vectors.size() != slices.size()) {
            throw new BusinessException("向量化结果数量与切片不一致，请重试");
        }

        Integer expectedDimension = model.getDimension() != null && model.getDimension() > 0
                ? model.getDimension() : embedStore.getDimension();
        if (expectedDimension != null && expectedDimension > 0) {
            for (float[] vector : vectors) {
                if (vector != null && vector.length != expectedDimension) {
                    throw new BusinessException("向量维度不匹配：模型返回 " + vector.length + " 维，配置为 "
                            + expectedDimension + " 维");
                }
            }
        }

        List<AigcDocsSliceVector> vectorRecords = new ArrayList<>(slices.size());
        LocalDateTime now = LocalDateTime.now();
        for (int i = 0; i < slices.size(); i++) {
            float[] vector = vectors.get(i);
            AigcDocsSliceVector record = new AigcDocsSliceVector();
            record.setVectorId(UUID.randomUUID().toString().replace("-", ""));
            record.setSliceId(slices.get(i).getId());
            record.setDocId(docs.getId());
            record.setKnowledgeId(docs.getKnowledgeId());
            record.setEmbedStoreId(embedStoreId);
            record.setEmbedModelId(embedModelId);
            record.setDimension(vector == null ? null : vector.length);
            record.setEmbedding(GSON.toJson(vector));
            record.setCreateTime(now);
            vectorRecords.add(record);
        }
        transactionTemplate.executeWithoutResult(status -> {
            aigcDocsSliceVectorMapper.deleteByDocId(docs.getId());
            List<String> pendingSliceIds = new ArrayList<>();
            List<String> pendingVectorIds = new ArrayList<>();
            for (int start = 0; start < vectorRecords.size(); start += VECTOR_INSERT_BATCH) {
                List<AigcDocsSliceVector> batch = vectorRecords.subList(start,
                        Math.min(start + VECTOR_INSERT_BATCH, vectorRecords.size()));
                aigcDocsSliceVectorMapper.insertBatch(batch);
                for (AigcDocsSliceVector record : batch) {
                    pendingSliceIds.add(record.getSliceId());
                    pendingVectorIds.add(record.getVectorId());
                }
                if (pendingSliceIds.size() >= SLICE_BATCH) {
                    aigcDocsSliceMapper.markTrainedBatch(pendingSliceIds, pendingVectorIds);
                    pendingSliceIds.clear();
                    pendingVectorIds.clear();
                }
            }
            if (!pendingSliceIds.isEmpty()) {
                aigcDocsSliceMapper.markTrainedBatch(pendingSliceIds, pendingVectorIds);
            }
            AigcDocs update = new AigcDocs();
            update.setId(docs.getId());
            update.setSliceStatus(AigcDocs.SLICE_STATUS_TRAINED);
            aigcDocsMapper.updateById(update);
        });
        return aigcDocsMapper.selectById(id);
    }

    @Override
    public void delete(String id) {
        AigcDocs docs = aigcDocsMapper.selectById(id);
        if (docs == null) {
            throw new BusinessException("文档不存在");
        }
        transactionTemplate.executeWithoutResult(status -> {
            aigcDocsSliceVectorMapper.deleteByDocId(id);
            aigcDocsSliceMapper.deleteByDocId(id);
            aigcDocsMapper.deleteById(id);
        });
    }

    @Override
    public AigcDocs getById(String id) {
        AigcDocs docs = aigcDocsMapper.selectById(id);
        if (docs == null) {
            throw new BusinessException("文档不存在");
        }
        return docs;
    }

    @Override
    public List<AigcDocs> list(String knowledgeId, String name, String sourceType) {
        return aigcDocsMapper.selectList(knowledgeId, name, sourceType);
    }

    private void insertSlices(List<AigcDocsSlice> slices) {
        for (int start = 0; start < slices.size(); start += SLICE_BATCH) {
            aigcDocsSliceMapper.insertBatch(slices.subList(start, Math.min(start + SLICE_BATCH, slices.size())));
        }
    }

    private List<AigcDocsSlice> splitSlices(AigcDocs docs) {
        List<AigcDocsSlice> slices = new ArrayList<>();
        if (docs.getContent() == null || docs.getContent().isBlank()) {
            return slices;
        }
        String text = docs.getContent().strip();
        LocalDateTime now = LocalDateTime.now();
        int start = 0;
        while (start < text.length()) {
            int end = Math.min(start + SLICE_MAX_CHARS, text.length());
            if (end < text.length()) {
                int breakAt = text.lastIndexOf('\n', end - 1);
                if (breakAt >= start + SLICE_MIN_BREAK_OFFSET) {
                    end = breakAt + 1;
                }
            }
            String chunk = text.substring(start, end).strip();
            if (!chunk.isEmpty()) {
                AigcDocsSlice slice = new AigcDocsSlice();
                slice.setId(UUID.randomUUID().toString().replace("-", ""));
                slice.setVectorId(AigcDocsSlice.NO_VECTOR_ID);
                slice.setDocId(docs.getId());
                slice.setKnowledgeId(docs.getKnowledgeId());
                slice.setName(docs.getName());
                slice.setContent(chunk);
                slice.setCharCount(chunk.length());
                slice.setTrainStatus(AigcDocsSlice.TRAIN_STATUS_UNTRAINED);
                slice.setCreateTime(now);
                slices.add(slice);
            }
            start = end;
        }
        return slices;
    }
}
