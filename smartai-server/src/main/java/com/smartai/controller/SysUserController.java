package com.smartai.controller;

import com.smartai.auth.RequiresPermission;
import com.smartai.common.Result;
import com.smartai.common.Secrets;
import com.smartai.entity.SysUser;
import com.smartai.service.SysUserService;
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
@RequestMapping("/api/sys/user")
public class SysUserController {

    private final SysUserService sysUserService;

    public SysUserController(SysUserService sysUserService) {
        this.sysUserService = sysUserService;
    }

    @PostMapping
    @RequiresPermission("upms:user:add")
    public Result<SysUser> create(@RequestBody SysUser user) {
        return Result.success("创建成功", mask(sysUserService.create(user)));
    }

    @PutMapping
    @RequiresPermission("upms:user:update")
    public Result<SysUser> update(@RequestBody SysUser user) {
        return Result.success("更新成功", mask(sysUserService.update(user)));
    }

    @PutMapping("/{id}/roles")
    @RequiresPermission("upms:user:update")
    public Result<Void> assignRoles(@PathVariable String id, @RequestBody List<String> roleIds) {
        sysUserService.assignRoles(id, roleIds);
        return Result.success("角色分配成功", null);
    }

    @PutMapping("/{id}/password")
    @RequiresPermission("upms:user:reset")
    public Result<Void> resetPassword(@PathVariable String id, @RequestBody Map<String, String> body) {
        sysUserService.resetPassword(id, body == null ? null : body.get("password"));
        return Result.success("密码重置成功", null);
    }

    @DeleteMapping("/{id}")
    @RequiresPermission("upms:user:delete")
    public Result<Void> delete(@PathVariable String id) {
        sysUserService.delete(id);
        return Result.success("删除成功", null);
    }

    @GetMapping("/{id}")
    public Result<SysUser> getById(@PathVariable String id) {
        return Result.success(mask(sysUserService.getById(id)));
    }

    @GetMapping
    public Result<Map<String, Object>> list(@RequestParam(required = false) String username,
                                            @RequestParam(required = false) String realName,
                                            @RequestParam(required = false) String phone,
                                            @RequestParam(required = false) String deptId,
                                            @RequestParam(required = false) Boolean isEnabled) {
        List<SysUser> list = sysUserService.list(username, realName, phone, deptId, isEnabled);
        list.forEach(SysUserController::mask);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("list", list);
        body.put("total", list.size());
        return Result.success(body);
    }

    private static SysUser mask(SysUser user) {
        if (user != null) {
            user.setPassword(Secrets.mask(user.getPassword()));
        }
        return user;
    }
}
