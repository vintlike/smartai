export interface ModelOption {
  value: string;
  label: string;
}

/** 应用视图模型：由后端 AigcApp 记录映射而来，logo 为前端展示用图标 */
export interface AIApp {
  id: string;
  name: string;
  logo: string;
  /** 模型 ID（存库字段 modelId） */
  model: string;
  /** 模型展示名（由模型列表解析） */
  modelName?: string;
  description: string;
  prompt: string;
  knowledgeBaseIds: string[];
  createdAt: string;
  createdBy: string;
  cover?: string;
}

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: number;
}
