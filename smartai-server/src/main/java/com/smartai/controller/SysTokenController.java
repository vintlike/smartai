package com.smartai.controller;

import com.smartai.auth.RequiresPermission;
import com.smartai.common.Result;
import com.smartai.entity.SysToken;
import com.smartai.service.SysTokenService;
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
@RequestMapping("/api/sys/token")
public class SysTokenController {

    private final SysTokenService sysTokenService;

    public SysTokenController(SysTokenService sysTokenService) {
        this.sysTokenService = sysTokenService;
    }

    @GetMapping
    public Result<Map<String, Object>> list(@RequestParam(required = false) String account) {
        List<SysToken> list = sysTokenService.list(account);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("list", list);
        body.put("total", list.size());
        return Result.success(body);
    }

    @DeleteMapping("/{id}")
    @RequiresPermission("system:token:delete")
    public Result<Void> delete(@PathVariable String id) {
        sysTokenService.delete(id);
        return Result.success("删除成功", null);
    }
}
