import type { AppMenuNode, MenuItem } from '@/framework/menu/types';
import { isExternalPath, joinPath, matchMenuPath } from '@/framework/utils/path';

/** 兼容「扁平列表」与「嵌套 children」两种接口返回 */
function toMenuTree(items: MenuItem[]): MenuItem[] {
  const hasNested = items.some((item) => Array.isArray(item.children) && item.children.length > 0);
  if (hasNested) return items;

  const map = new Map<string, MenuItem>();
  for (const item of items) {
    map.set(item.id, { ...item, children: [] });
  }

  const roots: MenuItem[] = [];
  for (const item of map.values()) {
    const parent = item.parentId && item.parentId !== '0' ? map.get(item.parentId) : undefined;
    if (parent) {
      parent.children = [...(parent.children ?? []), item];
    } else {
      roots.push(item);
    }
  }
  return roots;
}

function normalizeNodes(items: MenuItem[], parentPaths: string[]): AppMenuNode[] {
  return items
    .filter((item) => {
      if (item.type === 'button') return false;
      if (item.show === false) return false;
      if (item.meta?.hideInMenu === true) return false;
      return true;
    })
    .sort((a, b) => (a.orderNo ?? 0) - (b.orderNo ?? 0))
    .map((item) => {
      const parentPath = parentPaths[parentPaths.length - 1] ?? '';
      const isExternal = item.isExt === true || isExternalPath(item.path);
      const path = isExternal ? item.path : joinPath(parentPath, item.path);
      const nodeParentPaths = isExternal ? parentPaths : [...parentPaths, path];
      const children = item.children?.length ? normalizeNodes(item.children, nodeParentPaths) : [];
      const isGroup = children.length > 0 || item.component === 'Layout' || !item.component;

      const node: AppMenuNode = {
        id: item.id,
        parentId: item.parentId,
        name: item.name,
        path,
        rawPath: item.path,
        type: item.type,
        component: item.component,
        perms: item.perms,
        title: item.meta?.title ?? item.name,
        localeKey: item.meta?.localeKey,
        icon: item.meta?.icon,
        orderNo: item.orderNo ?? 0,
        disabled: item.disabled === true,
        isExternal,
        keepalive: item.keepalive === true,
        isGroup,
        children,
        parentPaths,
      };
      return node;
    })
    .filter((node) => !(node.isGroup && node.children.length === 0 && node.component === 'Layout'));
}

/** 将接口菜单归一化为框架菜单树（补全完整路径、排序、过滤按钮） */
export function normalizeMenuTree(items: MenuItem[]): AppMenuNode[] {
  return normalizeNodes(toMenuTree(items), []);
}

/** 深度优先拍平菜单树 */
export function flattenMenuTree(tree: AppMenuNode[]): AppMenuNode[] {
  const result: AppMenuNode[] = [];
  const walk = (nodes: AppMenuNode[]) => {
    for (const node of nodes) {
      result.push(node);
      if (node.children.length) walk(node.children);
    }
  };
  walk(tree);
  return result;
}

/** 可访问的页面节点（排除分组与外链） */
export function getMenuLeaves(tree: AppMenuNode[]): AppMenuNode[] {
  return flattenMenuTree(tree).filter(
    (node) => !node.isGroup && !node.isExternal && !node.disabled,
  );
}

/** 找到当前路径命中的最长菜单链（用于菜单高亮、面包屑、Tab 标题） */
export function findMenuChain(tree: AppMenuNode[], pathname: string): AppMenuNode[] {
  let best: AppMenuNode[] = [];

  const walk = (nodes: AppMenuNode[], parents: AppMenuNode[]) => {
    for (const node of nodes) {
      const chain = [...parents, node];
      if (!node.isGroup && !node.isExternal && matchMenuPath(node.path, pathname)) {
        const current = best[best.length - 1];
        if (!current || node.path.length > current.path.length) {
          best = chain;
        }
      }
      if (node.children.length) walk(node.children, chain);
    }
  };

  walk(tree, []);
  return best;
}

/** 当前路径所属的顶级菜单 */
export function findTopMenuNode(tree: AppMenuNode[], pathname: string): AppMenuNode | undefined {
  const chain = findMenuChain(tree, pathname);
  return chain[0];
}

/** 当前路径需要在菜单中展开的父级 key */
export function getOpenKeysByPath(tree: AppMenuNode[], pathname: string): string[] {
  const chain = findMenuChain(tree, pathname);
  return chain.slice(0, -1).map((node) => node.path);
}

/** 首个可访问页面，用作默认首页 */
export function getFirstMenuPath(tree: AppMenuNode[]): string {
  return getMenuLeaves(tree)[0]?.path ?? '/';
}

/** 构建菜单树中所有节点（含路径）的索引 */
export function createMenuIndex(tree: AppMenuNode[]): Map<string, AppMenuNode> {
  return new Map(flattenMenuTree(tree).map((node) => [node.path, node]));
}
