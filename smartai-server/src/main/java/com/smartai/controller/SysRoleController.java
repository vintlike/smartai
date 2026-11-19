package com.smartai.controller;

import com.smartai.auth.RequiresPermission;
import com.smartai.common.Result;
import com.smartai.entity.SysRole;
import com.smartai.entity.SysUserRole;
import com.smartai.service.SysRoleService;
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
@RequestMapping("/api/sys/role")
public class SysRoleController {

    private final SysRoleService sysRoleService;

    public SysRoleController(SysRoleService sysRoleService) {
        this.sysRoleService = sysRoleService;
    }

    @PostMapping
    @RequiresPermission("upms:role:add")
    public Result<SysRole> create(@RequestBody SysRole role) {
        return Result.success("创建成功", sysRoleService.create(role));
    }

    @PutMapping
    @RequiresPermission("upms:role:update")
    public Result<SysRole> update(@RequestBody SysRole role) {
        return Result.success("更新成功", sysRoleService.update(role));
    }

    @PutMapping("/{id}/menus")
    @RequiresPermission("upms:role:update")
    public Result<Void> assignMenus(@PathVariable String id, @RequestBody List<String> menuIds) {
        sysRoleService.assignMenus(id, menuIds);
        return Result.success("授权保存成功", null);
    }

    @DeleteMapping("/{id}")
    @RequiresPermission("upms:role:delete")
    public Result<Void> delete(@PathVariable String id) {
        sysRoleService.delete(id);
        return Result.success("删除成功", null);
    }

    @GetMapping("/{id}")
    public Result<SysRole> getById(@PathVariable String id) {
        return Result.success(sysRoleService.getById(id));
    }

    @GetMapping
    public Result<Map<String, Object>> list(@RequestParam(required = false) String name,
                                            @RequestParam(required = false) String code) {
        List<SysRole> list = sysRoleService.list(name, code);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("list", list);
        body.put("total", list.size());
        return Result.success(body);
    }

    @GetMapping("/user/{userId}")
    public Result<List<SysRole>> listByUserId(@PathVariable String userId) {
        return Result.success(sysRoleService.listByUserId(userId));
    }

    @GetMapping("/user-roles")
    public Result<List<SysUserRole>> listUserRoles(@RequestParam(required = false) List<String> userIds) {
        return Result.success(sysRoleService.listUserRoles(userIds));
    }
}
