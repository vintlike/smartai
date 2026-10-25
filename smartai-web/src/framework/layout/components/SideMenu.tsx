import type { MenuProps } from 'antd';
import { Menu } from 'antd';
import { useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMenu } from '../../menu/MenuProvider';
import { buildMenuItems } from '../../menu/menuItems';
import { flattenMenuTree } from '../../menu/menuUtils';
import type { AppMenuNode } from '../../menu/types';
import { useMenuTitle } from '../../menu/useMenuTitle';

export interface SideMenuProps {
  nodes: AppMenuNode[];
  collapsed: boolean;
}

/** 侧边内联菜单：自动展开并高亮当前路径的父级菜单 */
export function SideMenu({ nodes, collapsed }: SideMenuProps) {
  const { iconPrefix, getMenuChain } = useMenu();
  const getTitle = useMenuTitle();
  const location = useLocation();
  const navigate = useNavigate();
  const [manualOpenKeys, setManualOpenKeys] = useState<string[]>([]);

  const flatNodes = useMemo(() => flattenMenuTree(nodes), [nodes]);
  const nodeIndex = useMemo(() => new Map(flatNodes.map((node) => [node.path, node])), [flatNodes]);
  const nodePaths = useMemo(() => new Set(flatNodes.map((node) => node.path)), [flatNodes]);

  const chain = getMenuChain(location.pathname);
  const selectedKeys = chain.length > 0 ? [chain[chain.length - 1]?.path] : [location.pathname];
  const activeOpenKeys = chain
    .slice(0, -1)
    .map((node) => node.path)
    .filter((path) => nodePaths.has(path));

  const openKeys = collapsed
    ? []
    : Array.from(
        new Set([...activeOpenKeys, ...manualOpenKeys.filter((key) => nodePaths.has(key))]),
      );

  const items = useMemo(
    () => buildMenuItems(nodes, { iconPrefix, getTitle }),
    [nodes, iconPrefix, getTitle],
  );

  const handleClick = useCallback<NonNullable<MenuProps['onClick']>>(
    ({ key }) => {
      const node = nodeIndex.get(key);
      if (node?.isExternal) {
        window.open(node.path, '_blank', 'noopener,noreferrer');
        return;
      }
      navigate(key);
    },
    [nodeIndex, navigate],
  );

  return (
    <Menu
      className="sa-menu"
      mode="inline"
      inlineCollapsed={collapsed}
      selectedKeys={selectedKeys}
      openKeys={openKeys}
      onOpenChange={(keys) => setManualOpenKeys(keys as string[])}
      items={items}
      onClick={handleClick}
      style={{ borderInlineEnd: 'none' }}
    />
  );
}
