import type { MenuProps } from 'antd';
import { ExternalLink } from 'lucide-react';
import { MenuIcon } from './MenuIcon';
import type { AppMenuNode } from './types';

export type AntdMenuItem = NonNullable<MenuProps['items']>[number];

export interface BuildMenuItemsOptions {
  iconPrefix?: string;
  getTitle?: (node: AppMenuNode) => string;
}

/** 外链菜单在标题后追加外链图标，普通菜单直接使用标题文本 */
function renderMenuLabel(node: AppMenuNode, title: string) {
  if (!node.isExternal) return title;

  return (
    <span className="sa-menu-label">
      {title}
      <ExternalLink className="sa-menu-label__external" size={12} />
    </span>
  );
}

/**
 * 将框架菜单树转换为 antd Menu items。
 * key 统一使用完整路径，便于路由跳转与高亮。
 */
export function buildMenuItems(
  nodes: AppMenuNode[],
  options: BuildMenuItemsOptions = {},
): AntdMenuItem[] {
  return nodes.map((node) => {
    const title = options.getTitle?.(node) ?? node.title;
    const label = renderMenuLabel(node, title);

    const base: AntdMenuItem = {
      key: node.path,
      icon: <MenuIcon icon={node.icon} iconPrefix={options.iconPrefix} />,
      label,
      disabled: node.disabled,
    };

    if (node.children.length > 0) {
      return {
        ...base,
        children: buildMenuItems(node.children, options),
      } as AntdMenuItem;
    }

    return base;
  });
}
