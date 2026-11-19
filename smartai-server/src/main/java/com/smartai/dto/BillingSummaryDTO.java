package com.smartai.dto;

import lombok.Data;

@Data
public class BillingSummaryDTO {

    private Long callCount;
    private Long totalTokens;
    private Long promptTokens;
    private Long completionTokens;
    private Long userCount;
    private Long modelCount;
}
