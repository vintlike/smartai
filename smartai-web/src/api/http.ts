import type { QueryParams } from './types';

/** 后端统一返回结构（对应后端 Result<T>） */
export interface ApiResult<T> {
  code: number;
  message: string;
  data: T;
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  /** query 参数，undefined / null / 空串会被忽略 */
  params?: QueryParams;
  /** 请求体，对象会自动序列化为 JSON，字符串原样透传 */
  body?: unknown;
}

/** 业务错误：HTTP 非 2xx 或响应体 code 非成功码时抛出 */
export class ApiError extends Error {
  readonly code: number;

  constructor(message: string, code = -1) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}

/** 后端成功状态码 */
const SUCCESS_CODE = 200;
/** 未授权状态码：HTTP 层与业务 code 层都会出现 */
const UNAUTHORIZED_CODE = 401;

/** 请求根地址，默认为空（走 Vite dev proxy 的 /api 前缀） */
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

/** token 在 localStorage 中的 key */
export const TOKEN_STORAGE_KEY = 'smartai-web:token';

/** 401 时派发，鉴权模块可监听后跳转登录 */
export const UNAUTHORIZED_EVENT = 'smartai:unauthorized';

/** 读取本地 token，屏蔽隐私模式下的 storage 异常 */
export function getToken(): string | undefined {
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

/** 写入 token（隐私模式下写入失败静默忽略） */
export function setToken(token: string): void {
  try {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {
    // 忽略写入失败，本次会话内仍可通过内存态继续使用
  }
}

export function clearToken(): void {
  try {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // 同上
  }
}

function notifyUnauthorized(): void {
  window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
}

function resolveUrl(path: string, params?: QueryParams): string {
  const url = `${BASE_URL}${path}`;
  if (!params) return url;
  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
  if (!query) return url;
  return `${url}${url.includes('?') ? '&' : '?'}${query}`;
}

/**
 * 统一请求入口：拼接 query、注入 token、解包 { code, message, data }。
 * 业务代码拿到的直接是 data，失败时抛 ApiError，可配合 message.error 使用。
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { params, body, method = 'GET', headers, ...rest } = options;
  const token = getToken();
  const response = await fetch(resolveUrl(path, params), {
    ...rest,
    method,
    headers: {
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: token } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
  });

  if (response.status === UNAUTHORIZED_CODE) {
    notifyUnauthorized();
    throw new ApiError('登录状态已失效，请重新登录', UNAUTHORIZED_CODE);
  }
  if (!response.ok) {
    throw new ApiError(`请求失败：${response.status} ${response.statusText}`, response.status);
  }

  const result = (await response.json()) as ApiResult<T>;
  if (result.code !== SUCCESS_CODE) {
    if (result.code === UNAUTHORIZED_CODE) notifyUnauthorized();
    throw new ApiError(result.message || '请求失败', result.code);
  }
  return result.data;
}

/** request 的语义化包装，避免每个接口都手写 method */
export const http = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'PUT', body }),
  delete: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};
