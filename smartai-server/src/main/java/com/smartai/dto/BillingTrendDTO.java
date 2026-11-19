package com.smartai.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class BillingTrendDTO {

    private LocalDate statDate;
    private Long callCount;
    private Long totalTokens;
    private Long promptTokens;
    private Long completionTokens;
}
