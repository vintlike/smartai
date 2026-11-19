package com.smartai.controller;

import com.smartai.auth.RequiresPermission;
import com.smartai.auth.UserContext;
import com.smartai.common.Result;
import com.smartai.entity.AigcKnowledge;
import com.smartai.service.AigcKnowledgeService;
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
@RequestMapping("/api/aigc/knowledge")
public class AigcKnowledgeController {

    private final AigcKnowledgeService aigcKnowledgeService;

    public AigcKnowledgeController(AigcKnowledgeService aigcKnowledgeService) {
        this.aigcKnowledgeService = aigcKnowledgeService;
    }

    @PostMapping
    @RequiresPermission("aigc:knowledge:add")
    public Result<AigcKnowledge> create(@RequestBody AigcKnowledge knowledge) {
        knowledge.setUserId(UserContext.getUserId());
        return Result.success("创建成功", aigcKnowledgeService.create(knowledge));
    }

    @PutMapping
    @RequiresPermission("aigc:knowledge:update")
    public Result<AigcKnowledge> update(@RequestBody AigcKnowledge knowledge) {
        return Result.success("更新成功", aigcKnowledgeService.update(knowledge));
    }

    @DeleteMapping("/{id}")
    @RequiresPermission("aigc:knowledge:delete")
    public Result<Void> delete(@PathVariable String id) {
        aigcKnowledgeService.delete(id);
        return Result.success("删除成功", null);
    }

    @GetMapping("/{id}")
    public Result<AigcKnowledge> getById(@PathVariable String id) {
        return Result.success(aigcKnowledgeService.getById(id));
    }

    @GetMapping
    public Result<Map<String, Object>> list(@RequestParam(required = false) String name,
                                            @RequestParam(required = false) String userId) {
        List<AigcKnowledge> list = aigcKnowledgeService.list(name, userId);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("list", list);
        body.put("total", list.size());
        return Result.success(body);
    }
}
