package com.smartai.service.impl;

import com.smartai.dto.DashboardAssetsDTO;
import com.smartai.dto.DashboardOverviewDTO;
import com.smartai.dto.DashboardRankDTO;
import com.smartai.dto.DashboardStatDTO;
import com.smartai.dto.DashboardTrendDTO;
import com.smartai.mapper.DashboardMapper;
import com.smartai.service.DashboardService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardServiceImpl implements DashboardService {

    public static final int MAX_DAYS = 366;
    public static final int MAX_RANK_LIMIT = 20;

    private final DashboardMapper dashboardMapper;

    public DashboardServiceImpl(DashboardMapper dashboardMapper) {
        this.dashboardMapper = dashboardMapper;
    }

    @Override
    public DashboardOverviewDTO overview(int days) {
        int safeDays = clamp(days, 1, MAX_DAYS);
        LocalDateTime rangeEnd = LocalDate.now().plusDays(1).atStartOfDay();
        LocalDateTime currentStart = rangeEnd.minusDays(safeDays);
        LocalDateTime previousStart = currentStart.minusDays(safeDays);

        DashboardOverviewDTO overview = new DashboardOverviewDTO();
        overview.setDays(safeDays);
        overview.setStartDate(currentStart.toLocalDate());
        overview.setEndDate(rangeEnd.toLocalDate().minusDays(1));
        overview.setCurrent(zeroFill(dashboardMapper.selectMessageStat(currentStart, rangeEnd)));
        overview.setPrevious(zeroFill(dashboardMapper.selectMessageStat(previousStart, currentStart)));
        overview.setNewUserCount(nvl(dashboardMapper.countNewUsers(currentStart, rangeEnd)));
        overview.setNewUserCountPrev(nvl(dashboardMapper.countNewUsers(previousStart, currentStart)));
        overview.setKnowledgeCount(nvl(dashboardMapper.countKnowledgeBefore(rangeEnd)));
        overview.setKnowledgeCountPrev(nvl(dashboardMapper.countKnowledgeBefore(currentStart)));
        overview.setAssets(zeroFill(dashboardMapper.selectAssets()));
        return overview;
    }

    @Override
    public List<DashboardTrendDTO> trend(int days) {
        int safeDays = clamp(days, 1, MAX_DAYS);
        LocalDateTime rangeEnd = LocalDate.now().plusDays(1).atStartOfDay();
        LocalDateTime rangeStart = rangeEnd.minusDays(safeDays);

        Map<LocalDate, DashboardTrendDTO> messageMap = new HashMap<>();
        for (DashboardTrendDTO item : dashboardMapper.selectMessageTrend(rangeStart, rangeEnd)) {
            messageMap.put(item.getStatDate(), zeroFill(item));
        }
        Map<LocalDate, Long> userMap = new HashMap<>();
        for (DashboardTrendDTO item : dashboardMapper.selectUserTrend(rangeStart, rangeEnd)) {
            userMap.put(item.getStatDate(), nvl(item.getNewUserCount()));
        }

        List<DashboardTrendDTO> trend = new ArrayList<>(safeDays);
        for (int i = 0; i < safeDays; i++) {
            LocalDate date = rangeStart.toLocalDate().plusDays(i);
            DashboardTrendDTO point = messageMap.get(date);
            if (point == null) {
                point = emptyTrend(date);
            }
            point.setNewUserCount(userMap.getOrDefault(date, 0L));
            trend.add(point);
        }
        return trend;
    }

    @Override
    public Map<String, List<DashboardRankDTO>> rank(int days, int limit) {
        int safeDays = clamp(days, 1, MAX_DAYS);
        int safeLimit = clamp(limit, 1, MAX_RANK_LIMIT);
        LocalDateTime rangeEnd = LocalDate.now().plusDays(1).atStartOfDay();
        LocalDateTime rangeStart = rangeEnd.minusDays(safeDays);

        Map<String, List<DashboardRankDTO>> result = new LinkedHashMap<>();
        List<DashboardRankDTO> models = dashboardMapper.selectModelUsage(rangeStart, rangeEnd, safeLimit);
        List<DashboardRankDTO> users = dashboardMapper.selectTopUsers(rangeStart, rangeEnd, safeLimit);
        result.put("models", models == null ? Collections.emptyList() : models);
        result.put("users", users == null ? Collections.emptyList() : users);
        return result;
    }

    private static int clamp(int value, int min, int max) {
        return Math.min(max, Math.max(min, value));
    }

    private static long nvl(Long value) {
        return value == null ? 0L : value;
    }

    private static DashboardStatDTO zeroFill(DashboardStatDTO stat) {
        if (stat == null) {
            stat = new DashboardStatDTO();
        }
        stat.setCallCount(nvl(stat.getCallCount()));
        stat.setTotalTokens(nvl(stat.getTotalTokens()));
        stat.setPromptTokens(nvl(stat.getPromptTokens()));
        stat.setCompletionTokens(nvl(stat.getCompletionTokens()));
        stat.setActiveUserCount(nvl(stat.getActiveUserCount()));
        return stat;
    }

    private static DashboardTrendDTO zeroFill(DashboardTrendDTO trend) {
        trend.setCallCount(nvl(trend.getCallCount()));
        trend.setTotalTokens(nvl(trend.getTotalTokens()));
        trend.setPromptTokens(nvl(trend.getPromptTokens()));
        trend.setCompletionTokens(nvl(trend.getCompletionTokens()));
        return trend;
    }

    private static DashboardTrendDTO emptyTrend(LocalDate date) {
        DashboardTrendDTO trend = new DashboardTrendDTO();
        trend.setStatDate(date);
        trend.setCallCount(0L);
        trend.setTotalTokens(0L);
        trend.setPromptTokens(0L);
        trend.setCompletionTokens(0L);
        trend.setNewUserCount(0L);
        return trend;
    }

    private static DashboardAssetsDTO zeroFill(DashboardAssetsDTO assets) {
        if (assets == null) {
            assets = new DashboardAssetsDTO();
        }
        assets.setUserCount(nvl(assets.getUserCount()));
        assets.setModelCount(nvl(assets.getModelCount()));
        assets.setAppCount(nvl(assets.getAppCount()));
        assets.setKnowledgeCount(nvl(assets.getKnowledgeCount()));
        assets.setDocCount(nvl(assets.getDocCount()));
        assets.setConversationCount(nvl(assets.getConversationCount()));
        return assets;
    }
}
