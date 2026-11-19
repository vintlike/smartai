package com.smartai.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class BillingStatDTO {

    private String userId;
    private String username;
    private String model;
    private Long callCount;
    private Long totalTokens;
    private Long promptTokens;
    private Long completionTokens;
    private LocalDateTime lastCallTime;
}
