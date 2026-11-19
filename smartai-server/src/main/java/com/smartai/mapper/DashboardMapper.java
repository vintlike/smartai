package com.smartai.mapper;

import com.smartai.dto.DashboardAssetsDTO;
import com.smartai.dto.DashboardRankDTO;
import com.smartai.dto.DashboardStatDTO;
import com.smartai.dto.DashboardTrendDTO;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface DashboardMapper {

    DashboardStatDTO selectMessageStat(@Param("startTime") LocalDateTime startTime,
                                       @Param("endTime") LocalDateTime endTime);

    List<DashboardTrendDTO> selectMessageTrend(@Param("startTime") LocalDateTime startTime,
                                               @Param("endTime") LocalDateTime endTime);

    List<DashboardTrendDTO> selectUserTrend(@Param("startTime") LocalDateTime startTime,
                                            @Param("endTime") LocalDateTime endTime);

    Long countNewUsers(@Param("startTime") LocalDateTime startTime,
                       @Param("endTime") LocalDateTime endTime);

    Long countKnowledgeBefore(@Param("endTime") LocalDateTime endTime);

    DashboardAssetsDTO selectAssets();

    List<DashboardRankDTO> selectModelUsage(@Param("startTime") LocalDateTime startTime,
                                            @Param("endTime") LocalDateTime endTime,
                                            @Param("limit") int limit);

    List<DashboardRankDTO> selectTopUsers(@Param("startTime") LocalDateTime startTime,
                                          @Param("endTime") LocalDateTime endTime,
                                          @Param("limit") int limit);
}
