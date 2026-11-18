import react from '@vitejs/plugin-react';
import UnoCSS from 'unocss/vite';
import type { PluginOption } from 'vite';
import createMockPlugin from '../mock/index.ts';

/**
 * VITE_USE_MOCK !== 'false' 时启用 dev mock，默认开启，便于脱离后端独立调试。
 */
export default function createPlugins(env: Record<string, string>): PluginOption[] {
  const plugins: PluginOption[] = [react(), UnoCSS()];
  if (env.VITE_USE_MOCK !== 'false') plugins.push(createMockPlugin());
  return plugins;
}
