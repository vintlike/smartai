import {
  AppstoreOutlined,
  CommentOutlined,
  CreditCardOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  KeyOutlined,
  PartitionOutlined,
  PictureOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { createElement, type ReactNode } from 'react';
import type { AppMenuItem } from '@/framework';
import { request } from './http';

export interface SysMenu {
  id: number;
  name: string;
  parentId?: number | null;
  path?: string;
  perms?: string;
  type: 'catalog' | 'menu' | 'button' | 'btn';
  orderNo: number;
  icon?: string;
  component?: string;
  isDisabled?: number;
  isExt?: number;
  isKeepalive?: number;
  isShow?: number;
}

export const iconMap: Record<string, ReactNode> = {
  dashboard: createElement(DashboardOutlined),
  appstore: createElement(AppstoreOutlined),
  comment: createElement(CommentOutlined),
  database: createElement(DatabaseOutlined),
  folder: createElement(FolderOpenOutlined),
  creditCard: createElement(CreditCardOutlined),
  team: createElement(TeamOutlined),
  user: createElement(UserOutlined),
  key: createElement(KeyOutlined),
  setting: createElement(SettingOutlined),
  fileText: createElement(FileTextOutlined),
  picture: createElement(PictureOutlined),
  partition: createElement(PartitionOutlined),
};

export function toMenuItem(menu: SysMenu): AppMenuItem {
  return {
    key: menu.path ?? String(menu.id),
    path: menu.path,
    label: menu.name,
    icon: menu.icon ? iconMap[menu.icon] : undefined,
    component: menu.component,
    hidden: menu.isShow === 0,
    disabled: menu.isDisabled === 1,
    external: menu.isExt === 1,
  };
}

export function toMenuTree(list: SysMenu[], parentId: number | null = null): AppMenuItem[] {
  return list
    .filter((item) => item.type !== 'button' && item.type !== 'btn')
    .filter((item) => (item.parentId ?? null) === parentId)
    .sort((a, b) => a.orderNo - b.orderNo)
    .map((item) => {
      const menu = toMenuItem(item);
      const children = toMenuTree(list, item.id);
      return children.length > 0 ? { ...menu, children } : menu;
    });
}

/**
 * 菜单接口地址：VITE_MENU_API 为空时使用默认地址（dev 下走 mock）；
 * 设为 'mock' 同样走默认 mock 地址，设为其他值则视为真实接口地址。
 */
export function getMenuEndpoint(): string {
  const configured = import.meta.env.VITE_MENU_API;
  return configured && configured !== 'mock' ? configured : '/api/sys/menu';
}

/** 拉取菜单树：兼容后端直接返回数组与分页结构 { list, total } 两种形式 */
export async function fetchMenus(): Promise<AppMenuItem[]> {
  const data = await request<SysMenu[] | { list?: SysMenu[]; total?: number }>(getMenuEndpoint(), {
    params: { pageSize: 999 },
  });
  const list = Array.isArray(data) ? data : (data.list ?? []);
  return toMenuTree(list);
}
