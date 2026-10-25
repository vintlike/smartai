import { createContext, useCallback, useContext, useEffect, useMemo } from 'react'
import { defaultStorageKeys } from '../config/settings'
import { usePersistentState } from '../utils/usePersistentState'
import enUS from './locales/en-US'
import zhCN from './locales/zh-CN'
import type { I18nContextValue, I18nMessages, I18nProviderProps, LocaleMessages } from './types'

/** 框架内置语言包 */
export const frameworkMessages: LocaleMessages = {
  'zh-CN': zhCN,
  'en-US': enUS,
}

/** 框架内置语言列表 */
export const frameworkLocales = [
  { value: 'zh-CN', label: '简体中文' },
  { value: 'en-US', label: 'English' },
]

const I18nContext = createContext<I18nContextValue | null>(null)

function mergeMessages(base: I18nMessages, extra?: I18nMessages): I18nMessages {
  if (!extra) return base
  const result: I18nMessages = { ...base }
  for (const [key, value] of Object.entries(extra)) {
    const current = result[key]
    if (typeof value === 'object' && typeof current === 'object') {
      result[key] = mergeMessages(current, value)
    } else {
      result[key] = value
    }
  }
  return result
}

function resolveMessage(messages: I18nMessages | undefined, key: string): string | undefined {
  if (!messages) return undefined
  const value = key
    .split('.')
    .reduce<string | I18nMessages | undefined>(
      (acc, part) => (typeof acc === 'object' && acc !== null ? acc[part] : undefined),
      messages,
    )
  return typeof value === 'string' ? value : undefined
}

export function I18nProvider({
  children,
  messages,
  defaultLocale = 'zh-CN',
  fallbackLocale = 'zh-CN',
  locales = frameworkLocales,
  storageKey = defaultStorageKeys.locale,
  onLocaleChange,
}: I18nProviderProps) {
  const [settings, updateSettings] = usePersistentState<{ locale: string }>(storageKey, {
    locale: defaultLocale,
  })
  const locale = settings.locale

  const localeMessages = useMemo<LocaleMessages>(() => {
    const merged: LocaleMessages = { ...frameworkMessages }
    if (messages) {
      for (const [code, pack] of Object.entries(messages)) {
        merged[code] = mergeMessages(merged[code] ?? {}, pack)
      }
    }
    return merged
  }, [messages])

  const setLocale = useCallback(
    (next: string) => {
      updateSettings({ locale: next })
      onLocaleChange?.(next)
    },
    [updateSettings, onLocaleChange],
  )

  const has = useCallback(
    (key: string) =>
      resolveMessage(localeMessages[locale], key) !== undefined ||
      resolveMessage(localeMessages[fallbackLocale], key) !== undefined,
    [localeMessages, locale, fallbackLocale],
  )

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      const raw =
        resolveMessage(localeMessages[locale], key) ??
        resolveMessage(localeMessages[fallbackLocale], key) ??
        key
      if (!params) return raw
      return raw.replace(/\{(\w+)\}/g, (match, name: string) =>
        params[name] === undefined ? match : String(params[name]),
      )
    },
    [localeMessages, locale, fallbackLocale],
  )

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const value = useMemo<I18nContextValue>(
    () => ({ locale, setLocale, t, has, locales }),
    [locale, setLocale, t, has, locales],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n 必须在 <I18nProvider> 内部使用')
  }
  return context
}
