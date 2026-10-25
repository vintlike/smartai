import { Icon } from '@iconify/react';
import { camelToKebab } from '../utils/path';

export interface MenuIconProps {
  icon?: string | null;
  iconPrefix?: string;
  size?: number;
  className?: string;
}

/** 菜单图标：兼容 'mdi:home' 与后端常见的 'PaperPlaneOutline' 两种写法 */
export function MenuIcon({ icon, iconPrefix = 'ion', size = 17, className }: MenuIconProps) {
  if (!icon) return null;
  const name = icon.includes(':') ? icon : `${iconPrefix}:${camelToKebab(icon)}`;
  return <Icon className={className} icon={name} width={size} height={size} aria-hidden />;
}
