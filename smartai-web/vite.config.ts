import { type ConfigEnv, loadEnv, type UserConfig } from 'vite';
import build from './build/vite/build.ts';
import createPlugins from './build/vite/plugins.ts';
import resolve from './build/vite/resolve.ts';
import createServer from './build/vite/server.ts';

export default ({ mode }: ConfigEnv): UserConfig => {
  // 第三个参数为空串表示读取全部环境变量（含系统环境变量），便于 CI 覆盖
  const env = loadEnv(mode, process.cwd(), '');

  return {
    resolve,
    plugins: createPlugins(env),
    server: createServer(env),
    build,
  };
};
