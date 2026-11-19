package com.smartai.service;

import com.smartai.dto.BillingStatDTO;
import com.smartai.dto.BillingSummaryDTO;
import com.smartai.dto.BillingTrendDTO;

import java.time.LocalDate;
import java.util.List;

public interface AigcBillingService {

    List<BillingStatDTO> list(String username, String model, LocalDate startDate, LocalDate endDate,
                              int page, int pageSize);

    long count(String username, String model, LocalDate startDate, LocalDate endDate);

    BillingSummaryDTO summary(String username, String model, LocalDate startDate, LocalDate endDate);

    List<BillingTrendDTO> trend(String username, String model, LocalDate startDate, LocalDate endDate);
}
