package com.smartai.server.system.controller;

import com.smartai.server.auth.security.RequiresPerm;
import com.smartai.server.common.api.PageQuery;
import com.smartai.server.common.api.PageResult;
import com.smartai.server.common.api.Result;
import com.smartai.server.system.dto.MenuSaveRequest;
import com.smartai.server.system.service.SysMenuService;
import com.smartai.server.system.vo.MenuVO;
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
@RequestMapping("/api/sys/menu")
@RequiredArgsConstructor
public class SysMenuController {

    private final SysMenuService menuService;

    /** 前端 fetchMenus 使用的菜单树数据源（按当前用户授权过滤） */
    @GetMapping
    public Result<PageResult<MenuVO>> page(PageQuery query) {
        return Result.ok(menuService.page(query));
    }

    @RequiresPerm("menu")
    @GetMapping("/role/{roleId}")
    public Result<PageResult<MenuVO>> byRole(@PathVariable String roleId, PageQuery query) {
        return Result.ok(menuService.byRole(roleId, query));
    }

    @RequiresPerm("menu")
    @GetMapping("/user/{userId}")
    public Result<PageResult<MenuVO>> byUser(@PathVariable String userId, PageQuery query) {
        return Result.ok(menuService.byUser(userId, query));
    }

    @RequiresPerm("upms:menu:add")
    @PostMapping
    public Result<Void> create(@RequestBody MenuSaveRequest request) {
        menuService.create(request);
        return Result.ok();
    }

    @RequiresPerm("upms:menu:update")
    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable String id, @RequestBody MenuSaveRequest request) {
        menuService.update(id, request);
        return Result.ok();
    }

    @RequiresPerm("upms:menu:delete")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable String id) {
        menuService.delete(id);
        return Result.ok();
    }
}
