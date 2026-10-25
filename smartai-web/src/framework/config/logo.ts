import type { ReactNode } from 'react';

/** Logo 配置：图片/自定义节点、标题、跳转地址均可配置 */
export interface LogoConfig {
  /** 图片地址，默认使用 public/logo.svg */
  src?: string;
  /** 自定义图标节点，优先级高于 src */
  icon?: ReactNode;
  /** 标题 */
  title?: string;
  /** 是否显示标题 */
  showTitle?: boolean;
  /** 菜单收起时是否仍然显示标题 */
  showTitleWhenCollapsed?: boolean;
  /** 点击 Logo 跳转地址 */
  href?: string;
}

export const defaultLogoConfig: LogoConfig = {
  src: '/logo.svg',
  title: 'SmartAI',
  showTitle: true,
  showTitleWhenCollapsed: false,
  href: '/',
};
