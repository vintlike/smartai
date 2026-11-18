export interface MockRow {
  id: number;
  [key: string]: unknown;
}

export interface MockUserRow extends MockRow {
  username: string;
  password: string;
  realName: string;
  role: string;
  deptName: string;
  status: number;
}

export interface MockDb {
  tables: Record<string, MockRow[]>;
  /** token -> userId */
  tokens: Record<string, number>;
}

const createTime = '2026-01-01 10:00:00';

function seed(rows: Array<Record<string, unknown>>): MockRow[] {
  return rows.map((row, index) => ({ id: index + 1, createTime, ...row }));
}

/**
 * 内存库：dev server 启动时创建，重启即还原，避免本地调试污染。
 */
export function createDb(): MockDb {
  return {
    tables: {
      user: seed([
        {
          username: 'admin',
          password: 'admin123',
          realName: '管理员',
          role: '超级管理员',
          deptName: '研发中心',
          status: 1,
          email: 'admin@smartai.com',
          phone: '13800000000',
          sex: '男',
          avatar: '/logo.svg',
          description: '超级管理员',
        },
        {
          username: 'operator',
          password: 'operator123',
          realName: '运营小王',
          role: '运营',
          deptName: '运营中心',
          status: 1,
          email: 'operator@smartai.com',
          phone: '13900000000',
          sex: '女',
          description: '运营人员',
        },
        {
          username: 'ops',
          password: 'ops123',
          realName: '运营小李',
          role: '运营',
          deptName: '运营中心',
          status: 1,
          email: 'ops@smartai.com',
          phone: '13900000001',
          sex: '女',
          description: '运营角色',
        },
        {
          username: 'guest',
          password: 'guest123',
          realName: '访客',
          role: '访客',
          deptName: '测试组',
          status: 0,
          email: 'guest@smartai.com',
          phone: '13700000000',
        },
      ]),
      role: seed([
        { roleName: '超级管理员', roleCode: 'admin', remark: '拥有全部权限' },
        { roleName: '运营', roleCode: 'operator', remark: '内容与知识库维护' },
        { roleName: '访客', roleCode: 'guest', remark: '只读' },
      ]),
      dept: seed([
        { id: 1, parentId: null, deptName: '总部', orderNo: 1 },
        { id: 2, parentId: 1, deptName: '研发中心', orderNo: 1 },
        { id: 3, parentId: 1, deptName: '运营中心', orderNo: 2 },
        { id: 4, parentId: 2, deptName: '前端组', orderNo: 1 },
        { id: 5, parentId: 2, deptName: '测试组', orderNo: 2 },
      ]),
      menu: seed([
        {
          id: 1,
          parentId: null,
          name: '主控台',
          path: '/dashboard',
          perms: 'dashboard:view',
          type: 'menu',
          orderNo: 1,
          icon: 'dashboard',
          component: 'Dashboard',
          isShow: 1,
        },
        {
          id: 2,
          parentId: null,
          name: 'AIGC应用',
          path: '/aigc-app',
          type: 'catalog',
          orderNo: 2,
          icon: 'appstore',
        },
        {
          id: 3,
          parentId: 2,
          name: 'AI聊天助手',
          path: '/aigc-app/chat',
          perms: 'aigc:chat',
          type: 'menu',
          orderNo: 1,
          icon: 'comment',
          component: 'chat',
          isShow: 1,
        },
        {
          id: 4,
          parentId: 2,
          name: 'AI应用管理',
          path: '/aigc-app/manage',
          perms: 'aigc:app',
          type: 'menu',
          orderNo: 2,
          icon: 'appstore',
          component: 'appManage',
          isShow: 1,
        },
        {
          id: 5,
          parentId: 2,
          name: '应用配置',
          path: '/aigc-app/config/:appId',
          type: 'menu',
          orderNo: 3,
          component: 'appConfig',
          isShow: 0,
        },
        {
          id: 6,
          parentId: 2,
          name: 'AI 绘图',
          path: '/aigc-app/image',
          perms: 'aigc:image',
          type: 'menu',
          orderNo: 4,
          icon: 'picture',
          component: 'image',
          isShow: 1,
        },
        {
          id: 7,
          parentId: 2,
          name: '思维导图',
          path: '/aigc-app/mindmap',
          perms: 'aigc:mindmap',
          type: 'menu',
          orderNo: 5,
          icon: 'partition',
          component: 'mindmap',
          isShow: 1,
        },
        {
          id: 8,
          parentId: null,
          name: 'AIGC平台',
          path: '/aigc-platform',
          type: 'catalog',
          orderNo: 3,
          icon: 'database',
        },
        {
          id: 9,
          parentId: 8,
          name: '模型管理',
          path: '/aigc-platform/models',
          perms: 'platform:model',
          type: 'menu',
          orderNo: 1,
          icon: 'setting',
          component: 'models',
          isShow: 1,
        },
        {
          id: 10,
          parentId: 8,
          name: '模型供应商管理',
          path: '/aigc-platform/providers',
          perms: 'platform:provider',
          type: 'menu',
          orderNo: 2,
          icon: 'setting',
          component: 'providers',
          isShow: 1,
        },
        {
          id: 11,
          parentId: 8,
          name: '向量库管理',
          path: '/aigc-platform/vector',
          perms: 'platform:vector',
          type: 'menu',
          orderNo: 3,
          icon: 'database',
          component: 'vector',
          isShow: 1,
        },
        {
          id: 12,
          parentId: 8,
          name: '知识库管理',
          path: '/aigc-platform/knowledge',
          perms: 'platform:knowledge',
          type: 'menu',
          orderNo: 4,
          icon: 'folder',
          component: 'knowledge',
          isShow: 1,
        },
        {
          id: 13,
          parentId: 8,
          name: '知识库数据',
          path: '/aigc-platform/knowledge/:knowledgeId',
          type: 'menu',
          orderNo: 5,
          component: 'knowledgeData',
          isShow: 0,
        },
        {
          id: 14,
          parentId: 8,
          name: '对话数据管理',
          path: '/aigc-platform/conversation',
          perms: 'platform:conversation',
          type: 'menu',
          orderNo: 6,
          icon: 'comment',
          component: 'conversation',
          isShow: 1,
        },
        {
          id: 15,
          parentId: 8,
          name: '账单统计',
          path: '/aigc-platform/billing',
          perms: 'platform:billing',
          type: 'menu',
          orderNo: 7,
          icon: 'creditCard',
          component: 'billing',
          isShow: 1,
        },
        {
          id: 16,
          parentId: null,
          name: '权限管理',
          path: '/permission',
          type: 'catalog',
          orderNo: 4,
          icon: 'team',
        },
        {
          id: 17,
          parentId: 16,
          name: '部门管理',
          path: '/permission/department',
          perms: 'permission:dept',
          type: 'menu',
          orderNo: 1,
          icon: 'team',
          component: 'department',
          isShow: 1,
        },
        {
          id: 18,
          parentId: 16,
          name: '角色管理',
          path: '/permission/role',
          perms: 'permission:role',
          type: 'menu',
          orderNo: 2,
          icon: 'user',
          component: 'role',
          isShow: 1,
        },
        {
          id: 19,
          parentId: 16,
          name: '用户管理',
          path: '/permission/user',
          perms: 'permission:user',
          type: 'menu',
          orderNo: 3,
          icon: 'user',
          component: 'user',
          isShow: 1,
        },
        {
          id: 20,
          parentId: 16,
          name: '菜单管理',
          path: '/permission/menu',
          perms: 'permission:menu',
          type: 'menu',
          orderNo: 4,
          icon: 'setting',
          component: 'menu',
          isShow: 1,
        },
        {
          id: 21,
          parentId: null,
          name: '系统管理',
          path: '/system',
          type: 'catalog',
          orderNo: 5,
          icon: 'setting',
        },
        {
          id: 22,
          parentId: 21,
          name: '平台设置',
          path: '/system/config',
          perms: 'system:config',
          type: 'menu',
          orderNo: 1,
          icon: 'setting',
          component: 'systemConfig',
          isShow: 1,
        },
        {
          id: 23,
          parentId: 21,
          name: '日志管理',
          path: '/system/logs',
          perms: 'system:log',
          type: 'menu',
          orderNo: 2,
          icon: 'fileText',
          component: 'logs',
          isShow: 1,
        },
        {
          id: 24,
          parentId: 21,
          name: '令牌管理',
          path: '/system/tokens',
          perms: 'system:token',
          type: 'menu',
          orderNo: 3,
          icon: 'key',
          component: 'tokens',
          isShow: 1,
        },
        {
          id: 25,
          parentId: null,
          name: '个人中心',
          path: '/profile',
          type: 'menu',
          orderNo: 9,
          icon: 'user',
          component: 'profile',
          isShow: 0,
        },
      ]),
      log: seed([
        { username: 'admin', operation: '登录系统', ip: '127.0.0.1', status: 1 },
        { username: 'admin', operation: '新增模型供应商', ip: '127.0.0.1', status: 1 },
        { username: 'operator', operation: '更新知识库', ip: '10.0.0.12', status: 1 },
        { username: 'guest', operation: '查询用户列表', ip: '10.0.0.31', status: 0 },
      ]),
      provider: seed([
        { name: 'OpenAI', code: 'openai', remark: '官方渠道' },
        { name: '通义千问', code: 'qwen', remark: '阿里云百炼' },
        { name: '本地部署', code: 'local', remark: 'vLLM 自建' },
      ]),
      model: seed([
        { name: 'GPT-4o', modelName: 'gpt-4o', type: 'chat', providerCode: 'openai' },
        { name: 'Qwen-Max', modelName: 'qwen-max', type: 'chat', providerCode: 'qwen' },
        {
          name: 'bge-large-zh',
          modelName: 'bge-large-zh',
          type: 'embedding',
          providerCode: 'local',
        },
        { name: 'DALL·E 3', modelName: 'dall-e-3', type: 'image', providerCode: 'openai' },
        { name: '通义万相', modelName: 'wanx-v1', type: 'image', providerCode: 'qwen' },
      ]),
      'embed-store': seed([
        { name: '产品知识库', dimension: 1024, model: 'bge-large-zh' },
        { name: '售后知识库', dimension: 1024, model: 'bge-large-zh' },
      ]),
      knowledge: seed([
        { name: '产品手册', description: '产品功能说明与操作指引', docCount: 12 },
        { name: '售后 FAQ', description: '常见问题与处理方案', docCount: 8 },
      ]),
      docs: seed([
        { name: '入门指南.md', knowledgeId: 1, size: 20480 },
        { name: '常见问题.md', knowledgeId: 2, size: 15360 },
      ]),
      app: seed([
        { name: '智能客服', description: '基于知识库的问答助手' },
        { name: '会议纪要', description: '录音转写并生成纪要' },
      ]),
      conversation: seed([
        {
          title: '产品功能咨询',
          userId: 1,
          username: 'admin',
          appId: 1,
          chatTotal: 2,
          tokenUsed: 486,
          endTime: '2026-01-01 10:05:00',
        },
        {
          title: '售后问题排查',
          userId: 2,
          username: 'operator',
          appId: 1,
          chatTotal: 2,
          tokenUsed: 627,
          endTime: '2026-01-01 11:20:00',
        },
        {
          title: '周会纪要生成',
          userId: 1,
          username: 'admin',
          appId: 2,
          chatTotal: 0,
          tokenUsed: 0,
          endTime: '2026-01-01 09:30:00',
        },
      ]),
      message: seed([
        { conversationId: 1, role: 'user', content: '支持哪些模型？' },
        { conversationId: 1, role: 'assistant', content: '目前支持 GPT-4o、Qwen-Max 等。' },
        { conversationId: 2, role: 'user', content: '如何重置密码？' },
        { conversationId: 2, role: 'assistant', content: '请在个人中心点击重置密码。' },
      ]),
    },
    tokens: {},
  };
}

export function getRows(db: MockDb, name: string): MockRow[] {
  db.tables[name] ??= [];
  return db.tables[name];
}

export function nextId(rows: MockRow[]): number {
  return rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
}

export function findUserByName(db: MockDb, username: string): MockUserRow | undefined {
  return getRows(db, 'user').find((row) => row.username === username) as MockUserRow | undefined;
}

export function findUserByToken(db: MockDb, token: string | null): MockUserRow | undefined {
  if (!token) return undefined;
  const userId = db.tokens[token];
  if (!userId) return undefined;
  return getRows(db, 'user').find((row) => row.id === userId) as MockUserRow | undefined;
}

/** 去掉密码等敏感字段，返回前端需要的用户信息 */
export function toUserInfo(user: MockUserRow) {
  return {
    id: user.id,
    username: user.username,
    name: user.realName,
    realName: user.realName,
    account: user.email ?? user.username,
    email: (user.email as string | undefined) ?? '',
    phone: (user.phone as string | undefined) ?? '',
    sex: (user.sex as string | undefined) ?? '',
    deptName: user.deptName,
    createTime: user.createTime,
    avatar: user.avatar as string | undefined,
    description: user.description as string | undefined,
    roles: [user.role],
  };
}
