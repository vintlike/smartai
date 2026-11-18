import type { ReactNode } from 'react';
import type { AppMenuItem } from '../types';

/** 转换后的 antd 菜单项结构（布局层内部使用） */
export interface AntdItemDef {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  children?: AntdItemDef[];
}

/** 深度优先展平菜单树 */
export function flattenMenu(items: AppMenuItem[]): AppMenuItem[] {
  const result: AppMenuItem[] = [];
  const walk = (list: AppMenuItem[]) => {
    for (const item of list) {
      result.push(item);
      if (item.children?.length) walk(item.children);
    }
  };
  walk(items);
  return result;
}

/** 菜单项最终跳转路径（缺省使用 key） */
export function getItemPath(item: AppMenuItem): string {
  return item.path ?? item.key;
}

/** 按 key 查找菜单项（深度优先） */
export function findMenuItem(items: AppMenuItem[], key: string): AppMenuItem | undefined {
  for (const item of items) {
    if (item.key === key) return item;
    if (item.children?.length) {
      const found = findMenuItem(item.children, key);
      if (found) return found;
    }
  }
  return undefined;
}

/** 查找指定 key 的所有祖先 key（自顶向下，用于自动展开父级菜单） */
export function findAncestorKeys(
  items: AppMenuItem[],
  key: string,
  parents: string[] = [],
): string[] {
  for (const item of items) {
    if (item.key === key) return parents;
    if (item.children?.length) {
      const found = findAncestorKeys(item.children, key, [...parents, item.key]);
      if (found.length > 0) return found;
    }
  }
  return [];
}

/** 查找节点下第一个可见叶子节点（用于 blend 布局顶部一级菜单点击跳转） */
export function findFirstLeaf(item: AppMenuItem): AppMenuItem | undefined {
  if (item.children?.length) {
    for (const child of item.children) {
      if (child.hidden) continue;
      const leaf = findFirstLeaf(child);
      if (leaf) return leaf;
    }
    /** 子项全部隐藏时，自身挂载了页面组件则仍可作为跳转目标 */
    return item.component ? item : undefined;
  }
  return item;
}

/** 隐藏菜单项在树中最近的可见叶子祖先 key（详情页高亮归属推导） */
function findVisibleLeafAncestorKey(items: AppMenuItem[], key: string): string | undefined {
  const ancestorKeys = findAncestorKeys(items, key);
  for (let index = ancestorKeys.length - 1; index >= 0; index--) {
    const ancestor = findMenuItem(items, ancestorKeys[index]);
    if (!ancestor || ancestor.hidden) continue;
    const visibleChildren = ancestor.children?.filter((child) => !child.hidden && !child.external);
    if (!visibleChildren?.length) return ancestor.key;
  }
  return undefined;
}

/** 含动态段（:param）的菜单路径转为精确匹配正则 */
function pathToPattern(path: string): RegExp {
  const pattern = path
    .split('/')
    .map((segment) =>
      segment.startsWith(':') ? '[^/]+' : segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
    )
    .join('/');
  return new RegExp(`^${pattern}$`);
}

/**
 * 当前 pathname 对应的最深菜单 key（用于菜单高亮）。
 * 匹配顺序：精确路径 → 动态段路径（hidden 详情路由向上找最近的可见叶子祖先）→ 最长前缀。
 */
export function resolveSelectedKey(items: AppMenuItem[], pathname: string): string {
  const nodes = flattenMenu(items).filter((item) => !item.external);
  const exact = nodes.find((item) => getItemPath(item) === pathname);
  if (exact) return exact.key;

  /** 动态段路径（如 /aigc-app/config/:appId）：可见项高亮自身，隐藏详情页高亮其归属的祖先菜单 */
  const dynamic = nodes.find((item) => {
    const path = getItemPath(item);
    return path.includes(':') && pathToPattern(path).test(pathname);
  });
  if (dynamic) {
    if (!dynamic.hidden) return dynamic.key;
    const ancestorKey = findVisibleLeafAncestorKey(items, dynamic.key);
    if (ancestorKey) return ancestorKey;
  }

  let bestKey = '';
  let bestLength = -1;
  for (const node of nodes) {
    const path = getItemPath(node);
    if (!path.startsWith('/')) continue;
    if (pathname === path || pathname.startsWith(path.endsWith('/') ? path : `${path}/`)) {
      if (path.length > bestLength) {
        bestKey = node.key;
        bestLength = path.length;
      }
    }
  }
  return bestKey;
}

/** 指定 key 所属的一级菜单 key（blend 布局顶部激活项） */
export function resolveTopKey(items: AppMenuItem[], key: string): string {
  if (!key) return '';
  for (const item of items) {
    if (item.key === key) return item.key;
    if (item.children?.length && findMenuItem(item.children, key)) return item.key;
  }
  return '';
}

/**
 * 当前路由对应的菜单链路（祖先 + 当前项），供面包屑使用。
 * 动态段（如 /aigc-app/config/:appId）会回退到最近可见祖先。
 */
export function resolveMenuChain(items: AppMenuItem[], pathname: string): AppMenuItem[] {
  const key = resolveSelectedKey(items, pathname);
  const current = findMenuItem(items, key);
  if (!current) return [];
  const ancestors = findAncestorKeys(items, key)
    .map((ancestorKey) => findMenuItem(items, ancestorKey))
    .filter((node): node is AppMenuItem => Boolean(node));
  return [...ancestors, current];
}

/**
 * 路由路径对应的标签标题：精确路径 → 动态段路径（如 hidden 详情菜单）→ 回退路径本身。
 * 用于多页签标题解析，实时读取菜单 label，菜单文案变更后自动同步。
 */
export function resolveTabTitle(items: AppMenuItem[], pathname: string): ReactNode {
  const nodes = flattenMenu(items).filter((item) => !item.external);
  const exact = nodes.find((item) => getItemPath(item) === pathname);
  if (exact) return exact.label;
  for (const node of nodes) {
    const path = getItemPath(node);
    if (path.includes(':') && pathToPattern(path).test(pathname)) return node.label;
  }
  return pathname;
}

/** 转换为 antd 菜单结构（过滤 hidden 节点与空分组） */
export function toAntdMenuItems(items: AppMenuItem[]): AntdItemDef[] {
  return items
    .filter((item) => !item.hidden)
    .map((item) => {
      const children = item.children?.length ? toAntdMenuItems(item.children) : undefined;
      return {
        key: item.key,
        label: item.label,
        icon: item.icon,
        disabled: item.disabled,
        children: children && children.length > 0 ? children : undefined,
      };
    });
}
