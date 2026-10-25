import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { LogoConfig } from '@/framework/config/logo';
import { defaultLogoConfig } from '@/framework/config/logo';
import type { LayoutSettings } from '@/framework/config/settings';
import { defaultLayoutSettings, defaultStorageKeys } from '@/framework/config/settings';
import type { LayoutMode } from '@/framework/config/theme';
import { usePersistentState } from '@/framework/utils/usePersistentState';

export interface TabItem {
  key: string;
  path: string;
  title: string;
  closable: boolean;
}

export interface LayoutProviderProps {
  children: ReactNode;
  /** Logo 配置，框架只负责渲染 */
  logo?: LogoConfig;
  /** 覆盖默认布局设置 */
  defaultSettings?: Partial<LayoutSettings>;
  storageKey?: string;
  onSettingsChange?: (settings: LayoutSettings) => void;
}

export interface LayoutContextValue {
  settings: LayoutSettings;
  logo: LogoConfig;
  /** 实际生效的收起状态（含响应式自动收起） */
  collapsed: boolean;
  tabs: TabItem[];
  activeKey: string;
  updateSettings: (patch: Partial<LayoutSettings>) => void;
  resetSettings: () => void;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
  /** 响应式自动收起，不写入持久化设置 */
  setResponsiveCollapsed: (collapsed: boolean) => void;
  setLayoutMode: (mode: LayoutMode) => void;
  settingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  toggleSettings: () => void;
  addTab: (tab: TabItem) => void;
  closeTab: (key: string) => void;
  closeOtherTabs: (key: string) => void;
  closeAllTabs: () => void;
  /** 关闭指定 Tab 左侧的可关闭 Tab */
  closeLeftTabs: (key: string) => void;
  /** 关闭指定 Tab 右侧的可关闭 Tab */
  closeRightTabs: (key: string) => void;
  /** 刷新指定 Tab（缺省为当前页），通过变更 refreshToken 重挂载页面 */
  refreshTab: (key?: string) => void;
  refreshToken: number;
}

const LayoutContext = createContext<LayoutContextValue | null>(null);

/**
 * 布局状态提供者：菜单模式、侧边栏收起、多 Tab、设置抽屉。
 * 注意：需要放在 react-router 的 Router 内部（依赖 useLocation / useNavigate）。
 */
export function LayoutProvider({
  children,
  logo,
  defaultSettings,
  storageKey = defaultStorageKeys.layout,
  onSettingsChange,
}: LayoutProviderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tabs, setTabs] = useState<TabItem[]>([]);
  const [responsiveCollapsed, setResponsiveCollapsed] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);

  const defaults = useMemo<LayoutSettings>(
    () => ({ ...defaultLayoutSettings, ...defaultSettings }),
    [defaultSettings],
  );
  const [stored, updateStored] = usePersistentState<LayoutSettings>(storageKey, defaults);
  const settings = useMemo<LayoutSettings>(() => ({ ...defaults, ...stored }), [defaults, stored]);

  const updateSettings = useCallback(
    (patch: Partial<LayoutSettings>) => {
      updateStored(patch);
      onSettingsChange?.({ ...settings, ...patch });
    },
    [updateStored, settings, onSettingsChange],
  );

  const resetSettings = useCallback(() => {
    updateStored(defaults);
    onSettingsChange?.(defaults);
  }, [updateStored, defaults, onSettingsChange]);

  const setLayoutMode = useCallback(
    (layoutMode: LayoutMode) => {
      updateSettings({ layoutMode });
    },
    [updateSettings],
  );
  const addTab = useCallback((tab: TabItem) => {
    setTabs((prev) => (prev.some((item) => item.key === tab.key) ? prev : [...prev, tab]));
  }, []);

  const closeTab = useCallback(
    (key: string) => {
      const index = tabs.findIndex((tab) => tab.key === key);
      if (index === -1) return;
      const nextTabs = tabs.filter((tab) => tab.key !== key);
      setTabs(nextTabs);
      if (location.pathname === key) {
        const fallback = nextTabs[index] ?? nextTabs[index - 1];
        navigate(fallback ? fallback.path : '/');
      }
    },
    [tabs, location.pathname, navigate],
  );

  const closeOtherTabs = useCallback(
    (key: string) => {
      setTabs((prev) => prev.filter((tab) => tab.key === key || !tab.closable));
      if (location.pathname !== key) navigate(key);
    },
    [location.pathname, navigate],
  );

  const closeAllTabs = useCallback(() => {
    setTabs((prev) => prev.filter((tab) => !tab.closable));
    navigate('/');
  }, [navigate]);

  const closeLeftTabs = useCallback(
    (key: string) => {
      const index = tabs.findIndex((tab) => tab.key === key);
      if (index <= 0) return;
      const nextTabs = tabs.filter((tab, i) => i >= index || !tab.closable);
      setTabs(nextTabs);
      if (!nextTabs.some((tab) => tab.key === location.pathname)) navigate(key);
    },
    [tabs, location.pathname, navigate],
  );

  const closeRightTabs = useCallback(
    (key: string) => {
      const index = tabs.findIndex((tab) => tab.key === key);
      if (index === -1) return;
      const nextTabs = tabs.filter((tab, i) => i <= index || !tab.closable);
      setTabs(nextTabs);
      if (!nextTabs.some((tab) => tab.key === location.pathname)) navigate(key);
    },
    [tabs, location.pathname, navigate],
  );

  const refreshTab = useCallback(
    (key?: string) => {
      const target = key ?? location.pathname;
      if (target !== location.pathname) navigate(target);
      setRefreshToken((token) => token + 1);
    },
    [location.pathname, navigate],
  );

  const collapsed = settings.collapsed || responsiveCollapsed;

  const setCollapsed = useCallback(
    (next: boolean) => {
      setResponsiveCollapsed(false);
      updateSettings({ collapsed: next });
    },
    [updateSettings],
  );

  const toggleCollapsed = useCallback(() => {
    setCollapsed(!(settings.collapsed || responsiveCollapsed));
  }, [setCollapsed, settings.collapsed, responsiveCollapsed]);

  const value = useMemo<LayoutContextValue>(
    () => ({
      settings,
      logo: { ...defaultLogoConfig, ...logo },
      collapsed,
      tabs,
      activeKey: location.pathname,
      updateSettings,
      resetSettings,
      setCollapsed,
      toggleCollapsed,
      setResponsiveCollapsed,
      setLayoutMode,
      settingsOpen,
      openSettings: () => setSettingsOpen(true),
      closeSettings: () => setSettingsOpen(false),
      toggleSettings: () => setSettingsOpen((open) => !open),
      addTab,
      closeTab,
      closeOtherTabs,
      closeAllTabs,
      closeLeftTabs,
      closeRightTabs,
      refreshTab,
      refreshToken,
    }),
    [
      settings,
      logo,
      collapsed,
      tabs,
      location.pathname,
      updateSettings,
      resetSettings,
      setCollapsed,
      toggleCollapsed,
      setLayoutMode,
      settingsOpen,
      addTab,
      closeTab,
      closeOtherTabs,
      closeAllTabs,
      closeLeftTabs,
      closeRightTabs,
      refreshTab,
      refreshToken,
    ],
  );

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
}

export function useLayout(): LayoutContextValue {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout 必须在 <LayoutProvider> 内部使用');
  }
  return context;
}
