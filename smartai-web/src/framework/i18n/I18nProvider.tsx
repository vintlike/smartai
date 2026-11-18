import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Locale } from '../types';
import { messages as builtinMessages, defaultLocale, translate } from './locales';

/** 业务侧可覆盖的词条字典（按语言分组，key 为扁平字符串） */
export type I18nMessageMap = Record<string, string>;

export interface I18nContextValue {
  /** 当前语言 */
  locale: Locale;
  /** 设置语言（持久化到本地存储） */
  setLocale: (locale: Locale) => void;
  /** 中英文互换 */
  toggleLocale: () => void;
  /** 文案翻译：支持 {name} 占位符插值 */
  t: (key: string, params?: Record<string, string | number>) => string;
  /** 当前语言或兜底语言中是否存在该词条 */
  has: (key: string) => boolean;
}

/** 无 Provider 时的兜底上下文（保证 ThemeProvider 等可脱离本组件独立复用） */
const fallbackContext: I18nContextValue = {
  locale: defaultLocale,
  setLocale: () => undefined,
  toggleLocale: () => undefined,
  t: (key, params) => translate(defaultLocale, key, params),
  has: (key) => Boolean(builtinMessages[defaultLocale][key]),
};

const I18nContext = createContext<I18nContextValue | null>(null);

/** 读取本地存储的语言偏好 */
function readStoredLocale(storageKey: string): Locale | null {
  if (typeof window === 'undefined') return null;
  const stored = window.localStorage.getItem(`${storageKey}-locale`);
  return stored === 'zh-CN' || stored === 'en-US' ? stored : null;
}

export interface I18nProviderProps {
  children: ReactNode;
  /** 默认语言，本地无偏好时生效 */
  defaultLocale?: Locale;
  /** 当前语言缺词时的兜底语言，默认中文 */
  fallbackLocale?: Locale;
  /** 本地存储 key（与主题共用 storageKey 前缀） */
  storageKey?: string;
  /** 业务词条覆盖（与框架内置词条合并，同 key 优先使用业务词条） */
  messages?: Partial<Record<Locale, I18nMessageMap>>;
}

/**
 * 国际化提供者：管理界面语言（中文/英文）并持久化到本地存储，
 * 同时同步 html lang 属性。未包裹本组件时 useI18n 回退默认中文。
 */
export function I18nProvider({
  children,
  defaultLocale: initialLocale = defaultLocale,
  fallbackLocale = defaultLocale,
  storageKey = 'smartai-web',
  messages: customMessages,
}: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(
    () => readStoredLocale(storageKey) ?? initialLocale,
  );

  const setLocale = useCallback(
    (next: Locale) => {
      setLocaleState(next);
      window.localStorage.setItem(`${storageKey}-locale`, next);
    },
    [storageKey],
  );

  const toggleLocale = useCallback(() => {
    setLocale(locale === 'zh-CN' ? 'en-US' : 'zh-CN');
  }, [locale, setLocale]);

  /** 框架词条与业务词条合并；业务同名词条覆盖框架词条 */
  const dictionaries = useMemo<Record<Locale, I18nMessageMap>>(() => {
    if (!customMessages) return builtinMessages;
    const merged: Record<Locale, I18nMessageMap> = {
      'zh-CN': { ...builtinMessages['zh-CN'] },
      'en-US': { ...builtinMessages['en-US'] },
    };
    for (const [code, pack] of Object.entries(customMessages)) {
      if (!pack) continue;
      merged[code as Locale] = { ...merged[code as Locale], ...pack };
    }
    return merged;
  }, [customMessages]);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      const raw = dictionaries[locale]?.[key] ?? dictionaries[fallbackLocale]?.[key] ?? key;
      if (!params) return raw;
      return raw.replace(/\{(\w+)\}/g, (match, name: string) =>
        params[name] === undefined ? match : String(params[name]),
      );
    },
    [dictionaries, fallbackLocale, locale],
  );

  const has = useCallback(
    (key: string) =>
      dictionaries[locale]?.[key] !== undefined ||
      dictionaries[fallbackLocale]?.[key] !== undefined,
    [dictionaries, fallbackLocale, locale],
  );

  /** 同步 html lang，便于浏览器与辅助工具识别界面语言 */
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const contextValue = useMemo<I18nContextValue>(
    () => ({ locale, setLocale, toggleLocale, t, has }),
    [locale, setLocale, toggleLocale, t, has],
  );

  return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>;
}

/** 获取国际化上下文（无 Provider 时回退默认语言） */
export function useI18n(): I18nContextValue {
  return useContext(I18nContext) ?? fallbackContext;
}
