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
import type { LayoutConfig, MenuMode } from '../types';

/** 移动端视口断点（px） */
export const MOBILE_BREAKPOINT = 768;

/** 读取布尔偏好；无本地偏好时返回 null */
function readStoredFlag(storageKey: string): boolean | null {
  if (typeof window === 'undefined') return null;
  const stored = window.localStorage.getItem(storageKey);
  return stored === null ? null : stored === 'true';
}

/** 读取已持久化的菜单模式 */
function readStoredMenuMode(storageKey: string): MenuMode | null {
  if (typeof window === 'undefined') return null;
  const stored = window.localStorage.getItem(`${storageKey}-menu-mode`);
  return stored === 'vertical' || stored === 'horizontal' || stored === 'blend' ? stored : null;
}

/**
 * 布尔型布局偏好（页签 / 面包屑 / 页脚 / 水印）：
 * 首次取「本地存储 → 配置 → 默认值」；配置值变化时同步并持久化；显式设置时持久化。
 */
function useBooleanPreference(
  storageKey: string,
  configValue: boolean | undefined,
  fallback: boolean,
): readonly [boolean, (next: boolean) => void] {
  const [value, setValue] = useState<boolean>(
    () => readStoredFlag(storageKey) ?? configValue ?? fallback,
  );

  /** 配置变化（忽略首次挂载，保证本地偏好优先） */
  const configRef = useRef(configValue);
  useEffect(() => {
    if (configRef.current === configValue) return;
    configRef.current = configValue;
    const next = configValue ?? fallback;
    setValue(next);
    window.localStorage.setItem(storageKey, String(next));
  }, [configValue, fallback, storageKey]);

  const update = useCallback(
    (next: boolean) => {
      setValue(next);
      window.localStorage.setItem(storageKey, String(next));
    },
    [storageKey],
  );

  return [value, update] as const;
}

export interface LayoutContextValue {
  /** 布局配置（各布局组件通过它读取 logo/title/尺寸等） */
  config: LayoutConfig;
  /** 当前菜单模式：默认取配置值，运行时可切换 */
  menuMode: MenuMode;
  /** 切换菜单模式 */
  setMenuMode: (mode: MenuMode) => void;
  /** 侧边栏是否折叠 */
  collapsed: boolean;
  /** 设置侧边栏折叠状态 */
  setCollapsed: (collapsed: boolean) => void;
  /** 切换侧边栏折叠状态 */
  toggleCollapsed: () => void;
  /** 是否展示多页签导航栏 */
  showTabs: boolean;
  /** 设置多页签导航栏显示状态 */
  setShowTabs: (showTabs: boolean) => void;
  /** 是否展示面包屑 */
  showBreadcrumb: boolean;
  /** 设置面包屑显示状态 */
  setShowBreadcrumb: (show: boolean) => void;
  /** 是否展示页脚 */
  showFooter: boolean;
  /** 设置页脚显示状态 */
  setShowFooter: (show: boolean) => void;
  /** 是否展示内容区水印 */
  showWatermark: boolean;
  /** 设置水印显示状态 */
  setShowWatermark: (show: boolean) => void;
  /** 是否移动端视口 */
  isMobile: boolean;
  /** 移动端抽屉菜单是否打开 */
  mobileMenuOpen: boolean;
  /** 设置移动端抽屉菜单开关 */
  setMobileMenuOpen: (open: boolean) => void;
  /** 页面刷新计数：当前页没有局部刷新订阅者时自增，触发内容区重挂载 */
  refreshKey: number;
  /** 刷新当前页面：优先通知局部刷新订阅者，无人订阅时回退为重挂载 */
  refreshPage: () => void;
  /** 订阅当前页的局部刷新信号，返回取消订阅函数 */
  subscribeRefresh: (listener: () => void) => () => void;
}

const LayoutContext = createContext<LayoutContextValue | null>(null);

export interface AppLayoutProviderProps {
  config: LayoutConfig;
  children: ReactNode;
}

/**
 * 布局状态提供者：维护折叠、菜单模式、页签/面包屑/页脚/水印开关、移动端等纯布局状态。
 * 与业务无关，所有状态均由布局框架内部消费。
 */
export function AppLayoutProvider({ config, children }: AppLayoutProviderProps) {
  const storageKey = config.storageKey ?? 'smartai-web';
  const [menuMode, setMenuModeState] = useState<MenuMode>(
    () => readStoredMenuMode(storageKey) ?? config.menuMode ?? 'vertical',
  );
  const [collapsed, setCollapsedState] = useState(
    () => readStoredFlag(`${storageKey}-collapsed`) ?? false,
  );
  const [showTabs, setShowTabs] = useBooleanPreference(
    `${storageKey}-show-tabs`,
    config.showTabs,
    false,
  );
  const [showBreadcrumb, setShowBreadcrumb] = useBooleanPreference(
    `${storageKey}-show-breadcrumb`,
    config.showBreadcrumb,
    true,
  );
  const [showFooter, setShowFooter] = useBooleanPreference(
    `${storageKey}-show-footer`,
    config.showFooter,
    true,
  );
  const [showWatermark, setShowWatermark] = useBooleanPreference(
    `${storageKey}-show-watermark`,
    config.showWatermark,
    false,
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT,
  );
  const [refreshKey, setRefreshKey] = useState(0);
  const refreshListeners = useRef(new Set<() => void>());

  /** 监听视口宽度变化，维护移动端标记 */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  /** 菜单模式跟随外部配置变化（忽略首次挂载，保证本地偏好优先） */
  const configMenuModeRef = useRef(config.menuMode);
  useEffect(() => {
    if (configMenuModeRef.current === config.menuMode) return;
    configMenuModeRef.current = config.menuMode;
    const next = config.menuMode ?? 'vertical';
    setMenuModeState(next);
    window.localStorage.setItem(`${storageKey}-menu-mode`, next);
  }, [config.menuMode, storageKey]);

  /** 切到移动端时关闭抽屉 */
  useEffect(() => {
    if (isMobile) setMobileMenuOpen(false);
  }, [isMobile]);

  /** 切换菜单模式并持久化 */
  const setMenuMode = useCallback(
    (mode: MenuMode) => {
      setMenuModeState(mode);
      window.localStorage.setItem(`${storageKey}-menu-mode`, mode);
    },
    [storageKey],
  );

  /** 设置折叠状态并持久化 */
  const setCollapsed = useCallback(
    (next: boolean) => {
      setCollapsedState(next);
      window.localStorage.setItem(`${storageKey}-collapsed`, String(next));
    },
    [storageKey],
  );

  const toggleCollapsed = useCallback(() => setCollapsed(!collapsed), [collapsed, setCollapsed]);

  /** 订阅局部刷新：列表页等可保留筛选、列设置等状态，只重新加载数据 */
  const subscribeRefresh = useCallback((listener: () => void) => {
    refreshListeners.current.add(listener);
    return () => {
      refreshListeners.current.delete(listener);
    };
  }, []);

  /** 有订阅者时只通知订阅者；没有订阅者（聊天、门户等）时回退为内容区重挂载 */
  const refreshPage = useCallback(() => {
    if (refreshListeners.current.size > 0) {
      for (const listener of refreshListeners.current) listener();
      return;
    }
    setRefreshKey((value) => value + 1);
  }, []);

  const contextValue = useMemo<LayoutContextValue>(
    () => ({
      config,
      menuMode,
      setMenuMode,
      collapsed,
      setCollapsed,
      toggleCollapsed,
      showTabs,
      setShowTabs,
      showBreadcrumb,
      setShowBreadcrumb,
      showFooter,
      setShowFooter,
      showWatermark,
      setShowWatermark,
      isMobile,
      mobileMenuOpen,
      setMobileMenuOpen,
      refreshKey,
      refreshPage,
      subscribeRefresh,
    }),
    [
      config,
      menuMode,
      setMenuMode,
      collapsed,
      setCollapsed,
      toggleCollapsed,
      showTabs,
      setShowTabs,
      showBreadcrumb,
      setShowBreadcrumb,
      showFooter,
      setShowFooter,
      showWatermark,
      setShowWatermark,
      isMobile,
      mobileMenuOpen,
      refreshKey,
      refreshPage,
      subscribeRefresh,
    ],
  );

  return <LayoutContext.Provider value={contextValue}>{children}</LayoutContext.Provider>;
}

/** 获取布局上下文（必须在 AppLayoutProvider 内使用） */
export function useLayout(): LayoutContextValue {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout 必须在 AppLayoutProvider 内使用');
  }
  return context;
}
