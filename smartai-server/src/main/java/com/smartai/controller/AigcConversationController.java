package com.smartai.controller;

import com.smartai.auth.LoginUser;
import com.smartai.auth.UserContext;
import com.smartai.common.Result;
import com.smartai.entity.AigcConversation;
import com.smartai.exception.ForbiddenException;
import com.smartai.service.AigcConversationService;
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
@RequestMapping("/api/aigc/conversation")
public class AigcConversationController {

    private final AigcConversationService aigcConversationService;

    public AigcConversationController(AigcConversationService aigcConversationService) {
        this.aigcConversationService = aigcConversationService;
    }

    @PostMapping
    public Result<AigcConversation> create(@RequestBody AigcConversation conversation) {
        LoginUser loginUser = UserContext.get();
        if (loginUser == null || !loginUser.isSuperAdmin() || conversation.getUserId() == null
                || conversation.getUserId().isBlank()) {
            conversation.setUserId(loginUser == null ? null : loginUser.getId());
        }
        return Result.success("创建成功", aigcConversationService.create(conversation));
    }

    @PutMapping
    public Result<AigcConversation> update(@RequestBody AigcConversation conversation) {
        AigcConversation existing = aigcConversationService.getById(conversation.getId());
        ensureOwner(existing.getUserId(), "只能修改自己的会话");
        return Result.success("更新成功", aigcConversationService.update(conversation));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable String id) {
        AigcConversation existing = aigcConversationService.getById(id);
        LoginUser loginUser = UserContext.get();
        boolean superAdmin = loginUser != null && loginUser.isSuperAdmin();
        boolean owner = loginUser != null && loginUser.getId().equals(existing.getUserId());
        boolean canDelete = superAdmin || owner
                || (loginUser != null && loginUser.hasPerm("aigc:message:delete"));
        if (!canDelete) {
            throw new ForbiddenException("只能删除自己的会话");
        }
        aigcConversationService.delete(id);
        return Result.success("删除成功", null);
    }

    @GetMapping("/{id}")
    public Result<AigcConversation> getById(@PathVariable String id) {
        AigcConversation conversation = aigcConversationService.getById(id);
        ensureOwner(conversation.getUserId(), "只能查看自己的会话");
        return Result.success(conversation);
    }

    @GetMapping("/user/{userId}")
    public Result<List<AigcConversation>> listByUserId(@PathVariable String userId) {
        ensureOwner(userId, "只能查看自己的会话");
        return Result.success(aigcConversationService.listByUserId(userId));
    }

    @GetMapping
    public Result<Map<String, Object>> list(@RequestParam(required = false) String keyword,
                                            @RequestParam(defaultValue = "1") int page,
                                            @RequestParam(defaultValue = "10") int pageSize) {
        LoginUser loginUser = UserContext.get();
        String userId = loginUser == null || loginUser.isSuperAdmin() ? null : loginUser.getId();
        List<AigcConversation> list = aigcConversationService.listPage(userId, keyword, page, pageSize);
        long total = aigcConversationService.count(userId, keyword);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("list", list);
        body.put("total", total);
        return Result.success(body);
    }

    private void ensureOwner(String userId, String message) {
        LoginUser loginUser = UserContext.get();
        if (loginUser != null && loginUser.isSuperAdmin()) {
            return;
        }
        if (loginUser == null || !loginUser.getId().equals(userId)) {
            throw new ForbiddenException(message);
        }
    }
}
