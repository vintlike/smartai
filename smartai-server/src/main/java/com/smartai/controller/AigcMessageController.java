package com.smartai.controller;

import com.smartai.auth.LoginUser;
import com.smartai.auth.RequiresPermission;
import com.smartai.auth.UserContext;
import com.smartai.common.Result;
import com.smartai.entity.AigcMessage;
import com.smartai.service.AigcMessageService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/aigc/message")
public class AigcMessageController {

    private final AigcMessageService aigcMessageService;

    public AigcMessageController(AigcMessageService aigcMessageService) {
        this.aigcMessageService = aigcMessageService;
    }

    @PostMapping
    public Result<AigcMessage> create(@RequestBody AigcMessage message) {
        LoginUser loginUser = UserContext.get();
        if (loginUser == null || !loginUser.isSuperAdmin() || message.getUserId() == null
                || message.getUserId().isBlank()) {
            message.setUserId(loginUser == null ? null : loginUser.getId());
        }
        if (message.getUsername() == null || message.getUsername().isBlank()) {
            message.setUsername(loginUser == null ? null : loginUser.getUsername());
        }
        return Result.success("创建成功", aigcMessageService.create(message));
    }

    @DeleteMapping("/{id}")
    @RequiresPermission("aigc:message:delete")
    public Result<Void> delete(@PathVariable String id) {
        aigcMessageService.delete(id);
        return Result.success("删除成功", null);
    }

    @GetMapping("/{id}")
    public Result<AigcMessage> getById(@PathVariable String id) {
        return Result.success(aigcMessageService.getById(id));
    }

    @GetMapping("/conversation/{conversationId}")
    public Result<List<AigcMessage>> listByConversation(@PathVariable String conversationId) {
        return Result.success(aigcMessageService.listByConversationId(conversationId));
    }

    @GetMapping
    public Result<Map<String, Object>> list(@RequestParam(required = false) String userId,
                                            @RequestParam(required = false) String username,
                                            @RequestParam(required = false) String role,
                                            @RequestParam(required = false) String model,
                                            @RequestParam(required = false) String conversationId,
                                            @RequestParam(required = false)
                                            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                                            @RequestParam(required = false)
                                            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
                                            @RequestParam(defaultValue = "1") int page,
                                            @RequestParam(defaultValue = "10") int pageSize) {
        List<AigcMessage> list = aigcMessageService.list(userId, username, role, model, conversationId,
                startDate, endDate, page, pageSize);
        long total = aigcMessageService.count(userId, username, role, model, conversationId, startDate, endDate);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("list", list);
        body.put("total", total);
        return Result.success(body);
    }
}
