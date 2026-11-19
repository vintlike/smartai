package com.smartai.service.impl;

import com.smartai.dto.BillingStatDTO;
import com.smartai.dto.BillingSummaryDTO;
import com.smartai.dto.BillingTrendDTO;
import com.smartai.mapper.AigcMessageMapper;
import com.smartai.service.AigcBillingService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AigcBillingServiceImpl implements AigcBillingService {

    public static final int TREND_DEFAULT_DAYS = 30;

    private final AigcMessageMapper aigcMessageMapper;

    public AigcBillingServiceImpl(AigcMessageMapper aigcMessageMapper) {
        this.aigcMessageMapper = aigcMessageMapper;
    }

    @Override
    public List<BillingStatDTO> list(String username, String model, LocalDate startDate, LocalDate endDate,
                                     int page, int pageSize) {
        int safePage = Math.max(1, page);
        int safeSize = Math.min(100, Math.max(1, pageSize));
        LocalDateTime startTime = startDate == null ? null : startDate.atStartOfDay();
        LocalDateTime endTime = endDate == null ? null : endDate.plusDays(1).atStartOfDay();
        return aigcMessageMapper.selectBillingList(username, model, startTime, endTime,
                safeSize, (safePage - 1) * safeSize);
    }

    @Override
    public long count(String username, String model, LocalDate startDate, LocalDate endDate) {
        LocalDateTime startTime = startDate == null ? null : startDate.atStartOfDay();
        LocalDateTime endTime = endDate == null ? null : endDate.plusDays(1).atStartOfDay();
        return aigcMessageMapper.countBilling(username, model, startTime, endTime);
    }

    @Override
    public BillingSummaryDTO summary(String username, String model, LocalDate startDate, LocalDate endDate) {
        LocalDateTime startTime = startDate == null ? null : startDate.atStartOfDay();
        LocalDateTime endTime = endDate == null ? null : endDate.plusDays(1).atStartOfDay();
        return aigcMessageMapper.selectBillingSummary(username, model, startTime, endTime);
    }

    @Override
    public List<BillingTrendDTO> trend(String username, String model, LocalDate startDate, LocalDate endDate) {
        LocalDate end = endDate == null ? LocalDate.now() : endDate;
        LocalDate start = startDate == null ? end.minusDays(TREND_DEFAULT_DAYS - 1) : startDate;
        return aigcMessageMapper.selectBillingTrend(username, model,
                start.atStartOfDay(), end.plusDays(1).atStartOfDay());
    }
}
