import {
  ClearOutlined,
  CopyOutlined,
  DislikeFilled,
  DislikeOutlined,
  EditOutlined,
  LikeFilled,
  LikeOutlined,
  PaperClipOutlined,
  PlusOutlined,
  RedoOutlined,
  RobotOutlined,
  SendOutlined,
  ShareAltOutlined,
  StopOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { prepareWithSegments, walkLineRanges } from '@chenglou/pretext';
import { App, Avatar, Button, Card, Empty, Input, Select, Tag, Tooltip } from 'antd';
import type { TextAreaRef } from 'antd/es/input/TextArea';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  type ChatStreamTask,
  conversationApi,
  type MessageRecord,
  type ModelRecord,
  messageApi,
  modelApi,
  streamChat,
} from '@/api/aigc';
import { useAuth } from '@/auth/AuthProvider';
import PageContainer from '@/components/PageContainer';

const BUBBLE_PADDING_X = 24;
const BUBBLE_MAX_WIDTH_RATIO = 0.8;
const FONT = '14px "PingFang SC", "Microsoft YaHei", sans-serif';
const LINE_HEIGHT = 22;

interface ConversationItem {
  id: string;
  title: string;
  createTime?: string;
  messageCount?: number;
  tokenUsed?: number;
  lastConversationTime?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
  pending?: boolean;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

/** 后端时间字符串与本地时间戳统一显示为 HH:mm */
function formatClock(value?: string | number): string {
  if (value === undefined) {
    const now = new Date();
    return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  }
  if (typeof value === 'number') {
    const date = new Date(value);
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
  const matched = /(\d{2}):(\d{2})/.exec(value);
  return matched ? `${matched[1]}:${matched[2]}` : value;
}

/** 会话列表时间：yyyy-MM-dd HH:mm:ss → MM-dd HH:mm */
function formatMoment(value?: string): string {
  if (!value) return '-';
  const matched = /^\d{4}-(\d{2}-\d{2})[ T](\d{2}:\d{2})/.exec(value);
  return matched ? `${matched[1]} ${matched[2]}` : value;
}

function measureBubble(content: string, containerWidth: number) {
  const contentMaxWidth = Math.max(
    0,
    Math.floor(containerWidth * BUBBLE_MAX_WIDTH_RATIO) - BUBBLE_PADDING_X,
  );
  if (contentMaxWidth <= 0) {
    return { width: 0, height: LINE_HEIGHT };
  }
  const prepared = prepareWithSegments(content, FONT, { whiteSpace: 'pre-wrap' });
  let maxW = 0;
  const lineCount = walkLineRanges(prepared, contentMaxWidth, (line) => {
    maxW = Math.max(maxW, line.width);
  });
  return {
    width: Math.ceil(maxW) + BUBBLE_PADDING_X,
    height: Math.max(1, lineCount) * LINE_HEIGHT,
  };
}

const actionClass =
  'cursor-pointer text-14px text-[var(--ant-color-text-tertiary)] transition-colors hover:text-[var(--ant-color-primary)]';

interface MessageBubbleProps {
  messageItem: ChatMessage;
  containerWidth: number;
  feedback?: 'like' | 'dislike';
  onCopy: (content: string) => void;
  onShare: (id: string) => void;
  onEdit: (content: string) => void;
  onRedo: (id: string) => void;
  onFeedback: (id: string, value: 'like' | 'dislike') => void;
}

function MessageBubble({
  messageItem,
  containerWidth,
  feedback,
  onCopy,
  onShare,
  onEdit,
  onRedo,
  onFeedback,
}: MessageBubbleProps) {
  const isUser = messageItem.role === 'user';
  const { width, height } = measureBubble(messageItem.content, containerWidth);

  return (
    <div className={`mb-4 flex gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
      <Avatar
        size={36}
        icon={isUser ? <UserOutlined /> : <RobotOutlined />}
        style={isUser ? undefined : { backgroundColor: 'var(--ant-color-primary)', color: '#fff' }}
      />
      <div className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-12px px-3 py-2 ${
            isUser
              ? 'bg-[var(--ant-color-primary)] text-white'
              : 'bg-[var(--ant-color-fill-tertiary)] text-[var(--ant-color-text)]'
          }`}
          style={{ maxWidth: '80%', width: width ? `${width}px` : undefined }}
        >
          <div
            style={{
              whiteSpace: 'pre-wrap',
              lineHeight: `${LINE_HEIGHT}px`,
              fontSize: 14,
              height,
              overflow: 'hidden',
            }}
          >
            {messageItem.content}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isUser ? (
            <>
              <span className="text-12px text-[var(--ant-color-text-tertiary)]">
                {messageItem.time}
              </span>
              <Tooltip title="复制">
                <CopyOutlined className={actionClass} onClick={() => onCopy(messageItem.content)} />
              </Tooltip>
              <Tooltip title="编辑并重新发送">
                <EditOutlined className={actionClass} onClick={() => onEdit(messageItem.content)} />
              </Tooltip>
            </>
          ) : (
            <>
              <Tooltip title="复制">
                <CopyOutlined className={actionClass} onClick={() => onCopy(messageItem.content)} />
              </Tooltip>
              <Tooltip title="重新生成">
                <RedoOutlined className={actionClass} onClick={() => onRedo(messageItem.id)} />
              </Tooltip>
              <Tooltip title="有帮助">
                {feedback === 'like' ? (
                  <LikeFilled
                    className="cursor-pointer text-14px text-[var(--ant-color-primary)]"
                    onClick={() => onFeedback(messageItem.id, 'like')}
                  />
                ) : (
                  <LikeOutlined
                    className={actionClass}
                    onClick={() => onFeedback(messageItem.id, 'like')}
                  />
                )}
              </Tooltip>
              <Tooltip title="没帮助">
                {feedback === 'dislike' ? (
                  <DislikeFilled
                    className="cursor-pointer text-14px text-[var(--ant-color-error)]"
                    onClick={() => onFeedback(messageItem.id, 'dislike')}
                  />
                ) : (
                  <DislikeOutlined
                    className={actionClass}
                    onClick={() => onFeedback(messageItem.id, 'dislike')}
                  />
                )}
              </Tooltip>
              <Tooltip title="分享">
                <ShareAltOutlined className={actionClass} onClick={() => onShare(messageItem.id)} />
              </Tooltip>
              <span className="text-12px text-[var(--ant-color-text-tertiary)]">
                {messageItem.time}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/** AI 对话：左侧历史会话，右侧对话区（保留气泡、复制、分享、时间等消息级操作） */
export default function AIChat() {
  const { message, modal } = App.useApp();
  const { user } = useAuth();
  const [models, setModels] = useState<ModelRecord[]>([]);
  const [modelId, setModelId] = useState<string>();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [conversationId, setConversationId] = useState<string>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const [contentWidth, setContentWidth] = useState(0);
  const [feedback, setFeedback] = useState<Record<string, 'like' | 'dislike'>>({});
  const listRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<TextAreaRef>(null);
  const streamRef = useRef<ChatStreamTask | null>(null);

  const loadConversations = useCallback(async () => {
    if (!user) return;
    try {
      const list = await conversationApi.listByUserId(String(user.id));
      setConversations(list);
    } catch {
      setConversations([]);
    }
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    modelApi
      .list({ type: 'chat', pageSize: 100 })
      .then((result) => {
        if (cancelled) return;
        setModels(result.list as unknown as ModelRecord[]);
        setModelId(result.list[0]?.id);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        message.error(error instanceof Error ? error.message : '模型加载失败');
      });
    void loadConversations();
    return () => {
      cancelled = true;
    };
  }, [loadConversations, message]);

  // 气泡宽度测量：跟随容器尺寸变化
  useEffect(() => {
    const container = listRef.current;
    if (!container) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setContentWidth(entry.contentRect.width);
    });
    observer.observe(container);
    setContentWidth(container.clientWidth);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(
    () => () => {
      streamRef.current?.abort();
    },
    [],
  );

  const stop = () => {
    streamRef.current?.abort();
    streamRef.current = null;
    setSending(false);
    message.info('已停止生成');
  };

  const openConversation = async (record: ConversationItem) => {
    stopStreamSilently();
    try {
      const list = await messageApi.listByConversationId(record.id);
      setConversationId(record.id);
      setMessages(
        list.map((item: MessageRecord) => ({
          id: String(item.id),
          role: item.role === 'user' ? 'user' : 'assistant',
          content: item.content ?? '',
          time: formatClock(item.createTime),
        })),
      );
    } catch (error) {
      message.error(error instanceof Error ? error.message : '会话加载失败');
    }
  };

  function stopStreamSilently() {
    streamRef.current?.abort();
    streamRef.current = null;
    setSending(false);
  }

  const newChat = () => {
    stopStreamSilently();
    setConversationId(undefined);
    setMessages([]);
    setInputValue('');
  };

  /** 发送问题：后端在流式过程中自动落库会话与消息，前端按事件增量渲染 */
  const sendQuestion = (question: string, baseMessages: ChatMessage[] = messages) => {
    const selectedModel = models.find((item) => item.id === modelId);
    const userMessage: ChatMessage = {
      id: `local-user-${Date.now()}`,
      role: 'user',
      content: question,
      time: formatClock(),
    };
    const replyId = `local-reply-${Date.now()}`;
    const history = [...baseMessages, userMessage].map((item) => ({
      role: item.role,
      content: item.content,
    }));
    setMessages((prev) => [
      ...prev,
      userMessage,
      { id: replyId, role: 'assistant', content: '', time: formatClock(), pending: true },
    ]);
    setSending(true);

    const task = streamChat(
      {
        model: selectedModel?.model,
        conversationId,
        messages: history,
      },
      {
        onMeta: ({ conversationId: nextId }) => {
          if (!nextId) return;
          setConversationId(nextId);
          void loadConversations();
        },
        onDelta: (delta) => {
          setMessages((prev) =>
            prev.map((item) =>
              item.id === replyId ? { ...item, content: item.content + delta } : item,
            ),
          );
        },
        onError: (errorMessage) => {
          message.error(errorMessage);
          setMessages((prev) =>
            prev.map((item) =>
              item.id === replyId
                ? { ...item, content: item.content || errorMessage, pending: false }
                : item,
            ),
          );
          setSending(false);
        },
        onDone: () => {
          setMessages((prev) =>
            prev.map((item) => (item.id === replyId ? { ...item, pending: false } : item)),
          );
          setSending(false);
          void loadConversations();
        },
      },
    );
    streamRef.current = task;
    task.done.catch((error: unknown) => {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setSending(false);
      message.error(error instanceof Error ? error.message : '消息发送失败');
    });
  };

  const handleSend = () => {
    const value = inputValue.trim();
    if (!value || sending || !user) return;
    setInputValue('');
    sendQuestion(value);
  };

  const clearConversation = () => {
    modal.confirm({
      title: '清空当前对话',
      content: '清空后当前会话与消息记录都会被删除，确定继续吗？',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          if (conversationId) {
            stopStreamSilently();
            await conversationApi.delete(conversationId);
          }
          newChat();
          await loadConversations();
          message.success('对话已清空');
        } catch (error) {
          message.error(error instanceof Error ? error.message : '清空失败');
        }
      },
    });
  };

  const copyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      message.success('复制成功');
    } catch {
      message.error('复制失败');
    }
  };

  const shareMessage = async (id: string) => {
    const link = `${window.location.origin}/aigc-app/chat?msg=${id}`;
    try {
      await navigator.clipboard.writeText(link);
      message.success('分享链接已复制');
    } catch {
      message.error('分享链接复制失败');
    }
  };

  const editMessage = (content: string) => {
    setInputValue(content);
    inputRef.current?.focus();
  };

  /** 重新生成：截断到该条消息之前，再生成一条新回复 */
  const redoMessage = (id: string) => {
    const index = messages.findIndex((item) => item.id === id);
    if (index < 0) return;
    const question = [...messages.slice(0, index)].reverse().find((item) => item.role === 'user');
    if (!question) return;
    stopStreamSilently();
    const context = messages.slice(0, index);
    setMessages(context);
    sendQuestion(question.content, context);
  };

  const toggleFeedback = (id: string, value: 'like' | 'dislike') => {
    setFeedback((prev) => {
      const next = { ...prev };
      if (next[id] === value) delete next[id];
      else next[id] = value;
      return next;
    });
  };

  return (
    <PageContainer
      className="flex flex-col h-full min-h-0"
      contentBordered={false}
      contentClassName="flex min-h-0 flex-1"
    >
      <div className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-row">
        {/* 历史会话 */}
        <Card
          className="flex max-h-[30vh] shrink-0 flex-col lg:max-h-none lg:w-260px"
          title="历史会话"
          extra={
            <Button type="text" size="small" icon={<PlusOutlined />} onClick={newChat}>
              新建
            </Button>
          }
          styles={{ body: { padding: 8, flex: 1, minHeight: 0, overflow: 'auto' } }}
        >
          <div className="flex flex-col gap-1">
            {conversations.length ? (
              conversations.map((item) => (
                <div
                  key={item.id}
                  className={`cursor-pointer rounded-8px p-2 transition-colors ${
                    item.id === conversationId
                      ? 'bg-[var(--ant-color-fill-secondary)]'
                      : 'hover:bg-[var(--ant-color-fill-tertiary)]'
                  }`}
                  onClick={() => void openConversation(item)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-13px">{item.title}</span>
                    <Tag className="m-0 shrink-0 text-11px">{item.messageCount ?? 0} 条</Tag>
                  </div>
                  <div className="mt-1 text-11px text-[var(--ant-color-text-tertiary)]">
                    {formatMoment(item.lastConversationTime)} · {item.tokenUsed ?? 0} tokens
                  </div>
                </div>
              ))
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无历史会话" />
            )}
          </div>
        </Card>

        {/* 对话区 */}
        <section className="flex min-w-0 flex-1 flex-col rounded-12px bg-[var(--ant-color-bg-container)] shadow-[0_1px_2px_0_rgba(0,0,0,0.03),0_1px_6px_-1px_rgba(0,0,0,0.02)]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-0 border-b border-solid border-[var(--ant-color-border-secondary)] p-3">
            <div className="flex items-center gap-2">
              <Select
                style={{ width: 220 }}
                value={modelId}
                placeholder="选择对话模型"
                onChange={(value) => setModelId(value)}
                options={models.map((item) => ({
                  value: item.id,
                  label: `${item.name}（${item.providerCode ?? '-'}）`,
                }))}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                icon={<ClearOutlined />}
                onClick={clearConversation}
                disabled={sending || messages.length === 0}
              >
                清空
              </Button>
              <Button icon={<PlusOutlined />} onClick={newChat}>
                新对话
              </Button>
            </div>
          </div>

          <div ref={listRef} className="min-h-0 flex-1 overflow-auto px-4 py-4">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <Empty description="输入问题开始对话，支持 Markdown 与代码高亮" />
              </div>
            ) : (
              messages.map((item) => (
                <MessageBubble
                  key={item.id}
                  messageItem={item}
                  containerWidth={contentWidth}
                  feedback={feedback[item.id]}
                  onCopy={copyMessage}
                  onShare={shareMessage}
                  onEdit={editMessage}
                  onRedo={redoMessage}
                  onFeedback={toggleFeedback}
                />
              ))
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-0 border-t border-solid border-[var(--ant-color-border-secondary)] p-3">
            <Input.TextArea
              ref={inputRef}
              autoSize={{ minRows: 2, maxRows: 6 }}
              maxLength={3000}
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  void handleSend();
                }
              }}
              placeholder="输入问题，Enter 发送，Shift + Enter 换行"
            />
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-12px text-[var(--ant-color-text-tertiary)]">
                <Button type="text" size="small" icon={<PaperClipOutlined />} />
                <span>
                  当前会话：{conversationId ?? '新对话'} · {messages.length} 条消息
                </span>
              </div>
              <div className="flex items-center gap-2">
                {sending ? (
                  <Button size="small" danger icon={<StopOutlined />} onClick={stop}>
                    停止
                  </Button>
                ) : null}
                <Button
                  type="primary"
                  size="small"
                  icon={<SendOutlined />}
                  loading={sending}
                  disabled={!inputValue.trim()}
                  onClick={() => void handleSend()}
                >
                  发送
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
