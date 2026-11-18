import type { GlobalToken } from 'antd';

/**
 * 主题 token → CSS 变量。
 * UnoCSS 原子类与 Less 样式只引用 `--app-*` 变量，切换主题色 / 暗色时自动跟随，
 * 避免组件样式中出现写死色值。
 */
export function applyThemeCssVars(token: GlobalToken, isDark: boolean): void {
  const root = document.documentElement;

  const variables: Record<string, string> = {
    '--app-color-primary': token.colorPrimary,
    '--app-color-success': token.colorSuccess,
    '--app-color-error': token.colorError,
    '--app-color-warning': token.colorWarning,
    '--app-color-info': token.colorInfo,
    '--app-color-bg-layout': token.colorBgLayout,
    '--app-color-bg-container': token.colorBgContainer,
    '--app-color-bg-elevated': token.colorBgElevated,
    '--app-color-border': token.colorBorder,
    '--app-color-border-secondary': token.colorBorderSecondary,
    '--app-color-text': token.colorText,
    '--app-color-text-secondary': token.colorTextSecondary,
    '--app-color-text-tertiary': token.colorTextTertiary,
    '--app-color-text-quaternary': token.colorTextQuaternary,
    '--app-color-fill-secondary': token.colorFillSecondary,
    '--app-color-fill-quaternary': token.colorFillQuaternary,
    // 滚动条无法从 antd token 推出合适的对比度，按明暗模式给定值
    '--app-scrollbar-thumb': isDark ? '#043254' : '#c1c1c1',
    '--app-scrollbar-thumb-hover': isDark ? '#065286' : '#a8a8a8',
  };

  for (const [name, value] of Object.entries(variables)) {
    if (value) root.style.setProperty(name, value);
  }
}
