import { request, setToken } from './http';

/** 后端 /api/auth/me 返回体（AuthUserVO） */
interface BackendAuthUser {
  id: string;
  username: string;
  realName?: string;
  avatar?: string;
  /** 角色名称列表 */
  roles?: string[];
  roleCodes?: string[];
  perms?: string[];
  superAdmin?: boolean;
}

export interface AuthUser {
  id: number | string;
  username: string;
  /** 展示名，对应 LayoutConfig.userInfo.name */
  name: string;
  /** 登录账号 */
  account: string;
  avatar?: string;
  description?: string;
  roles?: string[];
  roleCodes?: string[];
  perms?: string[];
  superAdmin?: boolean;
  /** 以下字段供个人中心展示，后端未返回时按空处理 */
  realName?: string;
  email?: string;
  phone?: string;
  sex?: string;
  deptName?: string;
  createTime?: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResult {
  token: string;
  user: AuthUser;
}

export interface PasswordPayload {
  oldPassword: string;
  newPassword: string;
}

/** 登录态变更时派发，供全局 AuthProvider 同步直接调用登录接口的用户信息 */
export const AUTH_CHANGED_EVENT = 'smartai:auth-changed';

function notifyAuthChanged(user: AuthUser | null): void {
  window.dispatchEvent(
    new CustomEvent<{ user: AuthUser | null }>(AUTH_CHANGED_EVENT, { detail: { user } }),
  );
}

export function toAuthUser(source: BackendAuthUser): AuthUser {
  const roleNames = source.roles ?? [];
  return {
    id: source.id,
    username: source.username,
    name: source.realName || source.username,
    account: source.username,
    avatar: source.avatar,
    description: roleNames.join(' / ') || undefined,
    roles: roleNames,
    roleCodes: source.roleCodes ?? [],
    perms: source.perms ?? [],
    superAdmin: source.superAdmin ?? false,
    realName: source.realName,
  };
}

export async function login(username: string, password: string): Promise<AuthUser> {
  const result = await request<LoginResult>('/api/auth/login', {
    method: 'POST',
    body: { username, password } satisfies LoginPayload,
  });
  setToken(result.token);
  const user = toAuthUser(result.user as unknown as BackendAuthUser);
  notifyAuthChanged(user);
  return user;
}

export function logout(): Promise<unknown> {
  return request<unknown>('/api/auth/logout', { method: 'POST' });
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  const user = await request<BackendAuthUser>('/api/auth/me');
  return toAuthUser(user);
}

export function updatePassword(data: PasswordPayload): Promise<unknown> {
  return request<unknown>('/api/auth/password', { method: 'PUT', body: data });
}
