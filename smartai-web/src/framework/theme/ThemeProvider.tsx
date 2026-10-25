import type { ThemeConfig } from 'antd';
import { theme as antdTheme, ConfigProvider } from 'antd';
import type { Locale } from 'antd/es/locale';
import enUS from 'antd/locale/en_US';
import zhCN from 'antd/locale/zh_CN';
import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import type { ThemeSettings } from '../config/settings';
import { defaultHeaderHeight, defaultStorageKeys, defaultThemeSettings } from '../config/settings';
import type { ThemeMode, ThemeToken } from '../config/theme';
import { themeTokens } from '../config/theme';
import { useI18n } from '../i18n/I18nProvider';
import { usePersistentState } from '../utils/usePersistentState';

const antdLocales: Record<string, Locale> = {
  'zh-CN': zhCN,
  'en-US': enUS,
};

/** 将 `滑块颜色 轨道颜色` 拆分为两段，只传一个颜色时轨道透明 */
function resolveScrollbarColors(scrollbarColor: string): [string, string] {
  const [thumb, track] = scrollbarColor.trim().split(/\s+/);
  return [thumb ?? 'transparent', track ?? 'transparent'];
}

export interface ThemeProviderProps {
  children: ReactNode;
  /** 覆盖默认主题设置 */
  defaultSettings?: Partial<ThemeSettings>;
  storageKey?: string;
  onThemeChange?: (settings: ThemeSettings) => void;
}

export interface ThemeContextValue {
  settings: ThemeSettings;
  mode: ThemeMode;
  colorPrimary: string;
  /** 当前主题对应的设计 Token */
  themeToken: ThemeToken;
  setMode: (mode: ThemeMode) => void;
  setColorPrimary: (color: string) => void;
  toggleMode: () => void;
  reset: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  children,
  defaultSettings,
  storageKey = defaultStorageKeys.theme,
  onThemeChange,
}: ThemeProviderProps) {
  const { locale } = useI18n();
  const defaults = useMemo<ThemeSettings>(
    () => ({ ...defaultThemeSettings, ...defaultSettings }),
    [defaultSettings],
  );
  const [stored, updateSettings] = usePersistentState<ThemeSettings>(storageKey, defaults);
  const settings = useMemo<ThemeSettings>(() => ({ ...defaults, ...stored }), [defaults, stored]);
  const activeToken = themeTokens[settings.mode];

  const setMode = useCallback(
    (mode: ThemeMode) => {
      updateSettings({ mode });
      onThemeChange?.({ ...settings, mode });
    },
    [updateSettings, onThemeChange, settings],
  );

  const setColorPrimary = useCallback(
    (colorPrimary: string) => {
      updateSettings({ colorPrimary });
      onThemeChange?.({ ...settings, colorPrimary });
    },
    [updateSettings, onThemeChange, settings],
  );

  const toggleMode = useCallback(() => {
    setMode(settings.mode === 'dark' ? 'light' : 'dark');
  }, [setMode, settings.mode]);

  const reset = useCallback(() => {
    updateSettings(defaults);
    onThemeChange?.(defaults);
  }, [updateSettings, defaults, onThemeChange]);

  const themeConfig = useMemo<ThemeConfig>(
    () => ({
      algorithm: settings.mode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      token: {
        colorPrimary: settings.colorPrimary,
        colorInfo: settings.colorPrimary,
        colorLink: settings.colorPrimary,
        borderRadius: 8,
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
        colorBgLayout: activeToken.colorBgLayout,
        colorBgContainer: activeToken.colorBgContainer,
        colorBgElevated: activeToken.colorBgElevated ?? activeToken.colorBgContainer,
        colorBorder: activeToken.colorBorder,
        colorBorderSecondary: activeToken.colorBorderSecondary,
        colorSplit: activeToken.colorSplit,
      },
      components: {
        Layout: {
          headerHeight: defaultHeaderHeight,
          headerPadding: '0 16px',
        },
        // 暗色下 colorBgLayout 与 colorBgElevated 同为 #010e1a，选中块需用容器色才能辨识
        Segmented: {
          trackBg: activeToken.colorBgLayout,
          itemSelectedBg: activeToken.colorBgContainer,
        },
      },
    }),
    [settings.mode, settings.colorPrimary, activeToken],
  );

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = settings.mode;
    root.style.colorScheme = settings.mode;
    root.style.setProperty('--sa-color-primary', settings.colorPrimary);
    root.style.setProperty('--sa-color-bg-layout', activeToken.colorBgLayout);
    root.style.setProperty('--sa-color-bg-container', activeToken.colorBgContainer);
    root.style.setProperty(
      '--sa-color-bg-elevated',
      activeToken.colorBgElevated ?? activeToken.colorBgContainer,
    );
    root.style.setProperty('--sa-color-border', activeToken.colorBorder);
    root.style.setProperty('--sa-color-border-secondary', activeToken.colorBorderSecondary);

    const [thumb, track] = resolveScrollbarColors(activeToken.scrollbarColor);
    root.style.setProperty('--sa-scrollbar-thumb', thumb);
    root.style.setProperty('--sa-scrollbar-track', track);
    root.style.setProperty('--sa-scrollbar-width', activeToken.scrollbarWidth ?? 'auto');
    root.style.setProperty('--sa-scrollbar-gutter', activeToken.scrollbarGutter ?? 'auto');
  }, [settings.mode, settings.colorPrimary, activeToken]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      settings,
      mode: settings.mode,
      colorPrimary: settings.colorPrimary,
      themeToken: activeToken,
      setMode,
      setColorPrimary,
      toggleMode,
      reset,
    }),
    [settings, activeToken, setMode, setColorPrimary, toggleMode, reset],
  );

  return (
    <ThemeContext.Provider value={value}>
      <ConfigProvider theme={themeConfig} locale={antdLocales[locale] ?? zhCN}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme 必须在 <ThemeProvider> 内部使用');
  }
  return context;
}
