package com.smartai.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class DashboardOverviewDTO {

    private Integer days;
    private LocalDate startDate;
    private LocalDate endDate;
    private DashboardStatDTO current;
    private DashboardStatDTO previous;
    private Long newUserCount;
    private Long newUserCountPrev;
    private Long knowledgeCount;
    private Long knowledgeCountPrev;
    private DashboardAssetsDTO assets;
}
