package com.smartai.service;

import com.smartai.dto.DashboardOverviewDTO;
import com.smartai.dto.DashboardRankDTO;
import com.smartai.dto.DashboardTrendDTO;

import java.util.List;
import java.util.Map;

public interface DashboardService {

    DashboardOverviewDTO overview(int days);

    List<DashboardTrendDTO> trend(int days);

    Map<String, List<DashboardRankDTO>> rank(int days, int limit);
}
