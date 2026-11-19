package com.smartai.service;

import com.smartai.entity.AigcConversation;

import java.util.List;

public interface AigcConversationService {

    AigcConversation create(AigcConversation conversation);

    AigcConversation update(AigcConversation conversation);

    void delete(String id);

    AigcConversation getById(String id);

    List<AigcConversation> listByUserId(String userId);

    List<AigcConversation> listPage(String userId, String keyword, int page, int pageSize);

    long count(String userId, String keyword);
}
