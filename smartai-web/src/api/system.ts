import { request } from './http';
import type { PageQuery, PageResult } from './types';

/**
 * 系统管理 API（用户/角色/菜单/部门/日志），对应 smartai-server 的 Sys*Controller。
 * 契约：request 已统一解析 Result<T> 并返回 data；分页接口返回 { list, total }。
 */

/** 用户记录（字段随后端扩展，仅约束主键） */
export interface SysUserRecord {
  id: number | string;
  [key: string]: unknown;
}

/** 角色记录 */
export interface SysRoleRecord {
  id: number | string;
  [key: string]: unknown;
}

/** 部门记录 */
export interface SysDeptRecord {
  id: number | string;
  [key: string]: unknown;
}

/** 操作日志记录 */
export interface SysLogRecord {
  id: number | string;
  [key: string]: unknown;
}

/** 标准 CRUD 五件套：由资源根路径生成，列表统一走分页查询 */
function createSystemApi<T extends { id: number | string }>(base: string) {
  return {
    list: (params?: PageQuery) => request<PageResult<T>>(base, { params }),
    getById: (id: number | string) => request<T>(`${base}/${id}`),
    create: (data: Partial<T>) => request<unknown>(base, { method: 'POST', body: data }),
    update: (id: number | string, data: Partial<T>) =>
      request<unknown>(`${base}/${id}`, { method: 'PUT', body: data }),
    delete: (id: number | string) => request<unknown>(`${base}/${id}`, { method: 'DELETE' }),
  };
}

/** 用户管理：CRUD + 按用户查角色 */
export const userApi = {
  ...createSystemApi<SysUserRecord>('/api/sys/user'),
  listByUserId: (userId: number | string) =>
    request<PageResult<SysRoleRecord>>(`/api/sys/user/${userId}`),
};

/** 角色管理：CRUD + 按用户查已授权角色 */
export const roleApi = {
  ...createSystemApi<SysRoleRecord>('/api/sys/role'),
  listByUserId: (userId: number | string) =>
    request<PageResult<SysRoleRecord>>(`/api/sys/role/user/${userId}`),
};

/** 菜单管理：CRUD + 按角色/用户查授权菜单 */
export const menuApi = {
  ...createSystemApi<SysRoleRecord>('/api/sys/menu'),
  listByRoleId: (roleId: number | string) =>
    request<PageResult<SysRoleRecord>>(`/api/sys/menu/role/${roleId}`),
  listByUserId: (userId: number | string) =>
    request<PageResult<SysRoleRecord>>(`/api/sys/menu/user/${userId}`),
};

/** 部门管理：标准 CRUD（树形数据由页面自行组装） */
export const deptApi = createSystemApi<SysDeptRecord>('/api/sys/dept');

/** 日志管理：CRUD + 清空全部 */
export const logApi = {
  ...createSystemApi<SysLogRecord>('/api/sys/log'),
  deleteAll: () => request<unknown>('/api/sys/log/all', { method: 'DELETE' }),
};
