package com.smartai.controller;

import com.smartai.auth.RequiresPermission;
import com.smartai.auth.UserContext;
import com.smartai.common.Result;
import com.smartai.dto.ChatRequest;
import com.smartai.entity.AigcConversation;
import com.smartai.entity.AigcMessage;
import com.smartai.entity.AigcModel;
import com.smartai.exception.BusinessException;
import com.smartai.llm.LlmChatMessage;
import com.smartai.llm.LlmChatRequest;
import com.smartai.llm.LlmChatResponse;
import com.smartai.llm.LlmClient;
import com.smartai.llm.LlmConfig;
import com.smartai.llm.LlmException;
import com.smartai.llm.LlmStreamListener;
import com.smartai.mapper.AigcConversationMapper;
import com.smartai.mapper.AigcModelMapper;
import com.smartai.service.AigcConversationService;
import com.smartai.service.AigcMessageService;
import com.smartai.service.AigcModelService;
import com.smartai.service.utils.ModelCallUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Slf4j
@RestController
@RequestMapping("/api/aigc/chat")
public class AigcChatController {

    public static final int TITLE_MAX_LENGTH = 30;

    private static final long SSE_TIMEOUT_MILLIS = 300000L;
    private static final String DEFAULT_TITLE = "新对话";

    private static final ExecutorService EXECUTOR = Executors.newCachedThreadPool(runnable -> {
        Thread thread = new Thread(runnable, "aigc-chat-stream");
        thread.setDaemon(true);
        return thread;
    });

    private final AigcModelService aigcModelService;
    private final AigcModelMapper aigcModelMapper;
    private final AigcConversationService aigcConversationService;
    private final AigcMessageService aigcMessageService;
    private final AigcConversationMapper aigcConversationMapper;

    public AigcChatController(AigcModelService aigcModelService, AigcModelMapper aigcModelMapper,
                              AigcConversationService aigcConversationService,
                              AigcMessageService aigcMessageService,
                              AigcConversationMapper aigcConversationMapper) {
        this.aigcModelService = aigcModelService;
        this.aigcModelMapper = aigcModelMapper;
        this.aigcConversationService = aigcConversationService;
        this.aigcMessageService = aigcMessageService;
        this.aigcConversationMapper = aigcConversationMapper;
    }

    @GetMapping("/models")
    public Result<List<Map<String, Object>>> models() {
        List<Map<String, Object>> options = new ArrayList<>();
        for (AigcModel model : aigcModelService.listForChat()) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("value", model.getModel());
            item.put("label", model.getName() == null || model.getName().isBlank() ? model.getModel() : model.getName());
            item.put("disabled", AigcModel.STATUS_DISABLED.equals(model.getStatus()));
            options.add(item);
        }
        return Result.success(options);
    }

    @PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @RequiresPermission("chat:completions")
    public SseEmitter stream(@RequestBody ChatRequest request, HttpServletRequest httpRequest) {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT_MILLIS);
        String userId = UserContext.getUserId();
        String username = UserContext.getUsername();
        String ip = resolveIp(httpRequest);
        EXECUTOR.execute(() -> handleStream(request, userId, username, ip, emitter));
        return emitter;
    }

    private void handleStream(ChatRequest request, String userId, String username, String ip, SseEmitter emitter) {
        try {
            LlmClient client = resolveClient(request.getModel());
            AigcConversation conversation = resolveConversation(request, userId);
            String model = request.getModel() == null || request.getModel().isBlank()
                    ? LlmConfig.getDefaultModel() : request.getModel();

            AigcMessage userMessage = new AigcMessage();
            userMessage.setUserId(userId);
            userMessage.setUsername(username);
            userMessage.setIp(ip);
            userMessage.setRole(LlmChatMessage.ROLE_USER);
            userMessage.setModel(model);
            userMessage.setConversationId(conversation.getId());
            userMessage.setContent(lastUserContent(request.getMessages()));
            aigcMessageService.create(userMessage);

            Map<String, Object> meta = new LinkedHashMap<>();
            meta.put("conversationId", conversation.getId());
            meta.put("title", conversation.getTitle());
            send(emitter, "meta", meta);

            LlmChatRequest llmRequest = toLlmRequest(request);
            llmRequest.setModel(model);
            client.chatStream(llmRequest, new LlmStreamListener() {
                @Override
                public void onDelta(String delta) {
                    send(emitter, "delta", Map.of("content", delta));
                }

                @Override
                public void onComplete(String fullContent, LlmChatResponse lastChunk) {
                    if (fullContent != null && !fullContent.isEmpty()) {
                        saveAssistantMessage(fullContent, lastChunk, conversation.getId(), model, userId, username, ip);
                    }
                    Map<String, Object> done = new LinkedHashMap<>();
                    done.put("content", fullContent == null ? "" : fullContent);
                    done.put("model", model);
                    send(emitter, "done", done);
                    emitter.complete();
                }

                @Override
                public void onError(Throwable error) {
                    sendError(emitter, error);
                }
            });
        } catch (Exception ex) {
            sendError(emitter, ex);
        }
    }

    private LlmClient resolveClient(String modelName) {
        if (modelName == null || modelName.isBlank()) {
            return ModelCallUtil.gatewayClient();
        }
        AigcModel model = aigcModelMapper.selectByModel(modelName);
        if (model == null) {
            return ModelCallUtil.gatewayClient();
        }
        if (AigcModel.STATUS_DISABLED.equals(model.getStatus())) {
            String label = model.getName() == null || model.getName().isBlank() ? model.getModel() : model.getName();
            throw new BusinessException("模型「" + label + "」已被禁用，请在模型管理中启用或更换模型");
        }
        return ModelCallUtil.gatewayClient(model.getBaseUrl(), model.getApiKey());
    }

    private AigcConversation resolveConversation(ChatRequest request, String userId) {
        String conversationId = request.getConversationId();
        if (conversationId != null && !conversationId.isBlank()) {
            AigcConversation existing = aigcConversationMapper.selectById(conversationId);
            if (existing != null) {
                return existing;
            }
        }
        AigcConversation conversation = new AigcConversation();
        conversation.setUserId(userId);
        conversation.setTitle(buildTitle(lastUserContent(request.getMessages())));
        return aigcConversationService.create(conversation);
    }

    private void saveAssistantMessage(String content, LlmChatResponse lastChunk, String conversationId,
                                      String model, String userId, String username, String ip) {
        AigcMessage message = new AigcMessage();
        message.setUserId(userId);
        message.setUsername(username);
        message.setIp(ip);
        message.setRole(LlmChatMessage.ROLE_ASSISTANT);
        message.setModel(model);
        message.setContent(content);
        message.setConversationId(conversationId);
        LlmChatResponse.Usage usage = lastChunk == null ? null : lastChunk.getUsage();
        Integer promptTokens = usage == null ? null : usage.getPromptTokens();
        Integer completionTokens = usage == null ? null : usage.getCompletionTokens();
        Integer totalTokens = usage == null ? null : usage.getTotalTokens();
        if (totalTokens == null && promptTokens != null && completionTokens != null) {
            totalTokens = promptTokens + completionTokens;
        }
        message.setPromptTokens(promptTokens);
        message.setTotalTokens(totalTokens);
        aigcMessageService.create(message);
    }

    private LlmChatRequest toLlmRequest(ChatRequest request) {
        if (request.getMessages() == null || request.getMessages().isEmpty()) {
            throw new LlmException("消息不能为空");
        }
        String model = request.getModel() == null || request.getModel().isBlank()
                ? LlmConfig.getDefaultModel() : request.getModel();
        LlmChatRequest llmRequest = LlmChatRequest.of(model);
        if (request.getSystemPrompt() != null && !request.getSystemPrompt().isBlank()) {
            llmRequest.addMessage(LlmChatMessage.system(request.getSystemPrompt()));
        }
        for (LlmChatMessage message : request.getMessages()) {
            if (message == null || message.getContent() == null || message.getContent().isBlank()) {
                continue;
            }
            if (LlmChatMessage.ROLE_USER.equals(message.getRole())) {
                llmRequest.addMessage(LlmChatMessage.user(message.getContent()));
            } else if (LlmChatMessage.ROLE_ASSISTANT.equals(message.getRole())) {
                llmRequest.addMessage(LlmChatMessage.assistant(message.getContent()));
            }
        }
        if (llmRequest.getMessages().isEmpty()) {
            throw new LlmException("消息不能为空");
        }
        return llmRequest;
    }

    private String lastUserContent(List<LlmChatMessage> messages) {
        if (messages == null) {
            return "";
        }
        for (int i = messages.size() - 1; i >= 0; i--) {
            LlmChatMessage message = messages.get(i);
            if (message != null && LlmChatMessage.ROLE_USER.equals(message.getRole())) {
                return message.getContent() == null ? "" : message.getContent();
            }
        }
        return "";
    }

    private String buildTitle(String content) {
        String title = content == null ? "" : content.trim().replaceAll("\\s+", " ");
        if (title.isEmpty()) {
            return DEFAULT_TITLE;
        }
        return title.length() > TITLE_MAX_LENGTH ? title.substring(0, TITLE_MAX_LENGTH) + "…" : title;
    }

    private void send(SseEmitter emitter, String event, Object data) {
        try {
            emitter.send(SseEmitter.event().name(event).data(data, MediaType.APPLICATION_JSON));
        } catch (Exception ex) {
            log.debug("SSE推送失败，event:{}", event, ex);
        }
    }

    private void sendError(SseEmitter emitter, Throwable error) {
        String message = error == null || error.getMessage() == null ? "服务异常" : error.getMessage();
        send(emitter, "error", Map.of("message", message));
        emitter.complete();
    }

    private String resolveIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
