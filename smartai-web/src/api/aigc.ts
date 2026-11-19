import { getToken, request, resolveUrl } from './http';
import type { PageQuery, PageResult, QueryParams } from './types';

/**
 * AIGC 业务 API，对应 smartai-server 的 Aigc*Controller。
 * 契约：更新为 PUT 资源根路径且 body 携带 id；删除为 DELETE /{id}；
 * 列表返回 { list, total }（部分接口直接返回数组，这里统一成 PageResult）。
 */

type ListResponse<T> = { list?: T[]; total?: number };
type RawList<T> = T[] | ListResponse<T>;

export function toPageResult<T>(data: RawList<T>): PageResult<T> {
  if (Array.isArray(data)) return { list: data, total: data.length };
  const list = data.list ?? [];
  return { list, total: data.total ?? list.length };
}

export interface ModelRecord {
  id: string;
  type?: string;
  /** 调用网关时使用的模型标识 */
  model: string;
  /** 供应商编码 */
  provider?: string;
  name: string;
  maxOutputTokens?: number;
  temperature?: number;
  topP?: number;
  apiKey?: string;
  baseUrl?: string;
  secretKey?: string;
  endpoint?: string;
  azureDeploymentName?: string;
  imageSize?: string;
  imageQuality?: string;
  imageStyle?: string;
  dimension?: number;
  status?: number;
  showStatus?: number;
  createTime?: string;
  /** 兼容旧页面字段 */
  modelName?: string;
  providerCode?: string;
  [key: string]: unknown;
}

function normalizeModel(record: ModelRecord): ModelRecord {
  return {
    ...record,
    modelName: record.modelName ?? record.model,
    providerCode: record.providerCode ?? record.provider,
  };
}

export interface ModelProviderRecord {
  id: string;
  name: string;
  code: string;
  remark?: string;
  createTime?: string;
  [key: string]: unknown;
}

export interface AppRecord {
  id: string;
  userId?: string;
  username?: string;
  modelId?: string;
  knowledgeIds?: string;
  cover?: string;
  name: string;
  prompt?: string;
  description?: string;
  updateTime?: string;
  createTime?: string;
  [key: string]: unknown;
}

export interface AppApiRecord {
  id: string;
  appId: string;
  channel?: string;
  apiKey?: string;
  createTime?: string;
  [key: string]: unknown;
}

export interface ConversationRecord {
  id: string;
  userId?: string;
  username?: string;
  title: string;
  messageCount?: number;
  tokenUsed?: number;
  lastConversationTime?: string;
  createTime?: string;
  [key: string]: unknown;
}

export interface MessageRecord {
  id: string;
  userId?: string;
  conversationId: string;
  username?: string;
  ip?: string;
  role: string;
  model?: string;
  content: string;
  totalTokens?: number;
  promptTokens?: number;
  createTime?: string;
  [key: string]: unknown;
}

export interface KnowledgeRecord {
  id: string;
  userId?: string;
  username?: string;
  name: string;
  description?: string;
  cover?: string;
  embedStoreId?: string;
  embedStoreName?: string;
  embedModelId?: string;
  embedModelName?: string;
  docCount?: number;
  totalSize?: number;
  createTime?: string;
  [key: string]: unknown;
}

export interface DocsRecord {
  id: string;
  knowledgeId: string;
  name: string;
  sourceType?: string;
  url?: string;
  fileExt?: string;
  content?: string;
  fileSize?: number;
  sliceCount?: number;
  sliceStatus?: number;
  createTime?: string;
  [key: string]: unknown;
}

export interface DocsSliceRecord {
  id: string;
  vectorId?: string;
  docId: string;
  knowledgeId: string;
  name?: string;
  content: string;
  charCount?: number;
  trainStatus?: number;
  createTime?: string;
  [key: string]: unknown;
}

export interface EmbedStoreRecord {
  id: string;
  name: string;
  provider?: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  databaseName?: string;
  tableName?: string;
  dimension?: number;
  [key: string]: unknown;
}

export interface DocsTrainSummary {
  total: number;
  success: number;
  skipped: number;
  failed: number;
  vectorCount: number;
  errors: string[];
}

/** 标准 CRUD：新增 POST 根路径，更新 PUT 根路径（body 带 id），删除 DELETE /{id} */
function createCrudApi<T extends { id: string }>(base: string) {
  return {
    list: async (params?: PageQuery) => toPageResult(await request<RawList<T>>(base, { params })),
    getById: (id: string) => request<T>(`${base}/${id}`),
    create: (data: object) => request<T>(base, { method: 'POST', body: data }),
    /** 支持 update(data)、update(id, data) 两种写法 */
    update: (idOrData: string | number | object, data?: object) => {
      const body =
        typeof idOrData === 'string' || typeof idOrData === 'number'
          ? { ...data, id: idOrData }
          : idOrData;
      return request<T>(base, { method: 'PUT', body });
    },
    delete: (id: string) => request<unknown>(`${base}/${id}`, { method: 'DELETE' }),
  };
}

/** 供应商维护在后端 SysProviderController */
export const modelProviderApi = createCrudApi<ModelProviderRecord>('/api/sys/provider');

export const modelApi = {
  ...createCrudApi<ModelRecord>('/api/aigc/model'),
  list: async (params?: PageQuery) => {
    const result = toPageResult(await request<RawList<ModelRecord>>('/api/aigc/model', { params }));
    return { ...result, list: result.list.map(normalizeModel) };
  },
};

export const embedStoreApi = createCrudApi<EmbedStoreRecord>('/api/aigc/embed-store');

export const knowledgeApi = createCrudApi<KnowledgeRecord>('/api/aigc/knowledge');

export const appApi = createCrudApi<AppRecord>('/api/aigc/app');

export const appApiCredentialApi = {
  listByAppId: (appId: string) => request<AppApiRecord[]>(`/api/aigc/app-api/app/${appId}`),
  create: (data: Partial<AppApiRecord>) =>
    request<AppApiRecord>('/api/aigc/app-api', { method: 'POST', body: data }),
  delete: (id: string) => request<unknown>(`/api/aigc/app-api/${id}`, { method: 'DELETE' }),
};

export const docsApi = {
  ...createCrudApi<DocsRecord>('/api/aigc/docs'),
  /** 训练单个文档 */
  train: (id: string) => request<unknown>(`/api/aigc/docs/${id}/train`, { method: 'POST' }),
  /** 训练知识库下全部文档 */
  trainByKnowledge: (knowledgeId: string) =>
    request<DocsTrainSummary>('/api/aigc/docs/train', { method: 'POST', params: { knowledgeId } }),
  /** 文档切片 */
  listSlices: (params: { docId?: string; knowledgeId?: string }) =>
    request<RawList<DocsSliceRecord>>('/api/aigc/docs/slice', { params }).then(toPageResult),
  /** 向量检索 */
  searchSlices: (params: { knowledgeId: string; keyword?: string }) =>
    request<DocsSliceRecord[]>('/api/aigc/docs/slice/search', { params }),
};

export const conversationApi = {
  ...createCrudApi<ConversationRecord>('/api/aigc/conversation'),
  /** 按用户查会话（数组） */
  listByUserId: (userId: string) =>
    request<ConversationRecord[]>(`/api/aigc/conversation/user/${userId}`),
};

export const messageApi = {
  ...createCrudApi<MessageRecord>('/api/aigc/message'),
  /** 按会话查消息（数组） */
  listByConversationId: (conversationId: string) =>
    request<MessageRecord[]>(`/api/aigc/message/conversation/${conversationId}`),
};

export interface BillingQuery extends QueryParams {
  username?: string;
  model?: string;
  startDate?: string;
  endDate?: string;
}

export interface BillingStatRecord {
  userId?: string;
  username?: string;
  model?: string;
  ip?: string;
  callCount?: number;
  totalTokens?: number;
  promptTokens?: number;
  completionTokens?: number;
  lastCallTime?: string;
}

export interface BillingSummaryRecord {
  callCount?: number;
  totalTokens?: number;
  promptTokens?: number;
  completionTokens?: number;
  userCount?: number;
  modelCount?: number;
}

export interface BillingTrendRecord {
  statDate?: string;
  callCount?: number;
  totalTokens?: number;
  promptTokens?: number;
  completionTokens?: number;
}

export const billingApi = {
  list: (params?: BillingQuery & PageQuery) =>
    request<RawList<BillingStatRecord>>('/api/aigc/billing', { params }).then(toPageResult),
  summary: (params?: BillingQuery) =>
    request<BillingSummaryRecord>('/api/aigc/billing/summary', { params }),
  trend: (params?: BillingQuery) =>
    request<BillingTrendRecord[]>('/api/aigc/billing/trend', { params }),
};

export interface DashboardOverviewRecord {
  days?: number;
  current?: {
    callCount?: number;
    totalTokens?: number;
    promptTokens?: number;
    completionTokens?: number;
    activeUserCount?: number;
  };
  previous?: {
    callCount?: number;
    totalTokens?: number;
    promptTokens?: number;
    completionTokens?: number;
    activeUserCount?: number;
  };
  newUserCount?: number;
  newUserCountPrev?: number;
  knowledgeCount?: number;
  knowledgeCountPrev?: number;
  assets?: {
    userCount?: number;
    modelCount?: number;
    appCount?: number;
    knowledgeCount?: number;
    docCount?: number;
    conversationCount?: number;
  };
}

export interface DashboardTrendRecord {
  statDate?: string;
  callCount?: number;
  totalTokens?: number;
  promptTokens?: number;
  completionTokens?: number;
  newUserCount?: number;
}

export interface DashboardRankRecord {
  name?: string;
  callCount?: number;
  totalTokens?: number;
}

export const dashboardApi = {
  overview: (days = 7) =>
    request<DashboardOverviewRecord>('/api/aigc/dashboard/overview', { params: { days } }),
  trend: (days = 7) =>
    request<DashboardTrendRecord[]>('/api/aigc/dashboard/trend', { params: { days } }),
  rank: (days = 7, limit = 8) =>
    request<Record<string, DashboardRankRecord[]>>('/api/aigc/dashboard/rank', {
      params: { days, limit },
    }),
};

export interface ChatStreamPayload {
  model?: string;
  systemPrompt?: string;
  conversationId?: string;
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
}

export interface ChatStreamHandlers {
  onMeta?: (meta: { conversationId: string; title?: string }) => void;
  onDelta?: (content: string) => void;
  onDone?: (result: { content: string; model?: string }) => void;
  onError?: (message: string) => void;
}

export interface ChatStreamTask {
  abort: () => void;
  done: Promise<string>;
}

/**
 * SSE 流式对话：后端在流中自动落库会话与消息，
 * 前端只需按 meta / delta / done / error 事件更新界面。
 */
export function streamChat(
  payload: ChatStreamPayload,
  handlers: ChatStreamHandlers = {},
): ChatStreamTask {
  const controller = new AbortController();
  let fullContent = '';

  const done = (async () => {
    const token = getToken();
    const response = await fetch(resolveUrl('/api/aigc/chat/stream'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        Accept: 'text/event-stream',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (response.status === 401) {
      window.dispatchEvent(new Event('smartai:unauthorized'));
      throw new Error('登录状态已失效，请重新登录');
    }
    if (!response.ok || !response.body) {
      throw new Error(`对话请求失败：${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    const dispatch = (block: string) => {
      let event = 'message';
      const dataLines: string[] = [];
      for (const line of block.split('\n')) {
        if (line.startsWith('event:')) event = line.slice(6).trim();
        else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim());
      }
      if (!dataLines.length) return;
      const raw = dataLines.join('\n');
      let data: Record<string, unknown> = {};
      try {
        data = JSON.parse(raw) as Record<string, unknown>;
      } catch {
        data = { content: raw };
      }
      switch (event) {
        case 'meta':
          handlers.onMeta?.({
            conversationId: String(data.conversationId ?? ''),
            title: data.title as string | undefined,
          });
          break;
        case 'delta': {
          const delta = String(data.content ?? '');
          fullContent += delta;
          handlers.onDelta?.(delta);
          break;
        }
        case 'done': {
          const content = String(data.content ?? fullContent);
          handlers.onDone?.({ content, model: data.model as string | undefined });
          break;
        }
        case 'error':
          handlers.onError?.(String(data.message ?? '模型调用失败'));
          break;
        default:
          break;
      }
    };

    for (;;) {
      const { value, done: finished } = await reader.read();
      if (finished) break;
      buffer += decoder.decode(value, { stream: true });
      let index = buffer.indexOf('\n\n');
      while (index >= 0) {
        const block = buffer.slice(0, index);
        buffer = buffer.slice(index + 2);
        if (block.trim()) dispatch(block);
        index = buffer.indexOf('\n\n');
      }
    }
    if (buffer.trim()) dispatch(buffer);
    return fullContent;
  })();

  return { abort: () => controller.abort(), done };
}

/** 收集完整回复（用于绘图/导图等一次性结果场景） */
async function chatOnce(payload: ChatStreamPayload): Promise<string> {
  let content = '';
  const task = streamChat(payload, {
    onDelta: (delta) => {
      content += delta;
    },
    onDone: (result) => {
      content = result.content || content;
    },
  });
  await task.done;
  return content;
}

export interface GenerateImagePayload {
  message: string;
  modelId: string;
  modelName?: string;
  modelProvider?: string;
  size: string;
  quality: string;
  style: string;
}

export interface GenerateMindmapPayload {
  message: string;
  modelId: string;
  modelName?: string;
  modelProvider?: string;
}

const IMAGE_SYSTEM_PROMPT =
  '你是文生图助手。根据用户描述生成图片，只输出一个可直接访问的图片 URL，不要输出其他内容。';

const MINDMAP_SYSTEM_PROMPT =
  '你是思维导图助手。请把用户输入整理为层级清晰的 Markdown 大纲，只输出 Markdown 列表，用于 markmap 渲染。';

export const imageApi = {
  listModels: () => modelApi.list({ type: 'image', pageSize: 100 }),
  generate: async (data: GenerateImagePayload) => {
    const content = await chatOnce({
      model: data.modelName,
      systemPrompt: `${IMAGE_SYSTEM_PROMPT}画幅比例参考 ${data.size}，质量 ${data.quality}，风格 ${data.style}。`,
      messages: [{ role: 'user', content: data.message }],
    });
    const match = content.match(/https?:\/\/[^\s)"'<>]+/);
    if (!match) {
      throw new Error('当前模型未返回图片地址，请检查模型配置');
    }
    return { url: match[0] };
  },
};

export const mindmapApi = {
  listModels: () => modelApi.list({ type: 'chat', pageSize: 100 }),
  generate: async (data: GenerateMindmapPayload) => ({
    message: await chatOnce({
      model: data.modelName,
      systemPrompt: MINDMAP_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: data.message }],
    }),
  }),
};
