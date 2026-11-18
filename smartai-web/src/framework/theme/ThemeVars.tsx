import { theme } from 'antd';
import { useEffect } from 'react';
import { applyThemeCssVars } from './cssVars';
import { useThemeMode } from './ThemeProvider';

/**
 * 把 antd 当前 token 同步为 `--app-*` CSS 变量，供 UnoCSS 原子类与 Less 样式引用。
 * 必须位于 ThemeProvider（ConfigProvider）内部，不渲染任何节点。
 */
export function ThemeVars() {
  const { token } = theme.useToken();
  const { isDark } = useThemeMode();

  useEffect(() => {
    applyThemeCssVars(token, isDark);
  }, [token, isDark]);

  return null;
}
