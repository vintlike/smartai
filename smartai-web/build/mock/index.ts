import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin } from 'vite';
import { findUserByToken } from './db.ts';
import { getDb, resetDb, routes } from './routes.ts';
import { type MockResult, type MockRoute, UnauthorizedError } from './types.ts';

const METHODS_WITH_BODY = new Set(['POST', 'PUT', 'PATCH']);

export interface MockPluginOptions {
  /** 模拟网络延迟，默认 80ms，传 0 关闭 */
  delay?: number;
}

function matchRoute(
  method: string,
  path: string,
): { route: MockRoute; params: Record<string, string> } | undefined {
  const pathParts = path.split('/').filter(Boolean);
  for (const route of routes) {
    if (route.method !== method) continue;
    const routeParts = route.path.split('/').filter(Boolean);
    if (routeParts.length !== pathParts.length) continue;

    const params: Record<string, string> = {};
    let matched = true;
    for (let index = 0; index < routeParts.length; index += 1) {
      const routePart = routeParts[index];
      if (routePart.startsWith(':')) {
        params[routePart.slice(1)] = decodeURIComponent(pathParts[index]);
      } else if (routePart !== pathParts[index]) {
        matched = false;
        break;
      }
    }
    if (matched) return { route, params };
  }
  return undefined;
}

async function readBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  if (!METHODS_WITH_BODY.has((req.method ?? 'GET').toUpperCase())) return {};
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    if (typeof chunk === 'string') chunks.push(Buffer.from(chunk));
    else chunks.push(chunk as Buffer);
  }
  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function parseToken(authorization?: string): string | null {
  if (!authorization) return null;
  return authorization.replace(/^Bearer\s+/i, '') || null;
}

function send(res: ServerResponse, status: number, payload: MockResult): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

/**
 * 开发期 mock 中间件：拦截 /api 请求，命中路由就返回，未命中交回 Vite（proxy / 静态资源）。
 * 生产构建不包含任何 mock 代码。
 */
export default function createMockPlugin(options: MockPluginOptions = {}): Plugin {
  const delay = options.delay ?? 80;

  return {
    name: 'smartai:mock',
    apply: 'serve',
    configureServer(server) {
      resetDb();

      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? '';
        if (!url.startsWith('/api/')) {
          next();
          return;
        }

        const [pathname, search = ''] = url.split('?');
        const method = (req.method ?? 'GET').toUpperCase();
        const matched = matchRoute(method, pathname);
        if (!matched) {
          next();
          return;
        }

        const body = await readBody(req);
        const token = parseToken(req.headers.authorization);
        const db = getDb();
        const user = findUserByToken(db, token);

        if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay));

        if (!matched.route.public && !user) {
          send(res, 401, { code: 401, message: '登录状态已失效，请重新登录', data: null });
          return;
        }

        try {
          const data = matched.route.handler({
            method,
            path: pathname,
            params: matched.params,
            query: Object.fromEntries(new URLSearchParams(search)),
            body,
            token,
            user: user ?? null,
            db,
          });
          send(res, 200, { code: 200, message: 'ok', data });
        } catch (error) {
          if (error instanceof UnauthorizedError) {
            send(res, 401, { code: 401, message: error.message, data: null });
            return;
          }
          const message = error instanceof Error ? error.message : 'mock 处理失败';
          send(res, 200, { code: 500, message, data: null });
        }
      });

      server.config.logger.info(
        `  ➜  Mock: ${routes.length} 个接口已就绪（在 .env.local 设 VITE_USE_MOCK=false 可关闭）`,
      );
    },
  };
}
