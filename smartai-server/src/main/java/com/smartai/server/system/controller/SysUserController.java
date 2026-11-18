package com.smartai.server.system.controller;

import com.smartai.server.auth.security.RequiresPerm;
import com.smartai.server.common.api.PageQuery;
import com.smartai.server.common.api.PageResult;
import com.smartai.server.common.api.Result;
import com.smartai.server.system.dto.AssignRolesRequest;
import com.smartai.server.system.dto.UserSaveRequest;
import com.smartai.server.system.service.SysUserService;
import com.smartai.server.system.vo.RoleVO;
import com.smartai.server.system.vo.UserVO;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sys/user")
@RequiredArgsConstructor
public class SysUserController {

    private final SysUserService userService;

    @RequiresPerm("user")
    @GetMapping
    public Result<PageResult<UserVO>> page(PageQuery query,
                                           @RequestParam(required = false) String deptId,
                                           @RequestParam(required = false) Integer isEnabled) {
        return Result.ok(userService.page(query, deptId, isEnabled));
    }

    /** 与前端契约一致：GET /api/sys/user/{id} 返回该用户的角色 */
    @RequiresPerm("user")
    @GetMapping("/{id}")
    public Result<PageResult<RoleVO>> roles(@PathVariable String id) {
        return Result.ok(userService.rolesOfUser(id));
    }

    @RequiresPerm("upms:user:add")
    @PostMapping
    public Result<Void> create(@RequestBody UserSaveRequest request) {
        userService.create(request);
        return Result.ok();
    }

    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable String id, @RequestBody UserSaveRequest request) {
        userService.update(id, request);
        return Result.ok();
    }

    @RequiresPerm("upms:user:delete")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable String id) {
        userService.delete(id);
        return Result.ok();
    }

    @RequiresPerm("upms:user:update")
    @PutMapping("/{id}/roles")
    public Result<Void> assignRoles(@PathVariable String id, @RequestBody AssignRolesRequest request) {
        userService.assignRoles(id, request == null ? List.of() : request.getRoleIds());
        return Result.ok();
    }
}
