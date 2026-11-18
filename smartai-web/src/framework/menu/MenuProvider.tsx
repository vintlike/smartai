import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { AppMenuItem, MenuSource } from '../types';
import {
  type AntdItemDef,
  findAncestorKeys,
  findFirstLeaf,
  findMenuItem,
  getItemPath,
  resolveSelectedKey,
  resolveTopKey,
  toAntdMenuItems,
} from './MenuUtil';

export interface MenuContextValue {
  /** 原始菜单树 */
  menus: AppMenuItem[];
  /** 菜单是否加载中（接口加载场景） */
  loading: boolean;
  /** 菜单加载错误（接口加载场景） */
  error: Error | null;
  /** 重新加载菜单 */
  refresh: () => void;
  /** 完整菜单（antd 结构） */
  items: AntdItemDef[];
  /** 一级菜单（blend 布局顶部使用） */
  topItems: AntdItemDef[];
  /** blend 布局侧边子菜单：当前激活一级菜单下的子项 */
  activeGroupItems: AntdItemDef[];
  /** 当前路由对应的菜单 key */
  selectedKey: string;
  /** 当前激活的一级菜单 key */
  activeTopKey: string;
  /** 已展开的父级菜单 keys */
  openKeys: string[];
  setOpenKeys: (keys: string[]) => void;
  /** 按菜单 key 跳转（支持外链） */
  navigateByKey: (key: string) => void;
  /** 顶部一级菜单点击：跳转到该分组下第一个可用叶子节点 */
  navigateByTopKey: (key: string) => void;
}

const MenuContext = createContext<MenuContextValue | null>(null);

export interface MenuProviderProps {
  /** 菜单数据源：静态数组或异步函数（接口获取） */
  source: MenuSource;
  children: ReactNode;
}

/**
 * 菜单提供者：负责加载菜单数据、解析当前选中/展开状态、统一跳转行为。
 * 与业务无关，内部依赖 react-router 的当前路由。
 */
export function MenuProvider({ source, children }: MenuProviderProps) {
  const [menus, setMenus] = useState<AppMenuItem[]>(Array.isArray(source) ? source : []);
  const [loading, setLoading] = useState(!Array.isArray(source));
  const [error, setError] = useState<Error | null>(null);
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const requestIdRef = useRef(0);
  const location = useLocation();
  const navigate = useNavigate();

  /** 加载菜单：静态数组直接使用；函数则异步加载（接口获取），并用请求序号丢弃过期响应 */
  const load = useCallback(() => {
    if (Array.isArray(source)) {
      requestIdRef.current += 1;
      setMenus(source);
      setError(null);
      setLoading(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    source()
      .then((data) => {
        if (requestId !== requestIdRef.current) return;
        setMenus(data ?? []);
      })
      .catch((err: unknown) => {
        if (requestId !== requestIdRef.current) return;
        setMenus([]);
        setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (requestId === requestIdRef.current) setLoading(false);
      });
  }, [source]);

  useEffect(() => {
    load();
  }, [load]);

  const selectedKey = useMemo(
    () => resolveSelectedKey(menus, location.pathname),
    [menus, location.pathname],
  );
  const activeTopKey = useMemo(() => resolveTopKey(menus, selectedKey), [menus, selectedKey]);

  /** 路由变化时自动展开当前菜单的所有父级 */
  useEffect(() => {
    if (!selectedKey) return;
    setOpenKeys(findAncestorKeys(menus, selectedKey));
  }, [menus, selectedKey]);

  const navigateToItem = useCallback(
    (item: AppMenuItem) => {
      const path = getItemPath(item);
      if (item.external) {
        window.open(path, '_blank', 'noopener,noreferrer');
        return;
      }
      navigate(path);
    },
    [navigate],
  );

  const navigateByKey = useCallback(
    (key: string) => {
      const item = findMenuItem(menus, key);
      if (item) navigateToItem(item);
    },
    [menus, navigateToItem],
  );

  /** 一级菜单点击：有子菜单时进入其第一个可见叶子，否则跳转自身 */
  const navigateByTopKey = useCallback(
    (key: string) => {
      const item = findMenuItem(menus, key);
      if (!item) return;
      navigateToItem(findFirstLeaf(item) ?? item);
    },
    [menus, navigateToItem],
  );

  const items = useMemo(() => toAntdMenuItems(menus), [menus]);

  /** 一级菜单条：去掉 children，点击后整组切换（blend 布局顶部） */
  const topItems = useMemo(
    () =>
      toAntdMenuItems(menus).map((item) => ({
        key: item.key,
        label: item.label,
        icon: item.icon,
        disabled: item.disabled,
      })),
    [menus],
  );

  /** blend 布局侧边菜单：仅展示当前一级菜单的子项，无子项时展示自身 */
  const activeGroupItems = useMemo(() => {
    if (!activeTopKey) return [];
    const top = findMenuItem(menus, activeTopKey);
    if (!top) return [];
    if (top.children?.length) {
      const visibleChildren = toAntdMenuItems(top.children);
      if (visibleChildren.length > 0) return visibleChildren;
    }
    return [{ key: top.key, label: top.label, icon: top.icon }];
  }, [menus, activeTopKey]);

  const contextValue = useMemo<MenuContextValue>(
    () => ({
      menus,
      loading,
      error,
      refresh: load,
      items,
      topItems,
      activeGroupItems,
      selectedKey,
      activeTopKey,
      openKeys,
      setOpenKeys,
      navigateByKey,
      navigateByTopKey,
    }),
    [
      menus,
      loading,
      error,
      load,
      items,
      topItems,
      activeGroupItems,
      selectedKey,
      activeTopKey,
      openKeys,
      navigateByKey,
      navigateByTopKey,
    ],
  );

  return <MenuContext.Provider value={contextValue}>{children}</MenuContext.Provider>;
}

/** 获取菜单上下文（布局层内部使用） */
export function useMenuContext(): MenuContextValue {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenuContext 必须在 MenuProvider 内使用');
  }
  return context;
}

/** useMenuContext 的别名，兼容早期命名 */
export const useMenu = useMenuContext;
