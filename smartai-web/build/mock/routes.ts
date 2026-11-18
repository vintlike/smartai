import {
  createDb,
  findUserByName,
  getRows,
  type MockDb,
  type MockRow,
  type MockUserRow,
  nextId,
  toUserInfo,
} from './db.ts';
import { type MockCtx, type MockRoute, UnauthorizedError } from './types.ts';

let db: MockDb | undefined;

export function getDb(): MockDb {
  db ??= createDb();
  return db;
}

/** dev server 重启时重置内存库 */
export function resetDb(): void {
  db = undefined;
}

function now(): string {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

function requireUser(ctx: MockCtx): MockUserRow {
  if (!ctx.user) throw new UnauthorizedError();
  return ctx.user;
}

function paged(ctx: MockCtx, rows: MockRow[]) {
  const page = Number(ctx.query.page ?? 1) || 1;
  const pageSize = Number(ctx.query.pageSize ?? ctx.query.limit ?? 10) || 10;
  const start = (page - 1) * pageSize;
  return { list: rows.slice(start, start + pageSize), total: rows.length };
}

function filterByKeyword(rows: MockRow[], fields: string[], keyword?: string): MockRow[] {
  if (!keyword) return rows;
  const target = keyword.toLowerCase();
  return rows.filter((row) =>
    fields.some((field) =>
      String(row[field] ?? '')
        .toLowerCase()
        .includes(target),
    ),
  );
}

/** 分页与过滤无关的保留参数 */
const RESERVED_QUERY = new Set(['page', 'pageSize', 'limit', 'keyword']);

/** 除分页/关键字外的查询参数按「等值匹配」过滤，如 type=image */
function filterByQuery(rows: MockRow[], query: Record<string, string>): MockRow[] {
  const entries = Object.entries(query).filter(([key]) => !RESERVED_QUERY.has(key));
  if (entries.length === 0) return rows;
  return rows.filter((row) => entries.every(([key, value]) => String(row[key] ?? '') === value));
}

/** 用户表对外不返回密码字段 */
function sanitize(table: string, row: MockRow): MockRow {
  if (table !== 'user') return row;
  const { password: _password, ...rest } = row;
  return rest;
}

/** 列表：支持 keyword 模糊匹配 + 等值过滤 + page / pageSize 分页 */
function listRows(table: string, searchFields: string[] = []) {
  return (ctx: MockCtx) => {
    const result = paged(
      ctx,
      filterByQuery(
        filterByKeyword(getRows(getDb(), table), searchFields, ctx.query.keyword),
        ctx.query,
      ),
    );
    return { ...result, list: result.list.map((row) => sanitize(table, row)) };
  };
}

function getRow(table: string) {
  return (ctx: MockCtx) => {
    const row = getRows(getDb(), table).find((item) => String(item.id) === ctx.params.id);
    if (!row) throw new Error(`${table} 记录不存在`);
    return sanitize(table, row);
  };
}

function createRow(table: string) {
  return (ctx: MockCtx) => {
    const rows = getRows(getDb(), table);
    const row: MockRow = { ...ctx.body, id: nextId(rows), createTime: now() };
    rows.unshift(row);
    return sanitize(table, row);
  };
}

function updateRow(table: string) {
  return (ctx: MockCtx) => {
    const rows = getRows(getDb(), table);
    const index = rows.findIndex((item) => String(item.id) === ctx.params.id);
    if (index < 0) throw new Error(`${table} 记录不存在`);
    const next: MockRow = { ...rows[index], ...ctx.body, id: rows[index].id };
    rows[index] = next;
    return sanitize(table, next);
  };
}

function deleteRow(table: string) {
  return (ctx: MockCtx) => {
    const rows = getRows(getDb(), table);
    const index = rows.findIndex((item) => String(item.id) === ctx.params.id);
    if (index < 0) throw new Error(`${table} 记录不存在`);
    const [removed] = rows.splice(index, 1);
    return removed;
  };
}

function crud(base: string, table: string, searchFields: string[] = []): MockRoute[] {
  return [
    { method: 'GET', path: base, handler: listRows(table, searchFields) },
    { method: 'GET', path: `${base}/:id`, handler: getRow(table) },
    { method: 'POST', path: base, handler: createRow(table) },
    { method: 'PUT', path: `${base}/:id`, handler: updateRow(table) },
    { method: 'DELETE', path: `${base}/:id`, handler: deleteRow(table) },
  ];
}

const login: MockRoute = {
  method: 'POST',
  path: '/api/auth/login',
  public: true,
  handler: (ctx) => {
    const username = String(ctx.body.username ?? '');
    const password = String(ctx.body.password ?? '');
    const user = findUserByName(getDb(), username);
    if (!user || user.password !== password) throw new Error('用户名或密码错误');
    if (user.status !== 1) throw new Error('账号已被禁用');
    const token = `mock-${user.id}-${Date.now()}`;
    getDb().tokens[token] = user.id;
    return { token, user: toUserInfo(user) };
  },
};

const logout: MockRoute = {
  method: 'POST',
  path: '/api/auth/logout',
  handler: (ctx) => {
    if (ctx.token) delete getDb().tokens[ctx.token];
    return null;
  },
};

const currentUser: MockRoute = {
  method: 'GET',
  path: '/api/auth/current',
  handler: (ctx) => toUserInfo(requireUser(ctx)),
};

const changePassword: MockRoute = {
  method: 'PUT',
  path: '/api/auth/password',
  handler: (ctx) => {
    const user = requireUser(ctx);
    if (String(ctx.body.oldPassword ?? '') !== user.password) throw new Error('原密码不正确');
    const next = String(ctx.body.newPassword ?? '');
    if (next.length < 6) throw new Error('新密码至少 6 位');
    user.password = next;
    return null;
  },
};

/** 按提示词生成渐变占位 SVG，避免 mock 依赖外网图片服务 */
function createImageDataUrl(prompt: string, size: string): string {
  const [width, height] = size.split('x').map((value) => Number(value) || 1024);
  const palette = [
    ['#6366f1', '#22d3ee'],
    ['#f97316', '#facc15'],
    ['#10b981', '#3b82f6'],
    ['#ec4899', '#8b5cf6'],
  ];
  const hash = Array.from(prompt).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const [from, to] = palette[hash % palette.length];
  const text = prompt.slice(0, 24).replace(/[<>&]/g, '');
  const fontSize = Math.round(Math.min(width, height) / 22);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><circle cx="${width * 0.75}" cy="${height * 0.28}" r="${Math.min(width, height) * 0.16}" fill="rgba(255,255,255,0.18)"/><text x="50%" y="50%" fill="#fff" font-size="${fontSize}" font-family="sans-serif" text-anchor="middle" dominant-baseline="middle">${text}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/** 按主题生成 Markdown 大纲，前端交给 markmap 渲染 */
function createMindmapMarkdown(topic: string): string {
  const branches = [
    { title: '背景与目标', points: ['现状与痛点', `期望达成的${topic}目标`] },
    { title: '核心方案', points: ['关键能力拆解', '技术选型与依赖', '里程碑排期'] },
    { title: '落地计划', points: ['试点范围', '推广节奏', '验收标准'] },
    { title: '风险与保障', points: ['资源投入', '合规与安全', '回滚预案'] },
  ];
  const lines = [`# ${topic}`];
  for (const branch of branches) {
    lines.push(`## ${branch.title}`);
    for (const point of branch.points) lines.push(`- ${point}`);
  }
  return lines.join('\n');
}

const generateImage: MockRoute = {
  method: 'POST',
  path: '/api/aigc/image/generate',
  handler: (ctx) => ({
    url: createImageDataUrl(
      String(ctx.body.message ?? 'AI 绘图'),
      String(ctx.body.size ?? '1024x1024'),
    ),
  }),
};

const generateMindmap: MockRoute = {
  method: 'POST',
  path: '/api/aigc/mindmap/generate',
  handler: (ctx) => ({
    message: createMindmapMarkdown(String(ctx.body.message ?? '未命名主题')),
  }),
};

/**
 * 路由按声明顺序匹配，特殊路由必须排在通用 CRUD 之前。
 */
export const routes: MockRoute[] = [
  login,
  logout,
  currentUser,
  changePassword,
  generateImage,
  generateMindmap,

  // /api/sys/user/{id} 在后端语义上是「该用户的角色」，与 userApi.listByUserId 对应
  {
    method: 'GET',
    path: '/api/sys/user/:id',
    handler: (ctx) => {
      const user = getRows(getDb(), 'user').find((item) => String(item.id) === ctx.params.id);
      if (!user) throw new Error('用户不存在');
      const roles = getRows(getDb(), 'role').filter((role) => role.roleName === user.role);
      return { list: roles, total: roles.length };
    },
  },
  {
    method: 'GET',
    path: '/api/sys/role/user/:userId',
    handler: (ctx) => {
      const user = getRows(getDb(), 'user').find((item) => String(item.id) === ctx.params.userId);
      const roles = getRows(getDb(), 'role').filter((role) => role.roleName === user?.role);
      return { list: roles, total: roles.length };
    },
  },
  {
    method: 'GET',
    path: '/api/sys/menu/role/:roleId',
    handler: (ctx) =>
      paged(
        ctx,
        getRows(getDb(), 'menu').filter((menu) => menu.type !== 'button'),
      ),
  },
  {
    method: 'GET',
    path: '/api/sys/menu/user/:userId',
    handler: (ctx) =>
      paged(
        ctx,
        getRows(getDb(), 'menu').filter((menu) => menu.type !== 'button'),
      ),
  },
  {
    method: 'DELETE',
    path: '/api/sys/log/all',
    handler: () => {
      const rows = getRows(getDb(), 'log');
      rows.length = 0;
      return null;
    },
  },
  {
    method: 'GET',
    path: '/api/aigc/conversation/user/:userId',
    handler: (ctx) =>
      paged(
        ctx,
        getRows(getDb(), 'conversation').filter(
          (item) => String(item.userId) === ctx.params.userId,
        ),
      ),
  },
  {
    method: 'GET',
    path: '/api/aigc/message/conversation/:conversationId',
    handler: (ctx) =>
      paged(
        ctx,
        getRows(getDb(), 'message').filter(
          (item) => String(item.conversationId) === ctx.params.conversationId,
        ),
      ),
  },
  // 新增消息时同步维护会话的消息条数 / token 消耗 / 结束时间
  {
    method: 'POST',
    path: '/api/aigc/message',
    handler: (ctx) => {
      const rows = getRows(getDb(), 'message');
      const row: MockRow = { ...ctx.body, id: nextId(rows), createTime: now() };
      rows.push(row);
      const conversation = getRows(getDb(), 'conversation').find(
        (item) => String(item.id) === String(ctx.body.conversationId),
      );
      if (conversation) {
        const content = String(ctx.body.content ?? '');
        conversation.chatTotal = Number(conversation.chatTotal ?? 0) + 1;
        conversation.tokenUsed =
          Number(conversation.tokenUsed ?? 0) + Math.max(1, Math.round(content.length / 2));
        conversation.endTime = row.createTime;
      }
      return row;
    },
  },

  ...crud('/api/sys/user', 'user', ['username', 'realName', 'email', 'phone']),
  ...crud('/api/sys/role', 'role', ['roleName', 'roleCode']),
  ...crud('/api/sys/menu', 'menu', ['name', 'path']),
  ...crud('/api/sys/dept', 'dept', ['deptName']),
  ...crud('/api/sys/log', 'log', ['username', 'operation']),
  ...crud('/api/aigc/model-provider', 'provider', ['name', 'code']),
  ...crud('/api/aigc/model', 'model', ['name', 'modelName']),
  ...crud('/api/aigc/embed-store', 'embed-store', ['name']),
  ...crud('/api/aigc/knowledge', 'knowledge', ['name', 'description']),
  ...crud('/api/aigc/docs', 'docs', ['name']),
  ...crud('/api/aigc/app', 'app', ['name', 'description']),
  ...crud('/api/aigc/conversation', 'conversation', ['title']),
  ...crud('/api/aigc/message', 'message', ['content']),
];
