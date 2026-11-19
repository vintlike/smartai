package com.smartai.controller;

import com.smartai.auth.RequiresPermission;
import com.smartai.common.Result;
import com.smartai.entity.SysProvider;
import com.smartai.service.SysProviderService;
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
@RequestMapping("/api/sys/provider")
public class SysProviderController {

    private final SysProviderService sysProviderService;

    public SysProviderController(SysProviderService sysProviderService) {
        this.sysProviderService = sysProviderService;
    }

    @PostMapping
    @RequiresPermission("aigc:provider:add")
    public Result<SysProvider> create(@RequestBody SysProvider provider) {
        return Result.success("创建成功", sysProviderService.create(provider));
    }

    @PutMapping
    @RequiresPermission("aigc:provider:update")
    public Result<SysProvider> update(@RequestBody SysProvider provider) {
        return Result.success("更新成功", sysProviderService.update(provider));
    }

    @DeleteMapping("/{id}")
    @RequiresPermission("aigc:provider:delete")
    public Result<Void> delete(@PathVariable String id) {
        sysProviderService.delete(id);
        return Result.success("删除成功", null);
    }

    @GetMapping("/{id}")
    public Result<SysProvider> getById(@PathVariable String id) {
        return Result.success(sysProviderService.getById(id));
    }

    @GetMapping
    public Result<Map<String, Object>> list(@RequestParam(required = false) String name,
                                            @RequestParam(required = false) String code) {
        List<SysProvider> list = sysProviderService.list(name, code);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("list", list);
        body.put("total", list.size());
        return Result.success(body);
    }
}
