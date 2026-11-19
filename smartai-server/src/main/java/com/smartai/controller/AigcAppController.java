package com.smartai.controller;

import com.smartai.auth.RequiresPermission;
import com.smartai.auth.UserContext;
import com.smartai.common.Result;
import com.smartai.entity.AigcApp;
import com.smartai.service.AigcAppService;
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
@RequestMapping("/api/aigc/app")
public class AigcAppController {

    private final AigcAppService aigcAppService;

    public AigcAppController(AigcAppService aigcAppService) {
        this.aigcAppService = aigcAppService;
    }

    @PostMapping
    @RequiresPermission("aigc:app:add")
    public Result<AigcApp> create(@RequestBody AigcApp app) {
        app.setUserId(UserContext.getUserId());
        return Result.success("创建成功", aigcAppService.create(app));
    }

    @PutMapping
    @RequiresPermission("aigc:app:update")
    public Result<AigcApp> update(@RequestBody AigcApp app) {
        return Result.success("更新成功", aigcAppService.update(app));
    }

    @DeleteMapping("/{id}")
    @RequiresPermission("aigc:app:delete")
    public Result<Void> delete(@PathVariable String id) {
        aigcAppService.delete(id);
        return Result.success("删除成功", null);
    }

    @GetMapping("/{id}")
    public Result<AigcApp> getById(@PathVariable String id) {
        return Result.success(aigcAppService.getById(id));
    }

    @GetMapping
    public Result<Map<String, Object>> list(@RequestParam(required = false) String name) {
        List<AigcApp> list = aigcAppService.list(name);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("list", list);
        body.put("total", list.size());
        return Result.success(body);
    }
}
