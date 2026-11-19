package com.smartai.controller;

import com.smartai.auth.RequiresPermission;
import com.smartai.common.Result;
import com.smartai.entity.SysDept;
import com.smartai.service.SysDeptService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/sys/dept")
public class SysDeptController {

    private final SysDeptService sysDeptService;

    public SysDeptController(SysDeptService sysDeptService) {
        this.sysDeptService = sysDeptService;
    }

    @PostMapping
    @RequiresPermission("upms:dept:add")
    public Result<SysDept> create(@RequestBody SysDept dept) {
        return Result.success("创建成功", sysDeptService.create(dept));
    }

    @PutMapping
    @RequiresPermission("upms:dept:update")
    public Result<SysDept> update(@RequestBody SysDept dept) {
        return Result.success("更新成功", sysDeptService.update(dept));
    }

    @DeleteMapping("/{id}")
    @RequiresPermission("upms:dept:delete")
    public Result<Void> delete(@PathVariable String id) {
        sysDeptService.delete(id);
        return Result.success("删除成功", null);
    }

    @GetMapping("/{id}")
    public Result<SysDept> getById(@PathVariable String id) {
        return Result.success(sysDeptService.getById(id));
    }

    @GetMapping
    public Result<List<SysDept>> list(@RequestParam(required = false) String name,
                                      @RequestParam(required = false) String parentId) {
        return Result.success(sysDeptService.list(name, parentId));
    }
}
