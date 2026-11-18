package com.smartai.server.system.controller;

import com.smartai.server.auth.security.RequiresPerm;
import com.smartai.server.common.api.PageQuery;
import com.smartai.server.common.api.PageResult;
import com.smartai.server.common.api.Result;
import com.smartai.server.system.dto.AssignMenusRequest;
import com.smartai.server.system.dto.RoleSaveRequest;
import com.smartai.server.system.service.SysRoleService;
import com.smartai.server.system.vo.RoleVO;
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
@RequestMapping("/api/sys/role")
@RequiredArgsConstructor
public class SysRoleController {

    private final SysRoleService roleService;

    @RequiresPerm("role")
    @GetMapping
    public Result<PageResult<RoleVO>> page(PageQuery query) {
        return Result.ok(roleService.page(query));
    }

    @RequiresPerm("role")
    @GetMapping("/user/{userId}")
    public Result<PageResult<RoleVO>> rolesOfUser(@PathVariable String userId) {
        return Result.ok(roleService.rolesOfUser(userId));
    }

    @RequiresPerm("upms:role:add")
    @PostMapping
    public Result<Void> create(@RequestBody RoleSaveRequest request) {
        roleService.create(request);
        return Result.ok();
    }

    @RequiresPerm("upms:role:update")
    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable String id, @RequestBody RoleSaveRequest request) {
        roleService.update(id, request);
        return Result.ok();
    }

    @RequiresPerm("upms:role:delete")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable String id) {
        roleService.delete(id);
        return Result.ok();
    }

    @RequiresPerm("upms:role:update")
    @PostMapping("/{roleId}/menus")
    public Result<Void> assignMenus(@PathVariable String roleId, @RequestBody AssignMenusRequest request) {
        roleService.assignMenus(roleId, request == null ? List.of() : request.getMenuIds());
        return Result.ok();
    }
}
