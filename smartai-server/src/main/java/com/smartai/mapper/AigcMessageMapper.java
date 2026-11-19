package com.smartai.mapper;

import com.smartai.dto.BillingStatDTO;
import com.smartai.dto.BillingSummaryDTO;
import com.smartai.dto.BillingTrendDTO;
import com.smartai.entity.AigcMessage;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface AigcMessageMapper {

    AigcMessage selectById(String id);

    List<AigcMessage> selectByConversationId(String conversationId);

    List<AigcMessage> selectList(@Param("userId") String userId,
                                 @Param("username") String username,
                                 @Param("role") String role,
                                 @Param("model") String model,
                                 @Param("conversationId") String conversationId,
                                 @Param("startTime") LocalDateTime startTime,
                                 @Param("endTime") LocalDateTime endTime,
                                 @Param("limit") int limit,
                                 @Param("offset") int offset);

    long countList(@Param("userId") String userId,
                   @Param("username") String username,
                   @Param("role") String role,
                   @Param("model") String model,
                   @Param("conversationId") String conversationId,
                   @Param("startTime") LocalDateTime startTime,
                   @Param("endTime") LocalDateTime endTime);

    List<BillingStatDTO> selectBillingList(@Param("username") String username,
                                           @Param("model") String model,
                                           @Param("startTime") LocalDateTime startTime,
                                           @Param("endTime") LocalDateTime endTime,
                                           @Param("limit") int limit,
                                           @Param("offset") int offset);

    long countBilling(@Param("username") String username,
                      @Param("model") String model,
                      @Param("startTime") LocalDateTime startTime,
                      @Param("endTime") LocalDateTime endTime);

    BillingSummaryDTO selectBillingSummary(@Param("username") String username,
                                           @Param("model") String model,
                                           @Param("startTime") LocalDateTime startTime,
                                           @Param("endTime") LocalDateTime endTime);

    List<BillingTrendDTO> selectBillingTrend(@Param("username") String username,
                                             @Param("model") String model,
                                             @Param("startTime") LocalDateTime startTime,
                                             @Param("endTime") LocalDateTime endTime);

    int insert(AigcMessage message);

    int deleteById(String id);

    int deleteByConversationId(String conversationId);
}
