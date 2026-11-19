package com.smartai.controller;

import com.smartai.common.Result;
import com.smartai.dto.DashboardOverviewDTO;
import com.smartai.dto.DashboardRankDTO;
import com.smartai.dto.DashboardTrendDTO;
import com.smartai.service.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/aigc/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/overview")
    public Result<DashboardOverviewDTO> overview(@RequestParam(defaultValue = "7") int days) {
        return Result.success(dashboardService.overview(days));
    }

    @GetMapping("/trend")
    public Result<List<DashboardTrendDTO>> trend(@RequestParam(defaultValue = "7") int days) {
        return Result.success(dashboardService.trend(days));
    }

    @GetMapping("/rank")
    public Result<Map<String, List<DashboardRankDTO>>> rank(@RequestParam(defaultValue = "7") int days,
                                                            @RequestParam(defaultValue = "8") int limit) {
        return Result.success(dashboardService.rank(days, limit));
    }
}
