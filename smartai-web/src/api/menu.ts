import type { AppMenuItem } from '@/framework';
import { request } from './http';

/** 后端菜单记录（SysMenu） */
export interface BackendMenu {
  id: string;
  name: string;
  parentId?: string | null;
  path?: string;
  perms?: string;
  type: 'catalog' | 'menu' | 'button';
  sortOrder?: number;
  icon?: string;
  component?: string;
  isDisabled?: boolean | number;
  isExternal?: boolean | number;
  isKeepalive?: boolean | number;
  isVisible?: boolean | number;
}

/** 当前登录用户可访问的菜单标识集合 */
export interface MenuAccess {
  paths: Set<string>;
  components: Set<string>;
}

interface MenuListResponse {
  list?: BackendMenu[];
}

/** 拉取当前登录用户有权限的菜单（后端按令牌身份过滤，超管返回全量） */
export async function fetchMenuAccess(): Promise<MenuAccess> {
  const data = await request<BackendMenu[] | MenuListResponse>('/api/sys/menu/current');
  const list = Array.isArray(data) ? data : (data.list ?? []);
  const paths = new Set<string>();
  const components = new Set<string>();
  for (const item of list) {
    if (item.type === 'button') continue;
    if (item.path) paths.add(item.path);
    if (item.component) components.add(item.component);
  }
  return { paths, components };
}

/** 用后端授权结果裁剪本地菜单，保留原有菜单结构与展示文案 */
export function filterMenusByAccess(items: AppMenuItem[], access: MenuAccess): AppMenuItem[] {
  const result: AppMenuItem[] = [];
  for (const item of items) {
    const children = item.children ? filterMenusByAccess(item.children, access) : [];
    const allowed =
      (item.path ? access.paths.has(item.path) : false) ||
      (item.component ? access.components.has(item.component) : false);
    if (allowed || children.length > 0) {
      result.push({ ...item, children: children.length > 0 ? children : undefined });
    }
  }
  return result;
}
