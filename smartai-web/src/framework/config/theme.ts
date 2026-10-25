/**
 * 设计令牌 / 主题配置
 * 该文件只描述「可选项」，不包含任何业务逻辑。
 */

/** 布局设置 */
export const layoutModes = [
  { value: 'vertical', label: '左侧菜单模式' },
  { value: 'horizontal', label: '顶部菜单模式' },
  { value: 'blend', label: '混合菜单模式' },
] as const;

/** 主题风格 */
export const themeModes = [
  { value: 'light', label: '亮色风格' },
  { value: 'dark', label: '暗黑模式' },
] as const;

/** 主题色 */
export const colorPrimary = '#415fff';

/** UI设计色卡 */
export const uiColors = {
  /** 主要 */
  colorPrimary,
  /** 成功 */
  colorSuccess: '#0ac17e',
  /** 错误 */
  colorDanger: '#ff3c31',
  /** 警告 */
  colorWarning: '#fc8519',
  /** 信息 */
  colorInfo: '#72caed',
  /** 链接 */
  colorLink: colorPrimary,
} as const;

export interface ThemeColorOption {
  color: string;
  title: string;
  description?: string;
  disabled?: boolean;
}

/** 平台主题色切换 */
export const themeColors: ThemeColorOption[] = [
  { color: colorPrimary, title: '品牌蓝', description: '品牌主色' },
  { color: '#1890ff', title: '科技蓝', description: '品牌、科技' },

  /** 下面的是 antd 框架基础色板 */
  { color: '#f5222d', title: '薄暮', description: '斗志、奔放' },
  { color: '#fa541c', title: '火山', description: '醒目、澎湃' },
  { color: '#fa8c16', title: '日暮', description: '温暖、欢快' },
  { color: '#a0d911', title: '青柠', description: '自然、生机', disabled: true },
  { color: '#faad14', title: '金盏花', description: '活力、积极', disabled: true },
  { color: '#fadb14', title: '日出', description: '出生、阳光', disabled: true },
  { color: '#52c41a', title: '极光绿', description: '健康、创新' },
  { color: '#13c2c2', title: '明青', description: '希望、坚强' },
  { color: '#1677ff', title: '拂晓蓝', description: '包容、科技、普惠' },
  { color: '#2f54eb', title: '极客蓝', description: '探索、钻研' },
  { color: '#722ed1', title: '酱紫', description: '优雅、浪漫' },
  { color: '#eb2f96', title: '法式洋红', description: '明快、感性' },
];

/** 报表色卡 */
export const chartColors: string[] = [
  ...Array.from(new Set(Object.values(uiColors))),
  '#9465bb',
  '#7465f9',
  '#78c77b',
  '#e98248',
  '#f4bef3',
  '#4dbfff',
  '#fc8518',
  '#7086f1',
  '#fba667',
  '#b091f6',
  '#e597c3',
  '#809fff',
  '#85c6cf',
  '#76a6c9',
  '#939ae5',
  '#b0cac3',
  '#7b82be',
  '#7eb9aa',
  '#ddb07a',
];

export type LayoutMode = (typeof layoutModes)[number]['value'];
export type ThemeMode = (typeof themeModes)[number]['value'];

export const defaultLayoutMode: LayoutMode = 'vertical';
export const defaultThemeMode: ThemeMode = 'light';

/** 主题 Token：亮/暗两套设计令牌，统一注入 antd 与全局 CSS 变量 */
export interface ThemeToken {
  colorBgLayout: string;
  colorBgContainer: string;
  colorBgElevated?: string;
  colorBorder: string;
  colorBorderSecondary: string;
  colorSplit: string;
  /** 滚动条颜色：`滑块颜色` 或 `滑块颜色 轨道颜色` */
  scrollbarColor: string;
  scrollbarWidth?: 'thin' | 'auto' | 'none';
  scrollbarGutter?: 'stable' | 'auto';
}

/** 亮色主题 Token */
export const lightThemeToken: ThemeToken = {
  colorBgLayout: '#f8f8fa',
  colorBgContainer: '#fff',
  colorBorder: '#f0f0f0',
  colorBorderSecondary: '#f0f0f0',
  colorSplit: '#f0f0f0',
  scrollbarColor: '#c1c1c1',
};

/** 暗色主题 Token */
export const darkThemeToken: ThemeToken = {
  colorBgLayout: '#010e1a',
  colorBgContainer: '#011627',
  colorBgElevated: '#010e1a',
  colorBorder: '#1a3a5c',
  colorBorderSecondary: '#1a3a5c',
  colorSplit: '#1a3a5c',
  scrollbarColor: '#1890ff #f0f0f0',
  scrollbarWidth: 'thin',
  scrollbarGutter: 'stable',
};

/** 主题风格 -> Token 映射 */
export const themeTokens: Record<ThemeMode, ThemeToken> = {
  light: lightThemeToken,
  dark: darkThemeToken,
};
