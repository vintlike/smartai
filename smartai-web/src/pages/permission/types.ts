export interface RoleItem {
  id: string;
  roleName: string;
  roleKey: string;
  roleDesc: string;
  menuPermissions: string[];
}

export interface UserItem {
  id: string;
  username: string;
  realName: string;
  role: string;
  deptName: string;
  status: 0 | 1;
  email: string;
  phone: string;
}

export interface DeptItem {
  id: string;
  deptName: string;
  parentDept: string;
  deptDesc: string;
  children?: DeptItem[];
}

export type MenuType = 'catalog' | 'menu' | 'button';

export interface MenuItem {
  id: string;
  parentId?: string;
  name: string;
  path: string;
  menuType: MenuType;
  component?: string;
  icon?: string;
  order: number;
  perms?: string;
  status: 0 | 1;
  /** 是否外链：点击后以新窗口打开 path */
  external?: boolean;
  /** 是否缓存页面 */
  keepalive?: boolean;
  children?: MenuItem[];
}

export interface MenuPermissionNode {
  key: string;
  title: string;
  children?: MenuPermissionNode[];
}
