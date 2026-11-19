package com.smartai.dto;

import lombok.Data;

@Data
public class DashboardRankDTO {

    private String name;
    private Long callCount;
    private Long totalTokens;
}
