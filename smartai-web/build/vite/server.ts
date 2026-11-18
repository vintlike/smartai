import type { ServerOptions } from 'vite';

/** dev server 相关环境变量，均带默认值，不配置也能直接启动 */
export interface ServerEnv {
  VITE_DEV_HOST?: string;
  VITE_DEV_PORT?: string;
  /** 后端地址，默认 http://localhost:8080 */
  VITE_API_TARGET?: string;
}

export default function createServer(env: ServerEnv): ServerOptions {
  const port = Number(env.VITE_DEV_PORT) || 3344;

  return {
    host: env.VITE_DEV_HOST || '0.0.0.0',
    port,
    open: false,
    proxy: {
      // 请求层默认以 /api 为前缀，由 dev server 转发到后端
      '/api': {
        target: env.VITE_API_TARGET || 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  };
}
