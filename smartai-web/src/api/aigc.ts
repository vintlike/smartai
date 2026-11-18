import { request } from './http';
import type { PageQuery, PageResult } from './types';

export interface ModelProviderRecord {
  id: number | string;
  name: string;
  code: string;
  remark?: string;
  createTime?: string;
}

export interface AigcRecord {
  id: number | string;
  [key: string]: unknown;
}

/** 模型记录：chat / embedding / image 共用 */
export interface ModelRecord {
  id: number | string;
  name: string;
  modelName: string;
  type?: string;
  providerCode?: string;
}

function createCrudApi<T extends { id: number | string }>(base: string) {
  return {
    list: (params?: PageQuery) => request<PageResult<T>>(base, { params }),
    getById: (id: number | string) => request<T>(`${base}/${id}`),
    create: (data: Partial<T>) => request<T>(base, { method: 'POST', body: data }),
    update: (id: number | string, data: Partial<T>) =>
      request<T>(`${base}/${id}`, { method: 'PUT', body: data }),
    delete: (id: number | string) => request<unknown>(`${base}/${id}`, { method: 'DELETE' }),
  };
}

export const modelProviderApi = createCrudApi<ModelProviderRecord>('/api/aigc/model-provider');

export const modelApi = createCrudApi<AigcRecord>('/api/aigc/model');

export const embedStoreApi = createCrudApi<AigcRecord>('/api/aigc/embed-store');

export const knowledgeApi = createCrudApi<AigcRecord>('/api/aigc/knowledge');

export const docsApi = createCrudApi<AigcRecord>('/api/aigc/docs');

export const appApi = createCrudApi<AigcRecord>('/api/aigc/app');

export const conversationApi = {
  ...createCrudApi<AigcRecord>('/api/aigc/conversation'),
  listByUserId: (userId: number | string) =>
    request<PageResult<AigcRecord>>(`/api/aigc/conversation/user/${userId}`),
};

export const messageApi = {
  ...createCrudApi<AigcRecord>('/api/aigc/message'),
  listByConversationId: (conversationId: number | string) =>
    request<PageResult<AigcRecord>>(`/api/aigc/message/conversation/${conversationId}`),
};

export interface GenerateImagePayload {
  message: string;
  modelId: number | string;
  modelName?: string;
  modelProvider?: string;
  size: string;
  quality: string;
  style: string;
}

export interface GenerateMindmapPayload {
  message: string;
  modelId: number | string;
  modelName?: string;
  modelProvider?: string;
}

/** 文生图：模型列表按 type=image 过滤 */
export const imageApi = {
  listModels: () =>
    request<PageResult<ModelRecord>>('/api/aigc/model', {
      params: { type: 'image', pageSize: 100 },
    }),
  generate: (data: GenerateImagePayload) =>
    request<{ url: string }>('/api/aigc/image/generate', { method: 'POST', body: data }),
};

export const mindmapApi = {
  listModels: () =>
    request<PageResult<ModelRecord>>('/api/aigc/model', {
      params: { type: 'chat', pageSize: 100 },
    }),
  generate: (data: GenerateMindmapPayload) =>
    request<{ message: string }>('/api/aigc/mindmap/generate', { method: 'POST', body: data }),
};
