package com.smartai.service.impl;

import com.smartai.entity.AigcMessage;
import com.smartai.exception.BusinessException;
import com.smartai.mapper.AigcMessageMapper;
import com.smartai.service.AigcMessageService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class AigcMessageServiceImpl implements AigcMessageService {

    private final AigcMessageMapper aigcMessageMapper;

    public AigcMessageServiceImpl(AigcMessageMapper aigcMessageMapper) {
        this.aigcMessageMapper = aigcMessageMapper;
    }

    @Override
    public AigcMessage create(AigcMessage message) {
        message.setId(UUID.randomUUID().toString().replace("-", ""));
        message.setCreateTime(LocalDateTime.now());
        aigcMessageMapper.insert(message);
        return aigcMessageMapper.selectById(message.getId());
    }

    @Override
    public void delete(String id) {
        if (aigcMessageMapper.selectById(id) == null) {
            throw new BusinessException("消息不存在");
        }
        aigcMessageMapper.deleteById(id);
    }

    @Override
    public AigcMessage getById(String id) {
        AigcMessage message = aigcMessageMapper.selectById(id);
        if (message == null) {
            throw new BusinessException("消息不存在");
        }
        return message;
    }

    @Override
    public List<AigcMessage> listByConversationId(String conversationId) {
        return aigcMessageMapper.selectByConversationId(conversationId);
    }

    @Override
    public List<AigcMessage> list(String userId, String username, String role, String model, String conversationId,
                                  LocalDate startDate, LocalDate endDate, int page, int pageSize) {
        int safePage = Math.max(1, page);
        int safeSize = Math.min(100, Math.max(1, pageSize));
        LocalDateTime startTime = startDate == null ? null : startDate.atStartOfDay();
        LocalDateTime endTime = endDate == null ? null : endDate.plusDays(1).atStartOfDay();
        return aigcMessageMapper.selectList(userId, username, role, model, conversationId, startTime, endTime,
                safeSize, (safePage - 1) * safeSize);
    }

    @Override
    public long count(String userId, String username, String role, String model, String conversationId,
                      LocalDate startDate, LocalDate endDate) {
        LocalDateTime startTime = startDate == null ? null : startDate.atStartOfDay();
        LocalDateTime endTime = endDate == null ? null : endDate.plusDays(1).atStartOfDay();
        return aigcMessageMapper.countList(userId, username, role, model, conversationId, startTime, endTime);
    }
}
