package com.smartai.dto;

import lombok.Data;

@Data
public class DashboardAssetsDTO {

    private Long userCount;
    private Long modelCount;
    private Long appCount;
    private Long knowledgeCount;
    private Long docCount;
    private Long conversationCount;
}
