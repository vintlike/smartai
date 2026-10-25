import type { MenuProps } from 'antd'
import { ExternalLink } from 'lucide-react'
import { MenuIcon } from './MenuIcon'
import type { AppMenuNode } from './types'

export type AntdMenuItem = NonNullable<MenuProps['items']>[number]

export interface BuildMenuItemsOptions {
  iconPrefix?: string
  getTitle?: (node: AppMenuNode) => string
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
    const title = options.getTitle?.(node) ?? node.title
    const label = node.isExternal ? (
      <span className="sa-menu-label">
        {title}
        <ExternalLink className="sa-menu-label__external" size={12} />
      </span>
    ) : (
      title
    )

    const base: AntdMenuItem = {
      key: node.path,
      icon: <MenuIcon icon={node.icon} iconPrefix={options.iconPrefix} />,
      label,
      disabled: node.disabled,
    }

    if (node.children.length > 0) {
      return {
        ...base,
        children: buildMenuItems(node.children, options),
      } as AntdMenuItem
    }

    return base
  })
}
