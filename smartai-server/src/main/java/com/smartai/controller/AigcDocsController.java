package com.smartai.controller;

import com.smartai.auth.RequiresPermission;
import com.smartai.common.Result;
import com.smartai.dto.DocsTrainSummary;
import com.smartai.entity.AigcDocs;
import com.smartai.service.AigcDocsService;
import com.smartai.service.AigcDocsTrainService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/aigc/docs")
public class AigcDocsController {

    private final AigcDocsService aigcDocsService;
    private final AigcDocsTrainService aigcDocsTrainService;

    public AigcDocsController(AigcDocsService aigcDocsService, AigcDocsTrainService aigcDocsTrainService) {
        this.aigcDocsService = aigcDocsService;
        this.aigcDocsTrainService = aigcDocsTrainService;
    }

    @PostMapping
    @RequiresPermission("aigc:docs:add")
    public Result<AigcDocs> create(@RequestBody AigcDocs docs) {
        return Result.success("创建成功", aigcDocsService.create(docs));
    }

    @PutMapping
    @RequiresPermission("aigc:docs:update")
    public Result<AigcDocs> update(@RequestBody AigcDocs docs) {
        return Result.success("更新成功", aigcDocsService.update(docs));
    }

    @PostMapping("/{id}/train")
    @RequiresPermission("aigc:embedding:docs")
    public Result<Void> train(@PathVariable String id) {
        AigcDocs docs = aigcDocsService.train(id);
        int sliceCount = docs.getSliceCount() == null ? 0 : docs.getSliceCount();
        return Result.success("训练完成，已生成 " + sliceCount + " 个切片向量", null);
    }

    @PostMapping("/train")
    @RequiresPermission("aigc:embedding:docs")
    public Result<DocsTrainSummary> trainByKnowledge(@RequestParam String knowledgeId) {
        DocsTrainSummary summary = aigcDocsTrainService.trainByKnowledge(knowledgeId);
        return Result.success("训练完成：成功 " + summary.getSuccess() + " 个，失败 " + summary.getFailed()
                + " 个，跳过 " + summary.getSkipped() + " 个", summary);
    }

    @DeleteMapping("/{id}")
    @RequiresPermission("aigc:docs:delete")
    public Result<Void> delete(@PathVariable String id) {
        aigcDocsService.delete(id);
        return Result.success("删除成功", null);
    }

    @GetMapping("/{id}")
    public Result<AigcDocs> getById(@PathVariable String id) {
        return Result.success(aigcDocsService.getById(id));
    }

    @GetMapping
    public Result<Map<String, Object>> list(@RequestParam(required = false) String knowledgeId,
                                            @RequestParam(required = false) String name,
                                            @RequestParam(required = false) String sourceType) {
        List<AigcDocs> list = aigcDocsService.list(knowledgeId, name, sourceType);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("list", list);
        body.put("total", list.size());
        return Result.success(body);
    }
}
