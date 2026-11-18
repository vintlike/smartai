import { request, setToken } from './http';

export interface AuthUser {
  id: number;
  username: string;
  /** 展示名，对应 LayoutConfig.userInfo.name */
  name: string;
  /** 登录账号 / 邮箱 */
  account: string;
  avatar?: string;
  description?: string;
  roles?: string[];
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

export async function login(username: string, password: string): Promise<AuthUser> {
  const result = await request<LoginResult>('/api/auth/login', {
    method: 'POST',
    body: { username, password } satisfies LoginPayload,
  });
  setToken(result.token);
  notifyAuthChanged(result.user);
  return result.user;
}

export function logout(): Promise<unknown> {
  return request<unknown>('/api/auth/logout', { method: 'POST' });
}

export function fetchCurrentUser(): Promise<AuthUser> {
  return request<AuthUser>('/api/auth/current');
}

export function updatePassword(data: PasswordPayload): Promise<unknown> {
  return request<unknown>('/api/auth/password', { method: 'PUT', body: data });
}
