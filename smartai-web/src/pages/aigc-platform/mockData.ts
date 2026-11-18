import type {
  ChatModelItem,
  ConversationMessageItem,
  ConversationSessionItem,
  EmbeddingModelItem,
  ImageModelItem,
  KnowledgeBaseItem,
  KnowledgeDocumentItem,
  KnowledgeSliceItem,
  VectorDBItem,
} from './types';

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function formatTime(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export const mockChatModels: ChatModelItem[] = [
  {
    id: 'cm-1',
    supplier: 'OpenAI',
    version: 'gpt-4o',
    maxTokens: 4096,
    temperature: 0.7,
    topP: 1.0,
    baseUrl: 'https://api.openai.com/v1',
    alias: 'gpt-4o',
    apiKey: 'sk-openai-xxxxxxxxxxxxxxxx',
  },
  {
    id: 'cm-2',
    supplier: 'OpenAI',
    version: 'gpt-4o-mini',
    maxTokens: 4096,
    temperature: 0.7,
    topP: 1.0,
    baseUrl: 'https://api.openai.com/v1',
    alias: 'gpt-4o-mini',
    apiKey: 'sk-openai-xxxxxxxxxxxxxxxx',
  },
  {
    id: 'cm-3',
    supplier: 'OpenAI',
    version: 'gpt-3.5-turbo',
    maxTokens: 4096,
    temperature: 0.7,
    topP: 1.0,
    baseUrl: 'https://api.openai.com/v1',
    alias: 'gpt-3.5-turbo',
    apiKey: 'sk-openai-xxxxxxxxxxxxxxxx',
  },
  {
    id: 'cm-4',
    supplier: 'Azure OpenAI',
    version: 'gpt-4',
    maxTokens: 8192,
    temperature: 0.5,
    topP: 0.95,
    baseUrl: 'https://smartai.openai.azure.com',
    alias: 'azure-gpt-4',
    apiKey: 'sk-azure-xxxxxxxxxxxxxxxx',
  },
  {
    id: 'cm-5',
    supplier: 'Azure OpenAI',
    version: 'gpt-35-turbo',
    maxTokens: 4096,
    temperature: 0.7,
    topP: 1.0,
    baseUrl: 'https://smartai.openai.azure.com',
    alias: 'azure-gpt-35',
    apiKey: 'sk-azure-xxxxxxxxxxxxxxxx',
  },
  {
    id: 'cm-6',
    supplier: '通义千问',
    version: 'qwen-max',
    maxTokens: 8192,
    temperature: 0.85,
    topP: 0.8,
    baseUrl: 'https://dashscope.aliyuncs.com',
    alias: 'qwen-max',
    apiKey: 'sk-qwen-xxxxxxxxxxxxxxxx',
  },
  {
    id: 'cm-7',
    supplier: '通义千问',
    version: 'qwen-plus',
    maxTokens: 4096,
    temperature: 0.7,
    topP: 1.0,
    baseUrl: 'https://dashscope.aliyuncs.com',
    alias: 'qwen-plus',
    apiKey: 'sk-qwen-xxxxxxxxxxxxxxxx',
  },
  {
    id: 'cm-8',
    supplier: '文心一言',
    version: 'ERNIE-4.0',
    maxTokens: 8192,
    temperature: 0.8,
    topP: 1.0,
    baseUrl: 'https://aip.baidubce.com',
    alias: 'ernie-4.0',
    apiKey: 'sk-ernie-xxxxxxxxxxxxxxxx',
  },
];

export const mockEmbeddingModels: EmbeddingModelItem[] = [
  {
    id: 'em-1',
    name: 'OpenAI',
    alias: 'ada-002',
    version: 'text-embedding-ada-002',
    dimension: 1536,
    apiKey: 'sk-openai-xxxxxxxxxxxxxxxx',
    baseUrl: 'https://api.openai.com/v1',
  },
  {
    id: 'em-2',
    name: '通义千问',
    alias: 'v2',
    version: 'text-embedding-v2',
    dimension: 1024,
    apiKey: 'sk-qwen-xxxxxxxxxxxxxxxx',
    baseUrl: 'https://dashscope.aliyuncs.com',
  },
  {
    id: 'em-3',
    name: 'Cohere',
    alias: 'v3',
    version: 'embed-multilingual-v3',
    dimension: 1024,
    apiKey: 'sk-cohere-xxxxxxxxxxxxxxxx',
    baseUrl: 'https://api.cohere.ai/v1',
  },
];

export const mockImageModels: ImageModelItem[] = [
  {
    id: 'im-1',
    name: 'OpenAI DALL-E',
    alias: 'dall-e-3',
    version: 'dall-e-3',
    apiKey: 'sk-openai-xxxxxxxxxxxxxxxx',
    endpoint: 'https://api.openai.com',
    deploymentName: 'dall-e-3',
    imageSize: '1024*1024',
    imageQuality: 'standard',
    imageStyle: 'vivid',
  },
  {
    id: 'im-2',
    name: 'Azure DALL-E',
    alias: 'azure-dall-e-3',
    version: 'dall-e-3',
    apiKey: 'sk-azure-xxxxxxxxxxxxxxxx',
    endpoint: 'https://xxx.openai.azure.com',
    deploymentName: 'azure-dall-e-3',
    imageSize: '1024*1024',
    imageQuality: 'hd',
    imageStyle: 'natural',
  },
];

export const mockVectorDBs: VectorDBItem[] = [
  {
    id: 'vdb-1',
    alias: '知识库主库',
    vendor: 'PgVector',
    dimension: 1024,
    host: '192.168.1.100',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    dbName: 'smartai',
    tableName: 'kb_embeddings',
  },
  {
    id: 'vdb-2',
    alias: '缓存向量库',
    vendor: 'Redis',
    dimension: 1024,
    host: '192.168.1.101',
    port: 6379,
    redisIndex: 'vector_idx_0',
  },
  {
    id: 'vdb-3',
    alias: '大规模检索库',
    vendor: 'Milvus',
    dimension: 1536,
    host: '192.168.1.102',
    port: 19530,
    dbName: 'milvus_db',
    tableName: 'doc_vectors',
  },
];

const knowledgeBaseNames = [
  '产品帮助文档库',
  '技术文档知识库',
  '客服话术库',
  '法律法规知识库',
  '销售产品资料',
  '内部培训资料',
  '运维故障排查库',
  '市场营销素材库',
  '财务制度知识库',
  '财务制度知识库',
  '产品帮助文档库',
  '技术文档知识库',
  '客服话术库',
  '法律法规知识库',
  '销售产品资料',
  '内部培训资料',
  '运维故障排查库',
  '市场营销素材库',
  '财务制度知识库',
  '市场营销素材库',
  '财务制度知识库',
];

const knowledgeBaseCreators = ['张三', '李四', '王五', '赵六'];

const vectorDbAliases = mockVectorDBs.map((item) => item.alias);
const embeddingModelLabels = mockEmbeddingModels.map((item) => `${item.name} - ${item.alias}`);

export const mockKnowledgeBases: KnowledgeBaseItem[] = knowledgeBaseNames.map((name, index) => {
  const month = 6 + Math.floor(index / 10);
  const day = 15 + (index % 10);
  return {
    id: `kb${index + 1}`,
    name,
    description: `${name}用于沉淀业务文档，支持自动切片、向量化与语义检索。`,
    vectorDb: vectorDbAliases[index % vectorDbAliases.length],
    embeddingModel: embeddingModelLabels[index % embeddingModelLabels.length],
    docCount: 6 + ((index * 7) % 30),
    totalSize: (3 + ((index * 5) % 68)) * 1024 * 1024,
    createdAt: `2025-${pad(month)}-${pad(day)} 10:30`,
    createdBy: knowledgeBaseCreators[index % knowledgeBaseCreators.length],
  };
});

export const mockKnowledgeDocuments: KnowledgeDocumentItem[] = [
  {
    id: 'doc1',
    name: '产品使用指南.pdf',
    url: 'https://docs.smartai.com/knowledge/product-guide.pdf',
    source: '上传',
    sliceCount: 42,
    sliceStatus: '已训练',
    fileSize: 2359296,
  },
  {
    id: 'doc2',
    name: '常见问题解答.md',
    url: 'https://docs.smartai.com/knowledge/faq.md',
    source: '上传',
    sliceCount: 18,
    sliceStatus: '已训练',
    fileSize: 65536,
  },
  {
    id: 'doc3',
    name: 'API接口文档.txt',
    url: 'https://docs.smartai.com/knowledge/api.txt',
    source: '录入',
    sliceCount: 26,
    sliceStatus: '已训练',
    fileSize: 122880,
  },
  {
    id: 'doc4',
    name: '故障排除手册.docx',
    url: 'https://docs.smartai.com/knowledge/troubleshooting.docx',
    source: '上传',
    sliceCount: 31,
    sliceStatus: '未训练',
    fileSize: 1048576,
  },
  {
    id: 'doc5',
    name: '版本更新日志.md',
    url: 'https://docs.smartai.com/knowledge/changelog.md',
    source: '录入',
    sliceCount: 12,
    sliceStatus: '已训练',
    fileSize: 32768,
  },
  {
    id: 'doc6',
    name: '部署说明书.pdf',
    url: 'https://docs.smartai.com/knowledge/deploy.pdf',
    source: '上传',
    sliceCount: 24,
    sliceStatus: '未训练',
    fileSize: 3145728,
  },
];

export const mockKnowledgeSlices: KnowledgeSliceItem[] = [
  {
    id: 's1',
    docName: '产品使用指南.pdf',
    charCount: 320,
    content:
      '首次登录平台后，请先在「系统管理 / 系统配置」中完成基础参数设置，包括平台名称、默认语言与模型供应商信息。配置保存后即可在 AIGC 应用中使用对应的模型能力。',
    status: '已训练',
    createdAt: '2025-07-01 09:20',
  },
  {
    id: 's2',
    docName: '产品使用指南.pdf',
    charCount: 468,
    content:
      '知识库支持上传 txt、md、docx、pdf 等格式文档。上传完成后系统会自动完成文档解析与切片，切片结果可在「切片管理」中查看，对于命中率较低的内容可以重新向量化。',
    status: '已训练',
    createdAt: '2025-07-01 09:25',
  },
  {
    id: 's3',
    docName: '常见问题解答.md',
    charCount: 290,
    content:
      'Q：为什么知识库检索结果不准确？A：请确认向量化模型与向量库的维度参数一致，并检查切片长度是否过大。建议将切片控制在 300 到 800 个字符之间。',
    status: '已训练',
    createdAt: '2025-07-03 14:12',
  },
  {
    id: 's4',
    docName: 'API接口文档.txt',
    charCount: 615,
    content:
      '创建会话接口：POST /api/aigc/conversation，请求体包含 appId、userId 与 title 字段。响应返回会话 ID 与创建时间。发送消息接口：POST /api/aigc/message，需要携带 conversationId 与 content。',
    status: '已训练',
    createdAt: '2025-07-05 11:40',
  },
  {
    id: 's5',
    docName: 'API接口文档.txt',
    charCount: 540,
    content:
      '流式响应采用 Server-Sent Events 协议，每个数据块以 data: 开头，最后以 data: [DONE] 结束。客户端需要按行解析并拼接增量内容，异常情况下可以重试请求。',
    status: '已训练',
    createdAt: '2025-07-05 11:42',
  },
  {
    id: 's6',
    docName: '故障排除手册.docx',
    charCount: 750,
    content:
      '当向量库连接超时时，请依次检查：1. 向量库地址与端口是否可达；2. 用户名密码是否过期；3. 向量维度是否与模型匹配；4. 数据库连接池是否已耗尽。若仍无法恢复，请重启向量库服务并重新训练文档。',
    status: '未训练',
    createdAt: '2025-07-08 16:05',
  },
  {
    id: 's7',
    docName: '版本更新日志.md',
    charCount: 356,
    content:
      'v1.4.0 新增多页签导航与布局设置面板，支持左侧菜单、顶部菜单和混合菜单三种模式，同时提供主题色与深色模式切换。',
    status: '已训练',
    createdAt: '2025-07-10 10:18',
  },
  {
    id: 's8',
    docName: '部署说明书.pdf',
    charCount: 682,
    content:
      '前端部署使用 pnpm build 产出静态资源，将 dist 目录托管到任意静态服务器即可。后端服务默认监听 8080 端口，需要在反向代理中把 /api 前缀转发到后端服务。',
    status: '未训练',
    createdAt: '2025-07-12 15:32',
  },
];

const modelCycle = ['gpt-4o', 'gpt-4o-mini', 'qwen-max', 'ERNIE-4.0'];

const conversationTopics = [
  '数据看板配置',
  '向量库选型',
  '知识库检索',
  '模型接入',
  '账单统计口径',
  '角色权限规划',
  '对话效果调试',
  '应用发布流程',
  '接口报错排查',
  '令牌有效期',
];

const userContents = [
  '帮我把最近 7 天的调用量和失败率整理成一段结论，顺便说明异常集中在哪些时段。',
  '知识库上传 PDF 之后检索不到内容，是不是需要重新向量化？请给出排查步骤。',
  '这个应用的默认系统提示词应该怎么写，才能稳定输出结构化的 JSON？',
  '账单里 Token 消耗和调用次数对不上，可能是哪里的统计口径不一致？',
  '请对比一下 gpt-4o 与 qwen-max 在长文本摘要场景下的成本和效果差异。',
];

const assistantContents = [
  [
    '**结论：整体可用，失败集中在两个高峰时段。**',
    '',
    '近 7 天共调用 `8,642` 次，失败率 **0.86%**，异常分布如下：',
    '',
    '- 09:00-10:00：失败 42 次，以 429 限流为主',
    '- 20:00-21:00：失败 31 次，多为上游超时',
    '- 其余时段：失败率低于 0.2%',
    '',
    '建议为该模型提高并发额度，并对 429 增加指数退避重试。',
  ].join('\n'),
  [
    '按以下顺序排查即可定位：',
    '',
    '1. 确认文档状态是否为「已训练」',
    '2. 检查知识库绑定的向量库是否与切片模型一致',
    '3. 观察切片长度，超过 1000 字建议重新切分',
    '',
    '三步都正常后仍检索不到，可重新上传并触发一次向量化。',
  ].join('\n'),
  [
    '推荐用「角色 + 约束 + 示例」的结构，例如：',
    '',
    '```json',
    '{',
    '  "summary": "一句话结论",',
    '  "risk": "风险点",',
    '  "suggestion": "下一步建议"',
    '}',
    '```',
    '',
    '提示词里明确 **仅输出 JSON**，并附一个完整示例，模型就很少输出解释性文字。',
  ].join('\n'),
  [
    '两者的统计口径不同，对照如下：',
    '',
    '| 指标 | 统计方式 |',
    '| --- | --- |',
    '| 调用次数 | 按请求计 |',
    '| Token 消耗 | 提示词与补全分别累计 |',
    '| 流式中断 | 只统计已产生的 Token |',
    '',
    '对账时建议统一以账单明细为准。',
  ].join('\n'),
  '在长文本摘要场景下，qwen-max 的单次成本约为 gpt-4o 的 60%，但摘要稳定性略低。若对成本敏感可先用 qwen-max，关键报告再切换 gpt-4o 复核。',
];

const systemContents = [
  '你是一个面向企业的 AI 助手，回答需要结构清晰、结论先行，涉及数据时给出统计口径。',
  '当前会话已加载《产品手册 v2.3》，回答时优先引用手册内容并标注章节。',
];

const CONVERSATION_SESSION_COUNT = 25;
const MESSAGE_PER_SESSION = 5;

export const mockConversationMessages: ConversationMessageItem[] = Array.from(
  { length: CONVERSATION_SESSION_COUNT * MESSAGE_PER_SESSION },
  (_, index) => {
    const sessionIndex = index % CONVERSATION_SESSION_COUNT;
    // 会话内按顺序提问 / 回答交替，末条为系统提示，时间逐条递进
    const orderInSession = Math.floor(index / CONVERSATION_SESSION_COUNT);
    const role: ConversationMessageItem['role'] =
      orderInSession === MESSAGE_PER_SESSION - 1
        ? 'system'
        : orderInSession % 2 === 0
          ? 'user'
          : 'assistant';
    const time = new Date(
      Date.now() -
        (MESSAGE_PER_SESSION - orderInSession) * 3600000 -
        (CONVERSATION_SESSION_COUNT - sessionIndex) * 600000,
    );
    const tokenUsed = 320 + ((index * 47) % 1600);
    const contents =
      role === 'user' ? userContents : role === 'assistant' ? assistantContents : systemContents;
    return {
      id: `msg-${index + 1}`,
      sessionId: `session-${sessionIndex + 1}`,
      username: `user${(sessionIndex % 8) + 1}`,
      ip: `192.168.1.${20 + (index % 60)}`,
      role,
      modelName: modelCycle[index % modelCycle.length],
      tokenUsed,
      promptTokenUsed: Math.floor(tokenUsed * 0.4),
      conversationTime: formatTime(time),
      content: contents[index % contents.length],
    };
  },
);

/** 会话窗口的统计值由消息明细推导，保证列表与详情一致 */
export const mockConversationSessions: ConversationSessionItem[] = Array.from(
  { length: CONVERSATION_SESSION_COUNT },
  (_, index) => {
    const id = `session-${index + 1}`;
    const list = mockConversationMessages.filter((item) => item.sessionId === id);
    const first = list[0];
    const last = list[list.length - 1];
    return {
      id,
      title: `${conversationTopics[index % conversationTopics.length]} #${index + 1}`,
      username: `user${(index % 8) + 1}`,
      messageCount: list.length,
      tokenUsed: list.reduce((sum, item) => sum + item.tokenUsed, 0),
      lastConversationTime: last?.conversationTime ?? '-',
      createTime: first?.conversationTime ?? '-',
    };
  },
);
