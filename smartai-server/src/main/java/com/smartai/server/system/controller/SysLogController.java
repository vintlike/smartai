package com.smartai.server.system.controller;

import com.smartai.server.auth.security.RequiresPerm;
import com.smartai.server.common.api.PageQuery;
import com.smartai.server.common.api.PageResult;
import com.smartai.server.common.api.Result;
import com.smartai.server.system.service.SysLogService;
import com.smartai.server.system.vo.LogVO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sys/log")
@RequiredArgsConstructor
public class SysLogController {

    private final SysLogService logService;

    @RequiresPerm("log")
    @GetMapping
    public Result<PageResult<LogVO>> page(PageQuery query,
                                          @RequestParam(required = false) Integer resultStatus) {
        return Result.ok(logService.page(query, resultStatus));
    }

    @RequiresPerm("system:log:delete")
    @DeleteMapping("/all")
    public Result<Void> deleteAll() {
        logService.deleteAll();
        return Result.ok();
    }

    @RequiresPerm("system:log:delete")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable String id) {
        logService.delete(id);
        return Result.ok();
    }
}
