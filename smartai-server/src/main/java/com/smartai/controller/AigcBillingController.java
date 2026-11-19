package com.smartai.controller;

import com.smartai.common.Result;
import com.smartai.dto.BillingStatDTO;
import com.smartai.dto.BillingSummaryDTO;
import com.smartai.dto.BillingTrendDTO;
import com.smartai.service.AigcBillingService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/aigc/billing")
public class AigcBillingController {

    private final AigcBillingService aigcBillingService;

    public AigcBillingController(AigcBillingService aigcBillingService) {
        this.aigcBillingService = aigcBillingService;
    }

    @GetMapping
    public Result<Map<String, Object>> list(@RequestParam(required = false) String username,
                                            @RequestParam(required = false) String model,
                                            @RequestParam(required = false)
                                            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                                            @RequestParam(required = false)
                                            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
                                            @RequestParam(defaultValue = "1") int page,
                                            @RequestParam(defaultValue = "10") int pageSize) {
        List<BillingStatDTO> list = aigcBillingService.list(username, model, startDate, endDate, page, pageSize);
        long total = aigcBillingService.count(username, model, startDate, endDate);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("list", list);
        body.put("total", total);
        return Result.success(body);
    }

    @GetMapping("/summary")
    public Result<BillingSummaryDTO> summary(@RequestParam(required = false) String username,
                                             @RequestParam(required = false) String model,
                                             @RequestParam(required = false)
                                             @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                                             @RequestParam(required = false)
                                             @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return Result.success(aigcBillingService.summary(username, model, startDate, endDate));
    }

    @GetMapping("/trend")
    public Result<List<BillingTrendDTO>> trend(@RequestParam(required = false) String username,
                                               @RequestParam(required = false) String model,
                                               @RequestParam(required = false)
                                               @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                                               @RequestParam(required = false)
                                               @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return Result.success(aigcBillingService.trend(username, model, startDate, endDate));
    }
}
