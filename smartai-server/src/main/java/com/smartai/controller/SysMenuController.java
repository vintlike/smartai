package com.smartai.controller;

import com.smartai.auth.RequiresPermission;
import com.smartai.common.Result;
import com.smartai.entity.SysMenu;
import com.smartai.service.SysMenuService;
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
@RequestMapping("/api/sys/menu")
public class SysMenuController {

    private final SysMenuService sysMenuService;

    public SysMenuController(SysMenuService sysMenuService) {
        this.sysMenuService = sysMenuService;
    }

    @GetMapping("/current")
    public Result<List<SysMenu>> current() {
        return Result.success(sysMenuService.currentMenus());
    }

    @PostMapping
    @RequiresPermission("upms:menu:add")
    public Result<SysMenu> create(@RequestBody SysMenu menu) {
        return Result.success("创建成功", sysMenuService.create(menu));
    }

    @PutMapping
    @RequiresPermission("upms:menu:update")
    public Result<SysMenu> update(@RequestBody SysMenu menu) {
        return Result.success("更新成功", sysMenuService.update(menu));
    }

    @DeleteMapping("/{id}")
    @RequiresPermission("upms:menu:delete")
    public Result<Void> delete(@PathVariable String id) {
        sysMenuService.delete(id);
        return Result.success("删除成功", null);
    }

    @GetMapping("/{id}")
    public Result<SysMenu> getById(@PathVariable String id) {
        return Result.success(sysMenuService.getById(id));
    }

    @GetMapping
    public Result<List<SysMenu>> list(@RequestParam(required = false) String name,
                                      @RequestParam(required = false) String type,
                                      @RequestParam(required = false) String parentId) {
        return Result.success(sysMenuService.list(name, type, parentId));
    }

    @GetMapping("/role/{roleId}")
    public Result<List<SysMenu>> listByRoleId(@PathVariable String roleId) {
        return Result.success(sysMenuService.listByRoleId(roleId));
    }

    @GetMapping("/user/{userId}")
    public Result<List<SysMenu>> listByUserId(@PathVariable String userId) {
        return Result.success(sysMenuService.listByUserId(userId));
    }
}
