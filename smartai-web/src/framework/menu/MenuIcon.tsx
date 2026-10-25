import { type CSSProperties, createElement } from 'react';
import { resolveMenuIcon } from '@/framework/menu/menuIconMap';

export interface MenuIconProps {
  /** 菜单图标名，支持 antd 图标名（DashboardOutlined / dashboard-outlined）与历史 ionicons 名称（GridOutline） */
  icon?: string | null;
  size?: number;
  className?: string;
  style?: CSSProperties;
}

/** 菜单图标：统一使用 antd 图标，未在注册表中登记的图标名不渲染 */
export function MenuIcon({ icon, size = 17, className, style }: MenuIconProps) {
  const Icon = resolveMenuIcon(icon);
  if (!Icon) return null;
  // 用 createElement 而非 JSX，避免静态分析把注册表查表误判为运行时创建组件
  return createElement(Icon, {
    className,
    style: { fontSize: size, ...style },
    'aria-hidden': true,
  });
}
