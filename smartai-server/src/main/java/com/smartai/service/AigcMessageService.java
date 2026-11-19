package com.smartai.service;

import com.smartai.entity.AigcMessage;

import java.time.LocalDate;
import java.util.List;

public interface AigcMessageService {

    AigcMessage create(AigcMessage message);

    void delete(String id);

    AigcMessage getById(String id);

    List<AigcMessage> listByConversationId(String conversationId);

    List<AigcMessage> list(String userId, String username, String role, String model, String conversationId,
                           LocalDate startDate, LocalDate endDate, int page, int pageSize);

    long count(String userId, String username, String role, String model, String conversationId,
               LocalDate startDate, LocalDate endDate);
}
