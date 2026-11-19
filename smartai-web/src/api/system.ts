import { request } from './http';
import type { PageQuery, PageResult } from './types';

/**
 * 系统管理 API（用户/角色/菜单/部门/日志/令牌），对应 smartai-server 的 Sys*Controller。
 * 契约：更新类接口统一为 PUT 资源根路径且请求体携带 id；列表接口返回 { list, total } 或数组。
 */

export interface SysUserRecord {
  id: string;
  username: string;
  password?: string;
  realName?: string;
  gender?: string;
  phone?: string;
  email?: string;
  deptId?: string;
  avatar?: string;
  isEnabled?: boolean;
  createTime?: string;
  [key: string]: unknown;
}

export interface SysRoleRecord {
  id: string;
  name: string;
  code: string;
  description?: string;
  [key: string]: unknown;
}

export interface SysDeptRecord {
  id: string;
  parentId?: string | null;
  name: string;
  sortOrder?: number;
  description?: string;
  [key: string]: unknown;
}

export interface SysLogRecord {
  id: string;
  resultStatus?: number;
  username?: string;
  operation?: string;
  url?: string;
  durationMs?: number;
  method?: string;
  requestParams?: string;
  ip?: string;
  userAgent?: string;
  createTime?: string;
  [key: string]: unknown;
}

/** 菜单记录：字段与后端 SysMenu 对齐 */
export interface SysMenuRecord {
  id: string;
  name: string;
  parentId?: string | null;
  path?: string;
  perms?: string;
  type: string;
  sortOrder?: number;
  icon?: string;
  component?: string;
  isDisabled?: boolean | number;
  isExternal?: boolean | number;
  isKeepalive?: boolean | number;
  isVisible?: boolean | number;
  [key: string]: unknown;
}

type ListResponse<T> = { list?: T[]; total?: number };

/** 后端列表可能是数组或 { list, total }，统一成 PageResult */
export function toPageResult<T>(data: T[] | ListResponse<T>): PageResult<T> {
  if (Array.isArray(data)) return { list: data, total: data.length };
  const list = data.list ?? [];
  return { list, total: data.total ?? list.length };
}

/** 标准 CRUD：新增 POST 根路径，更新 PUT 根路径（body 带 id），删除 DELETE /{id} */
function createCrudApi<T extends { id: string }>(base: string) {
  return {
    list: async (params?: PageQuery) =>
      toPageResult(await request<T[] | ListResponse<T>>(base, { params })),
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

export const userApi = {
  ...createCrudApi<SysUserRecord>('/api/sys/user'),
  /** 重置密码 */
  resetPassword: (id: string, password: string) =>
    request<unknown>(`/api/sys/user/${id}/password`, { method: 'PUT', body: { password } }),
  /** 分配角色 */
  assignRoles: (id: string, roleIds: string[]) =>
    request<unknown>(`/api/sys/user/${id}/roles`, { method: 'PUT', body: roleIds }),
};

export interface SysUserRoleRecord {
  userId: string;
  roleId: string;
}

export const roleApi = {
  ...createCrudApi<SysRoleRecord>('/api/sys/role'),
  /** 按用户查已授权角色（返回数组） */
  listByUserId: (userId: string) => request<SysRoleRecord[]>(`/api/sys/role/user/${userId}`),
  /** 批量查用户-角色关系 */
  listUserRoles: (userIds: string[]) =>
    request<SysUserRoleRecord[]>('/api/sys/role/user-roles', {
      params: userIds.length ? { userIds: userIds.join(',') } : undefined,
    }),
  /** 保存角色菜单授权 */
  assignMenus: (id: string, menuIds: string[]) =>
    request<unknown>(`/api/sys/role/${id}/menus`, { method: 'PUT', body: menuIds }),
};

export const menuApi = {
  ...createCrudApi<SysMenuRecord>('/api/sys/menu'),
  /** 角色已授权菜单（数组） */
  listByRoleId: (roleId: string) => request<SysMenuRecord[]>(`/api/sys/menu/role/${roleId}`),
  /** 用户可见菜单（数组） */
  listByUserId: (userId: string) => request<SysMenuRecord[]>(`/api/sys/menu/user/${userId}`),
};

export const deptApi = createCrudApi<SysDeptRecord>('/api/sys/dept');

export const logApi = {
  ...createCrudApi<SysLogRecord>('/api/sys/log'),
  deleteAll: () => request<unknown>('/api/sys/log/all', { method: 'DELETE' }),
};

export interface SysTokenRecord {
  id: string;
  token: string;
  account?: string;
  expireTime?: string;
  createTime?: string;
  [key: string]: unknown;
}

export const tokenApi = {
  list: async (account?: string) =>
    toPageResult(
      await request<SysTokenRecord[] | ListResponse<SysTokenRecord>>('/api/sys/token', {
        params: { account },
      }),
    ),
  delete: (id: string) => request<unknown>(`/api/sys/token/${id}`, { method: 'DELETE' }),
};
