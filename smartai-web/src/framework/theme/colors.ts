import type { ThemeColorOption } from '../types';

/** 默认主题色（品牌蓝，设置抽屉色板第 1 项） */
export const colorPrimary = '#415fff';

/**
 * UI 设计色卡（功能色，对齐 smartai-ui 设计规范）。
 * colorLink 运行时跟随主题色，不在此定义。
 */
export const uiColors = {
  /** 成功 */
  colorSuccess: '#0ac17e',
  /** 错误 */
  colorError: '#ff3c31',
  /** 警告 */
  colorWarning: '#fc8519',
  /** 信息 */
  colorInfo: '#72caed',
};

/**
 * 内置默认主题色板（保持与设计规范一致，含禁用项，由 UI 层过滤 disabled）。
 * 业务可通过 LayoutConfig.themeColors 整体覆盖为自有色板。
 */
export const defaultThemeColors: ThemeColorOption[] = [
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

/**
 * 报表色卡（对齐 smartai-ui 设计规范）：
 * 功能色去重后追加扩展色，供 Dashboard 等图表页使用。
 */
export const chartColors = [
  ...new Set([colorPrimary, ...Object.values(uiColors)]),
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
