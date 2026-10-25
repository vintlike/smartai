import type { MenuProps } from 'antd';
import { Menu } from 'antd';
import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMenu } from '@/framework/menu/MenuProvider';
import { buildMenuItems } from '@/framework/menu/menuItems';
import { flattenMenuTree } from '@/framework/menu/menuUtils';
import { useMenuTitle } from '@/framework/menu/useMenuTitle';

export interface TopMenuProps {
  /** leaf: 高亮最终页面；top: 混合模式下高亮顶级菜单 */
  highlight?: 'leaf' | 'top';
  className?: string;
}

/** 顶部横向菜单，多级菜单通过下拉展开 */
export function TopMenu({ highlight = 'leaf', className }: TopMenuProps) {
  const { menuTree, getMenuChain } = useMenu();
  const getTitle = useMenuTitle();
  const location = useLocation();
  const navigate = useNavigate();

  const nodeIndex = useMemo(
    () => new Map(flattenMenuTree(menuTree).map((node) => [node.path, node])),
    [menuTree],
  );
  const items = useMemo(() => buildMenuItems(menuTree, { getTitle }), [menuTree, getTitle]);

  const chain = useMemo(() => getMenuChain(location.pathname), [getMenuChain, location.pathname]);
  const selectedKeys = useMemo(() => {
    const target = highlight === 'top' ? chain.at(0) : chain.at(-1);
    return target ? [target.path] : [];
  }, [chain, highlight]);

  const handleClick = useCallback<NonNullable<MenuProps['onClick']>>(
    ({ key }) => {
      const node = nodeIndex.get(key);
      if (!node) return;
      if (node.isExternal) {
        window.open(node.path, '_blank', 'noopener,noreferrer');
        return;
      }
      if (!node.isGroup) navigate(key);
    },
    [nodeIndex, navigate],
  );

  return (
    <Menu
      className={['sa-top-menu', className].filter(Boolean).join(' ')}
      mode="horizontal"
      selectedKeys={selectedKeys}
      items={items}
      onClick={handleClick}
      style={{ borderBottom: 'none' }}
    />
  );
}
