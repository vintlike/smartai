import type { MockDb, MockRow, MockUserRow } from './db.ts';

export interface MockCtx {
  method: string;
  path: string;
  /** 路径参数，如 /api/sys/user/:id 中的 id */
  params: Record<string, string>;
  query: Record<string, string>;
  /** 请求体，handler 按业务字段读取 */
  body: Record<string, unknown>;
  token: string | null;
  user: MockUserRow | null;
  db: MockDb;
}

export type MockHandler = (ctx: MockCtx) => unknown;

export interface MockRoute {
  method: string;
  /** 支持 :param 占位，如 /api/sys/user/:id */
  path: string;
  /** 免登录接口，默认 false */
  public?: boolean;
  handler: MockHandler;
}

export interface MockResult<T = unknown> {
  code: number;
  message: string;
  data: T;
}

/** 未登录：由中间件转换为 HTTP 401，前端据此触发登录失效逻辑 */
export class UnauthorizedError extends Error {
  constructor(message = '登录状态已失效，请重新登录') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export type { MockRow };
