import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import type { LayoutMode } from '@/framework/config/theme';
import { useLayout } from '@/framework/layout/LayoutProvider';
import { useMenu } from '@/framework/menu/MenuProvider';
import type { AppMenuNode } from '@/framework/menu/types';

export interface LayoutSiderState {
  /** 当前菜单模式 */
  layoutMode: LayoutMode;
  /** 当前路径命中的菜单链（根 → 当前节点） */
  chain: AppMenuNode[];
  /** 侧栏渲染的菜单节点 */
  nodes: AppMenuNode[];
  /** 是否渲染侧栏，同时决定顶栏是否显示收起/展开按钮 */
  visible: boolean;
}

/**
 * 侧栏与菜单模式的联动派生状态：
 * - vertical：渲染整棵菜单树
 * - blend：渲染当前一级菜单的子项；一级菜单本身没有子项时只渲染它自己，保证侧栏不消失
 * - horizontal：不渲染侧栏
 */
export function useLayoutSider(): LayoutSiderState {
  const { settings } = useLayout();
  const { menuTree, getMenuChain } = useMenu();
  const location = useLocation();
  const { layoutMode } = settings;

  return useMemo<LayoutSiderState>(() => {
    const chain = getMenuChain(location.pathname);

    if (layoutMode === 'horizontal') {
      return { layoutMode, chain, nodes: [], visible: false };
    }

    if (layoutMode === 'vertical') {
      return { layoutMode, chain, nodes: menuTree, visible: menuTree.length > 0 };
    }

    const top = chain[0];
    const nodes = top ? (top.children.length > 0 ? top.children : [top]) : menuTree;
    return { layoutMode, chain, nodes, visible: nodes.length > 0 };
  }, [getMenuChain, layoutMode, location.pathname, menuTree]);
}
