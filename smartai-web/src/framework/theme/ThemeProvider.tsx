import { theme as antdTheme, ConfigProvider } from 'antd';
import enUS from 'antd/locale/en_US';
import zhCN from 'antd/locale/zh_CN';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useI18n } from '../i18n/I18nProvider';
import type { ThemeMode } from '../types';
import { colorPrimary as defaultColorPrimary, uiColors } from './colors';
import { darkThemeTokens, lightThemeTokens } from './tokens';

export interface ThemeContextValue {
  /** 当前主题模式 */
  themeMode: ThemeMode;
  /** 是否为深色模式 */
  isDark: boolean;
  /** 设置主题模式（持久化到本地存储） */
  setThemeMode: (mode: ThemeMode) => void;
  /** 切换浅色/深色 */
  toggleTheme: () => void;
  /** 当前主题色 */
  themeColor: string;
  /** 设置主题色（持久化到本地存储） */
  setThemeColor: (color: string) => void;
  /** 灰色模式（整站灰度滤镜，不持久化） */
  greyMode: boolean;
  /** 设置灰色模式 */
  setGreyMode: (enabled: boolean) => void;
  /** 色弱模式（整站反色滤镜，不持久化） */
  weakMode: boolean;
  /** 设置色弱模式 */
  setWeakMode: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** 读取本地存储的主题偏好 */
function readStoredMode(storageKey: string): ThemeMode | null {
  if (typeof window === 'undefined') return null;
  const stored = window.localStorage.getItem(`${storageKey}-theme`);
  return stored === 'dark' || stored === 'light' ? stored : null;
}

/** 读取本地存储的主题色偏好 */
function readStoredColor(storageKey: string): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(`${storageKey}-color`);
}

export interface ThemeProviderProps {
  children: ReactNode;
  /** 默认主题，本地无偏好时生效 */
  defaultMode?: ThemeMode;
  /** 默认主题色，本地无偏好时生效 */
  colorPrimary?: string;
  /** 本地存储 key */
  storageKey?: string;
}

/**
 * 主题提供者：管理浅色/深色主题并注入 antd ConfigProvider。
 * 与业务完全无关，任何项目均可直接复用。
 */
export function ThemeProvider({
  children,
  defaultMode = 'light',
  colorPrimary = defaultColorPrimary,
  storageKey = 'smartai-web',
}: ThemeProviderProps) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(
    () => readStoredMode(storageKey) ?? defaultMode,
  );
  const [themeColor, setThemeColorState] = useState<string>(
    () => readStoredColor(storageKey) ?? colorPrimary,
  );
  const [greyMode, setGreyMode] = useState(false);
  const [weakMode, setWeakMode] = useState(false);

  const setThemeMode = useCallback(
    (mode: ThemeMode) => {
      setThemeModeState(mode);
      window.localStorage.setItem(`${storageKey}-theme`, mode);
    },
    [storageKey],
  );

  const toggleTheme = useCallback(() => {
    setThemeMode(themeMode === 'dark' ? 'light' : 'dark');
  }, [themeMode, setThemeMode]);

  const setThemeColor = useCallback(
    (color: string) => {
      setThemeColorState(color);
      window.localStorage.setItem(`${storageKey}-color`, color);
    },
    [storageKey],
  );

  const isDark = themeMode === 'dark';
  /** antd 组件内置文案跟随界面语言 */
  const { locale } = useI18n();

  /** 同步 data-theme 到 html，便于自定义样式按主题取值 */
  useEffect(() => {
    document.documentElement.dataset.theme = themeMode;
  }, [themeMode]);

  /** 灰色 / 色弱模式：以 html class 承载整站滤镜（样式见 layout/styles.less） */
  useEffect(() => {
    document.documentElement.classList.toggle('app-grey', greyMode);
  }, [greyMode]);
  useEffect(() => {
    document.documentElement.classList.toggle('app-weakness', weakMode);
  }, [weakMode]);

  const contextValue = useMemo<ThemeContextValue>(
    () => ({
      themeMode,
      isDark,
      setThemeMode,
      toggleTheme,
      themeColor,
      setThemeColor,
      greyMode,
      setGreyMode,
      weakMode,
      setWeakMode,
    }),
    [themeMode, isDark, setThemeMode, toggleTheme, themeColor, setThemeColor, greyMode, weakMode],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <ConfigProvider
        locale={locale === 'en-US' ? enUS : zhCN}
        theme={{
          algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
          token: {
            colorPrimary: themeColor,
            /** 链接色跟随主题色 */
            colorLink: themeColor,
            /** 功能色（设计规范色卡） */
            ...uiColors,
            /** 亮/暗主题专属 Token */
            ...(isDark ? darkThemeTokens : lightThemeTokens),
          },
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}

/** 获取主题上下文（必须在 ThemeProvider 内使用） */
export function useThemeMode(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode 必须在 ThemeProvider 内使用');
  }
  return context;
}
