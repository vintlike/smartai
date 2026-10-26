/**
 * 业务演示数据。
 * 当前阶段只做前端 UI，所有页面数据均来自此文件，接入真实接口时替换为 service 调用即可。
 */

/* ---------- 通用下拉选项 ---------- */

export const modelOptions = [
  { label: 'gpt-4o', value: 'gpt-4o' },
  { label: 'gpt-4o-mini', value: 'gpt-4o-mini' },
  { label: 'deepseek-chat', value: 'deepseek-chat' },
  { label: 'qwen-max', value: 'qwen-max' },
  { label: 'glm-4', value: 'glm-4' },
  { label: 'moonshot-v1-8k', value: 'moonshot-v1-8k' },
];

/* ---------- 主控台 ---------- */

/** 生成最近 30 天的日期标签，从旧到新 */
export const trendLabels = Array.from({ length: 30 }, (_, index) => {
  const date = new Date(2026, 9, 26);
  date.setDate(date.getDate() - (29 - index));
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
});

/** Token 消耗量趋势（单位：千 token） */
export const tokenTrend = [
  1.28, 1.16, 1.42, 1.35, 1.58, 1.44, 1.62, 1.75, 1.68, 1.86, 1.72, 1.94, 1.88, 2.05, 1.96, 2.18,
  2.12, 2.34, 2.26, 2.48, 2.4, 2.62, 2.55, 2.78, 2.7, 2.86, 2.74, 2.92, 2.84, 3.06,
];

/** AI 请求量趋势（单位：次） */
export const requestTrend = [
  126, 118, 142, 135, 158, 147, 166, 172, 165, 184, 176, 192, 188, 205, 198, 214, 208, 226, 218,
  238, 231, 248, 242, 258, 250, 264, 256, 272, 265, 286,
];

/** 最近 30 天请求汇总（账单统计页复用） */
export const orderTrend = requestTrend.map((value, index) => value + 12 + (index % 5) * 3);

/* ---------- AI 应用 ---------- */

export interface AppItem {
  id: string;
  name: string;
  description: string;
  model: string;
  prompt: string;
  createdAt: string;
}

export const mockApps: AppItem[] = [
  {
    id: 'app-official',
    name: 'SmartAI 官方应用',
    description: '快速解答 SmartAI 项目相关的内容，SmartAI 官方助手',
    model: 'gpt-4o',
    prompt:
      '你是一个专业的文档分析师，你擅长从文档中提取关键内容并总结分析含义，下面你需要根据用户的问题做出解答。\n\n## 限制\n不要回答和文档无关的内容',
    createdAt: '2024-08-04 17:49:24',
  },
];

/* ---------- 模型管理 ---------- */

export interface ProviderItem {
  key: string;
  name: string;
}

export const chatProviders: ProviderItem[] = [
  { key: 'openai', name: 'OpenAI' },
  { key: 'qianfan', name: '百度千帆' },
  { key: 'bailian', name: '阿里百炼' },
  { key: 'zhipu', name: '智谱清言' },
  { key: 'gitee', name: 'Gitee AI' },
  { key: 'deepseek', name: 'DeepSeek' },
  { key: 'doubao', name: '抖音豆包' },
  { key: 'siliconflow', name: '硅基流动' },
  { key: 'lingyi', name: '零一万物' },
  { key: 'spark', name: '讯飞星火' },
  { key: 'ollama', name: 'Ollama' },
  { key: 'azure', name: 'Azure OpenAI' },
  { key: 'gemini', name: 'Gemini' },
  { key: 'claude', name: 'Claude' },
];

export const embeddingProviders: ProviderItem[] = [
  { key: 'openai', name: 'OpenAI' },
  { key: 'qianfan', name: '百度千帆' },
  { key: 'bailian', name: '阿里百炼' },
  { key: 'zhipu', name: '智谱清言' },
  { key: 'doubao', name: '抖音豆包' },
  { key: 'ollama', name: 'Ollama' },
];

export const imageProviders: ProviderItem[] = [
  { key: 'openai', name: 'OpenAI' },
  { key: 'azure', name: 'Azure OpenAI' },
  { key: 'zhipu', name: '智谱清言' },
];

/** 各供应商下已配置的模型（演示为空表，新增后写入本地状态） */
export const mockModelTotal = 0;

/* ---------- 向量库管理 ---------- */

export interface EmbedStoreItem {
  id: string;
  alias: string;
  provider: string;
  dimension: number;
  host: string;
  port: string;
  username?: string;
  password?: string;
  database?: string;
  table?: string;
}

/** 空表，配合「新增向量数据库」演示完整交互 */
export const mockEmbedStores: EmbedStoreItem[] = [];

/* ---------- 知识库 ---------- */

export interface KnowledgeItem {
  id: string;
  name: string;
  description: string;
  docCount: number;
  size: string;
  embedStore?: string;
  embedModel?: string;
}

export const mockKnowledge: KnowledgeItem[] = [
  {
    id: 'kb-smartai',
    name: 'SmartAI文档',
    description: 'SmartAI 官方文档',
    docCount: 4,
    size: '0.11 MB',
  },
];

export interface DocumentItem {
  id: string;
  name: string;
  url: string;
  source: '上传' | '录入';
  chunks: number;
  status: '已训练' | '未训练';
  size: string;
  createdAt: string;
}

export const mockDocuments: DocumentItem[] = [
  {
    id: 'doc-1',
    name: 'smartai-product-guide.pdf',
    url: 'http://127.0.0.1/files/smartai-product-guide.pdf',
    source: '上传',
    chunks: 37,
    status: '已训练',
    size: '0.04 MB',
    createdAt: '2026-10-12 10:24:11',
  },
  {
    id: 'doc-2',
    name: 'guide1',
    url: '-',
    source: '录入',
    chunks: 1,
    status: '已训练',
    size: '0.00 MB',
    createdAt: '2026-10-10 18:02:43',
  },
  {
    id: 'doc-3',
    name: 'smartai-quick-start.md',
    url: 'http://127.0.0.1/files/smartai-quick-start.md',
    source: '上传',
    chunks: 12,
    status: '已训练',
    size: '0.02 MB',
    createdAt: '2026-10-08 09:31:05',
  },
  {
    id: 'doc-4',
    name: '产品白皮书.docx',
    url: 'http://127.0.0.1/files/smartai-whitepaper.docx',
    source: '上传',
    chunks: 22,
    status: '未训练',
    size: '0.05 MB',
    createdAt: '2026-10-06 14:48:20',
  },
];

/* ---------- 对话数据 ---------- */

export interface MessageItem {
  id: string;
  username: string;
  ip: string;
  role: '提问' | '回答';
  model: string;
  tokens: number;
  promptTokens: number;
  content: string;
  createdAt: string;
}

export interface ChatWindowItem {
  id: string;
  username: string;
  title: string;
  count: number;
  tokens: number;
  lastAt: string;
  createdAt: string;
}

export const mockMessages: MessageItem[] = [];
export const mockChatWindows: ChatWindowItem[] = [];

/* ---------- 账单统计 ---------- */

export interface OrderItem {
  id: string;
  username: string;
  model: string;
  tokens: number;
  promptTokens: number;
  ip: string;
  createdAt: string;
}

export const mockOrders: OrderItem[] = [];

/* ---------- 权限管理 ---------- */

export interface UserItem {
  id: string;
  username: string;
  realName: string;
  role: string;
  dept: string;
  status: '启用' | '禁用';
  email: string;
  phone: string;
}

export const mockUsers: UserItem[] = [
  {
    id: 'user-1',
    username: 'admin',
    realName: '超级管理员',
    role: '系统管理员',
    dept: '平台研发部',
    status: '启用',
    email: 'admin@smartai.dev',
    phone: '138****8888',
  },
];

export const roleOptions = [
  { label: '系统管理员', value: '系统管理员' },
  { label: '默认人员角色', value: '默认人员角色' },
  { label: '演示环境角色', value: '演示环境角色' },
];

export interface RoleItem {
  id: string;
  name: string;
  code: string;
  description: string;
  builtin?: boolean;
}

export const mockRoles: RoleItem[] = [
  {
    id: 'role-1',
    name: '超级管理员角色',
    code: 'administrator',
    description: '超级管理员管理员，不受权限控制，不可编辑',
    builtin: true,
  },
  {
    id: 'role-2',
    name: '默认人员角色',
    code: 'default_env',
    description: '后台新用户注册角色，不可删除',
    builtin: true,
  },
  {
    id: 'role-3',
    name: '演示环境角色',
    code: 'demo_env',
    description: '演示环境使用角色，拥有页面预览权限，没有操作权限',
  },
];

export interface DeptNode {
  id: string;
  name: string;
  description?: string;
  children?: DeptNode[];
}

export const mockDeptTree: DeptNode = {
  id: 'dept-root',
  name: '组织架构',
  children: [
    {
      id: 'dept-1',
      name: '事业部',
      children: [
        { id: 'dept-1-1', name: '北区事业部' },
        { id: 'dept-1-2', name: '销售团队' },
      ],
    },
    {
      id: 'dept-2',
      name: '产品研发部',
      children: [
        { id: 'dept-2-1', name: '前端研发团队' },
        { id: 'dept-2-2', name: '后端研发团队' },
      ],
    },
  ],
};

/** 角色权限树：一级/二级为菜单，三级为按钮权限 */
export const permissionTree = [
  {
    key: 'app',
    title: 'AIGC应用',
    children: [
      {
        key: 'app:chat',
        title: 'AI聊天助手',
        children: [
          { key: 'app:chat:chat', title: '聊天权限' },
          { key: 'app:chat:delete', title: '删除聊天记录' },
        ],
      },
      {
        key: 'app:list',
        title: 'AI应用管理',
        children: [
          { key: 'app:list:add', title: '新增应用' },
          { key: 'app:list:preview', title: '页面预览' },
          { key: 'app:list:edit', title: '修改应用' },
          { key: 'app:list:delete', title: '删除应用' },
          { key: 'app:list:embed-text', title: '文本向量化' },
          { key: 'app:list:embed-doc', title: '文档向量化' },
          { key: 'app:list:chat', title: 'Chat权限' },
        ],
      },
    ],
  },
  {
    key: 'aigc',
    title: 'AIGC平台',
    children: [
      {
        key: 'aigc:model',
        title: '模型管理',
        children: [
          { key: 'aigc:model:add', title: '新增模型' },
          { key: 'aigc:model:edit', title: '修改模型' },
          { key: 'aigc:model:delete', title: '删除模型' },
        ],
      },
      {
        key: 'aigc:embed-store',
        title: '向量库管理',
        children: [
          { key: 'aigc:embed-store:add', title: '新增向量库' },
          { key: 'aigc:embed-store:edit', title: '修改向量库' },
          { key: 'aigc:embed-store:delete', title: '删除向量库' },
        ],
      },
      {
        key: 'aigc:knowledge',
        title: '知识库管理',
        children: [
          { key: 'aigc:knowledge:add', title: '新增知识库' },
          { key: 'aigc:knowledge:edit', title: '修改知识库' },
          { key: 'aigc:knowledge:delete', title: '删除知识库' },
          { key: 'aigc:knowledge:doc-add', title: '新增文档' },
          { key: 'aigc:knowledge:doc-edit', title: '修改文档' },
          { key: 'aigc:knowledge:doc-delete', title: '删除文档' },
        ],
      },
      {
        key: 'aigc:message',
        title: '对话数据',
        children: [{ key: 'aigc:message:delete', title: '删除对话数据' }],
      },
      { key: 'aigc:order', title: '账单统计' },
    ],
  },
  {
    key: 'upms',
    title: '权限管理',
    children: [
      {
        key: 'upms:user',
        title: '用户管理',
        children: [
          { key: 'upms:user:add', title: '新增用户' },
          { key: 'upms:user:edit', title: '修改用户' },
          { key: 'upms:user:delete', title: '删除用户' },
          { key: 'upms:user:reset', title: '重置密码' },
        ],
      },
      {
        key: 'upms:role',
        title: '角色管理',
        children: [
          { key: 'upms:role:add', title: '新增角色' },
          { key: 'upms:role:edit', title: '修改角色' },
          { key: 'upms:role:delete', title: '删除角色' },
        ],
      },
      {
        key: 'upms:dept',
        title: '部门管理',
        children: [
          { key: 'upms:dept:add', title: '新增部门' },
          { key: 'upms:dept:edit', title: '修改部门' },
          { key: 'upms:dept:delete', title: '删除部门' },
        ],
      },
      {
        key: 'upms:menu',
        title: '菜单管理',
        children: [
          { key: 'upms:menu:add', title: '新增菜单' },
          { key: 'upms:menu:edit', title: '修改菜单' },
          { key: 'upms:menu:delete', title: '删除菜单' },
        ],
      },
    ],
  },
  {
    key: 'system',
    title: '系统管理',
    children: [
      {
        key: 'system:log',
        title: '日志管理',
        children: [{ key: 'system:log:delete', title: '删除日志' }],
      },
      {
        key: 'system:token',
        title: '令牌管理',
        children: [{ key: 'system:token:delete', title: '删除令牌' }],
      },
    ],
  },
];

/* ---------- 系统管理 ---------- */

export interface LogItem {
  id: string;
  username: string;
  status: string;
  description: string;
  url: string;
  cost: string;
  method: string;
  ip: string;
  createdAt: string;
}

const logTimes = [
  '2026-10-26 03:20:09',
  '2026-10-26 03:16:31',
  '2026-10-24 16:10:53',
  '2026-10-06 12:36:08',
  '2026-10-04 23:47:48',
  '2026-10-03 22:39:03',
  '2026-10-02 00:48:30',
  '2026-09-12 11:50:24',
  '2026-08-16 00:40:11',
  '2026-08-10 00:53:04',
];

export const mockLogs: LogItem[] = logTimes.map((createdAt, index) => ({
  id: `log-${index + 1}`,
  username: 'administrator',
  status: '正常',
  description: '服务端登录',
  url: '/auth/login',
  cost: '-',
  method: '-',
  ip: '127.0.0.1',
  createdAt,
}));

export interface TokenItem {
  id: string;
  token: string;
  username: string;
  realName: string;
  expiresAt: string;
  roles: string[];
  perms: string[];
}

/** 令牌由登录生成，不支持手动新增；此处为在线会话的演示数据 */
export const mockTokens: TokenItem[] = [
  {
    id: 'user-admin',
    token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiJ9.9f3c1d7a5b2e4f60a8c1d3e5f7b9a2c4',
    username: 'administrator',
    realName: '超级管理员',
    expiresAt: '2026-10-27 18:00:00',
    roles: ['超级管理员角色'],
    perms: ['user:list', 'role:list', 'dept:list', 'menu:list'],
  },
  {
    id: 'user-demo',
    token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJkZW1vIn0.5a7e2c9b1d3f6048b2e4c6a8d0f1b3e5',
    username: 'demo',
    realName: '演示账户',
    expiresAt: '2026-10-26 20:00:00',
    roles: ['默认人员角色'],
    perms: ['model:list', 'knowledge:list', 'message:list'],
  },
];
