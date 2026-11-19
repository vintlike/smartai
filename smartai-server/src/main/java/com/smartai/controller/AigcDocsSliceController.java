package com.smartai.controller;

import com.smartai.common.Result;
import com.smartai.entity.AigcDocsSlice;
import com.smartai.service.AigcDocsSliceService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/aigc/docs/slice")
public class AigcDocsSliceController {

    private final AigcDocsSliceService aigcDocsSliceService;

    public AigcDocsSliceController(AigcDocsSliceService aigcDocsSliceService) {
        this.aigcDocsSliceService = aigcDocsSliceService;
    }

    @GetMapping
    public Result<Map<String, Object>> list(@RequestParam(required = false) String docId,
                                            @RequestParam(required = false) String knowledgeId) {
        List<AigcDocsSlice> list = aigcDocsSliceService.list(docId, knowledgeId);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("list", list);
        body.put("total", list.size());
        return Result.success(body);
    }

    @GetMapping("/search")
    public Result<List<AigcDocsSlice>> search(@RequestParam String knowledgeId,
                                              @RequestParam(required = false) String keyword) {
        return Result.success(aigcDocsSliceService.search(knowledgeId, keyword));
    }
}
