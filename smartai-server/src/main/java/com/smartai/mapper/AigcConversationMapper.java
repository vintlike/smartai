package com.smartai.mapper;

import com.smartai.entity.AigcConversation;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface AigcConversationMapper {

    AigcConversation selectById(String id);

    List<AigcConversation> selectByUserId(String userId);

    List<AigcConversation> selectPage(@Param("userId") String userId,
                                      @Param("keyword") String keyword,
                                      @Param("limit") int limit,
                                      @Param("offset") int offset);

    long countPage(@Param("userId") String userId, @Param("keyword") String keyword);

    int insert(AigcConversation conversation);

    int updateById(AigcConversation conversation);

    int deleteById(String id);
}
