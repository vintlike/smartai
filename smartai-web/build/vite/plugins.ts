import react from '@vitejs/plugin-react';
import UnoCSS from 'unocss/vite';
import type { PluginOption } from 'vite';
import createMockPlugin from '../mock/index.ts';

/**
 * VITE_USE_MOCK !== 'false' 时启用 dev mock，默认开启，便于脱离后端独立调试。
 * VITE_MOCK_EXCLUDE 可按前缀放行到真实后端（逗号分隔），例如 /api/auth,/api/sys。
 */
export default function createPlugins(env: Record<string, string>): PluginOption[] {
  const plugins: PluginOption[] = [react(), UnoCSS()];
  if (env.VITE_USE_MOCK !== 'false') {
    const exclude = (env.VITE_MOCK_EXCLUDE ?? '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    plugins.push(createMockPlugin({ exclude }));
  }
  return plugins;
}
