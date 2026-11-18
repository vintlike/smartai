package com.smartai.server.system.controller;

import com.smartai.server.auth.security.RequiresPerm;
import com.smartai.server.common.api.PageQuery;
import com.smartai.server.common.api.PageResult;
import com.smartai.server.common.api.Result;
import com.smartai.server.system.dto.DeptSaveRequest;
import com.smartai.server.system.service.SysDeptService;
import com.smartai.server.system.vo.DeptVO;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sys/dept")
@RequiredArgsConstructor
public class SysDeptController {

    private final SysDeptService deptService;

    @RequiresPerm("dept")
    @GetMapping
    public Result<PageResult<DeptVO>> page(PageQuery query) {
        return Result.ok(deptService.page(query));
    }

    @RequiresPerm("dept")
    @GetMapping("/tree")
    public Result<List<DeptVO>> tree() {
        return Result.ok(deptService.tree());
    }

    @RequiresPerm("upms:dept:add")
    @PostMapping
    public Result<Void> create(@RequestBody DeptSaveRequest request) {
        deptService.create(request);
        return Result.ok();
    }

    @RequiresPerm("upms:dept:update")
    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable String id, @RequestBody DeptSaveRequest request) {
        deptService.update(id, request);
        return Result.ok();
    }

    @RequiresPerm("upms:dept:delete")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable String id) {
        deptService.delete(id);
        return Result.ok();
    }
}
