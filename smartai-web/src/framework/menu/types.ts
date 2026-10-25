import type { ReactNode } from 'react';

/** 后端菜单返回结构（与接口保持一致，不做业务假设） */
export interface MenuMeta {
  title: string;
  icon?: string | null;
  /** 可选：i18n key，存在且能命中语言包时优先使用 */
  localeKey?: string;
  /** 可选：是否在菜单中隐藏 */
  hideInMenu?: boolean;
  [key: string]: unknown;
}

export interface MenuItem {
  id: string;
  parentId: string;
  /** 路由 name，用于 keepalive / 权限等场景 */
  name: string;
  /** 路由 path 片段 */
  path: string;
  /** menu / button / ... */
  type: string;
  /** 'Layout' 表示分组节点，其它为页面组件路径，如 '/chat/index' */
  component: string;
  perms?: string;
  meta: MenuMeta;
  orderNo?: number;
  disabled?: boolean;
  /** 是否外链 */
  isExt?: boolean;
  keepalive?: boolean;
  /** 是否展示 */
  show?: boolean;
  children?: MenuItem[];
}

/** 归一化后的菜单节点（框架内部使用） */
export interface AppMenuNode {
  id: string;
  parentId: string;
  name: string;
  /** 完整路径，如 /app/chat；外链时为原始 URL */
  path: string;
  /** 原始 path 片段 */
  rawPath: string;
  type: string;
  component: string;
  perms?: string;
  /** 菜单标题 */
  title: string;
  /** i18n key */
  localeKey?: string;
  /** antd 图标名（原始值，由 menuIconMap 注册表解析） */
  icon?: string | null;
  orderNo: number;
  disabled: boolean;
  isExternal: boolean;
  keepalive: boolean;
  /** 是否分组节点（不渲染页面） */
  isGroup: boolean;
  children: AppMenuNode[];
  /** 上级节点 path 列表，根节点为空 */
  parentPaths: string[];
}

export type MenuRequest = () => Promise<MenuItem[]>;

export interface MenuProviderProps {
  children: ReactNode;
  /** 菜单请求方法，由业务层实现（如 axios / fetch） */
  request: MenuRequest;
  /** 在归一化前对接口数据做一次转换（筛选权限等） */
  transform?: (items: MenuItem[]) => MenuItem[];
}

export interface MenuContextValue {
  loading: boolean;
  error: Error | null;
  /** 原始接口数据 */
  rawMenus: MenuItem[];
  /** 归一化菜单树 */
  menuTree: AppMenuNode[];
  /** 所有可点击的叶子菜单 */
  leaves: AppMenuNode[];
  /** 当前路径所属菜单链（从根到叶子） */
  getMenuChain: (path: string) => AppMenuNode[];
  /** 根据 path 查找菜单节点 */
  getMenuNode: (path: string) => AppMenuNode | undefined;
  /** 第一个可访问的页面路径 */
  firstMenuPath: string;
  refresh: () => Promise<void>;
}
