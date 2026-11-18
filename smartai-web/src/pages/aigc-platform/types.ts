export interface ChatModelItem {
  id: string;
  supplier: string;
  version: string;
  maxTokens: number;
  temperature: number;
  topP: number;
  baseUrl: string;
  alias: string;
  apiKey: string;
}

export interface EmbeddingModelItem {
  id: string;
  name: string;
  alias: string;
  version: string;
  dimension: number;
  apiKey: string;
  baseUrl: string;
}

export interface ImageModelItem {
  id: string;
  name: string;
  alias: string;
  version: string;
  apiKey: string;
  endpoint: string;
  deploymentName: string;
  imageSize?: string;
  imageQuality?: string;
  imageStyle?: string;
}

export type VectorVendor = 'Redis' | 'PgVector' | 'Milvus';

export interface VectorDBItem {
  id: string;
  alias: string;
  vendor: VectorVendor;
  dimension: number;
  host: string;
  port: number;
  username?: string;
  password?: string;
  dbName?: string;
  tableName?: string;
  redisIndex?: string;
}

export interface KnowledgeBaseItem {
  id: string;
  name: string;
  description: string;
  vectorDb: string;
  embeddingModel: string;
  docCount: number;
  totalSize: number;
  createdAt: string;
  createdBy: string;
}

export interface KnowledgeDocumentItem {
  id: string;
  name: string;
  url: string;
  source: '上传' | '录入';
  sliceCount: number;
  sliceStatus: '已训练' | '未训练';
  fileSize: number;
}

export interface KnowledgeSliceItem {
  id: string;
  docName: string;
  charCount: number;
  content: string;
  status: '已训练' | '未训练';
  createdAt: string;
}

export type ConversationRole = 'user' | 'assistant' | 'system';

export interface ConversationMessageItem {
  id: string;
  /** 所属会话窗口 */
  sessionId: string;
  username: string;
  ip: string;
  role: ConversationRole;
  modelName: string;
  tokenUsed: number;
  promptTokenUsed: number;
  conversationTime: string;
  /** 消息正文 */
  content: string;
}

export interface ConversationSessionItem {
  id: string;
  /** 会话标题 */
  title: string;
  username: string;
  messageCount: number;
  tokenUsed: number;
  lastConversationTime: string;
  createTime: string;
}
