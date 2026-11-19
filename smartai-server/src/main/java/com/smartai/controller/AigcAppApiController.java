package com.smartai.controller;

import com.smartai.auth.RequiresPermission;
import com.smartai.common.Result;
import com.smartai.entity.AigcAppApi;
import com.smartai.service.AigcAppApiService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/aigc/app-api")
public class AigcAppApiController {

    private final AigcAppApiService aigcAppApiService;

    public AigcAppApiController(AigcAppApiService aigcAppApiService) {
        this.aigcAppApiService = aigcAppApiService;
    }

    @GetMapping("/app/{appId}")
    public Result<List<AigcAppApi>> listByAppId(@PathVariable String appId) {
        return Result.success(aigcAppApiService.listByAppId(appId));
    }

    @PostMapping
    @RequiresPermission("aigc:app:update")
    public Result<AigcAppApi> create(@RequestBody AigcAppApi api) {
        return Result.success("创建成功", aigcAppApiService.create(api));
    }

    @DeleteMapping("/{id}")
    @RequiresPermission("aigc:app:update")
    public Result<Void> delete(@PathVariable String id) {
        aigcAppApiService.delete(id);
        return Result.success("删除成功", null);
    }
}
