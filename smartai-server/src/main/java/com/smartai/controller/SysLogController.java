package com.smartai.controller;

import com.smartai.auth.RequiresPermission;
import com.smartai.common.Result;
import com.smartai.entity.SysLog;
import com.smartai.service.SysLogService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sys/log")
public class SysLogController {

    private final SysLogService sysLogService;

    public SysLogController(SysLogService sysLogService) {
        this.sysLogService = sysLogService;
    }

    @DeleteMapping("/{id}")
    @RequiresPermission("system:log:delete")
    public Result<Void> delete(@PathVariable String id) {
        sysLogService.delete(id);
        return Result.success("删除成功", null);
    }

    @GetMapping("/{id}")
    public Result<SysLog> getById(@PathVariable String id) {
        return Result.success(sysLogService.getById(id));
    }

    @GetMapping
    public Result<Map<String, Object>> list(@RequestParam(required = false) String username,
                                            @RequestParam(required = false) String operation,
                                            @RequestParam(required = false) Integer resultStatus) {
        List<SysLog> list = sysLogService.list(username, operation, resultStatus);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("list", list);
        body.put("total", list.size());
        return Result.success(body);
    }

    @DeleteMapping("/all")
    @RequiresPermission("system:log:delete")
    public Result<Void> deleteAll() {
        sysLogService.deleteAll();
        return Result.success("清空成功", null);
    }
}
