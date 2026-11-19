package com.smartai.service.impl;

import com.smartai.entity.AigcConversation;
import com.smartai.exception.BusinessException;
import com.smartai.mapper.AigcConversationMapper;
import com.smartai.mapper.AigcMessageMapper;
import com.smartai.service.AigcConversationService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class AigcConversationServiceImpl implements AigcConversationService {

    private final AigcConversationMapper aigcConversationMapper;
    private final AigcMessageMapper aigcMessageMapper;

    public AigcConversationServiceImpl(AigcConversationMapper aigcConversationMapper,
                                       AigcMessageMapper aigcMessageMapper) {
        this.aigcConversationMapper = aigcConversationMapper;
        this.aigcMessageMapper = aigcMessageMapper;
    }

    @Override
    public AigcConversation create(AigcConversation conversation) {
        conversation.setId(UUID.randomUUID().toString().replace("-", ""));
        conversation.setCreateTime(LocalDateTime.now());
        aigcConversationMapper.insert(conversation);
        return aigcConversationMapper.selectById(conversation.getId());
    }

    @Override
    public AigcConversation update(AigcConversation conversation) {
        if (aigcConversationMapper.selectById(conversation.getId()) == null) {
            throw new BusinessException("对话不存在");
        }
        aigcConversationMapper.updateById(conversation);
        return aigcConversationMapper.selectById(conversation.getId());
    }

    @Override
    public void delete(String id) {
        if (aigcConversationMapper.selectById(id) == null) {
            throw new BusinessException("对话不存在");
        }
        aigcMessageMapper.deleteByConversationId(id);
        aigcConversationMapper.deleteById(id);
    }

    @Override
    public AigcConversation getById(String id) {
        AigcConversation conversation = aigcConversationMapper.selectById(id);
        if (conversation == null) {
            throw new BusinessException("对话不存在");
        }
        return conversation;
    }

    @Override
    public List<AigcConversation> listByUserId(String userId) {
        return aigcConversationMapper.selectByUserId(userId);
    }

    @Override
    public List<AigcConversation> listPage(String userId, String keyword, int page, int pageSize) {
        int safePage = Math.max(1, page);
        int safeSize = Math.min(100, Math.max(1, pageSize));
        return aigcConversationMapper.selectPage(userId, keyword, safeSize, (safePage - 1) * safeSize);
    }

    @Override
    public long count(String userId, String keyword) {
        return aigcConversationMapper.countPage(userId, keyword);
    }
}
