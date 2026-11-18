import type { ThemeConfig } from 'antd';

/** antd 主题 token 覆盖类型 */
type ThemeTokens = NonNullable<ThemeConfig['token']>;

/** 亮色主题专属 Token（对齐 smartai-ui 设计规范） */
export const lightThemeTokens: ThemeTokens = {
  colorBgLayout: '#f8f8fa',
  colorBgContainer: '#fff',
  colorBorder: '#f0f0f0',
  colorBorderSecondary: '#f0f0f0',
  colorSplit: '#f0f0f0',
};

/** 暗色主题专属 Token（深蓝色系，对齐 smartai-ui 设计规范） */
export const darkThemeTokens: ThemeTokens = {
  colorBgLayout: '#010e1a',
  colorBgContainer: '#011627',
  colorBgElevated: '#010e1a',
  colorBorder: '#1a3a5c',
  colorBorderSecondary: '#1a3a5c',
  colorSplit: '#1a3a5c',
};
