import type { ReactNode } from 'react'

export interface I18nMessages {
  [key: string]: string | I18nMessages
}

export type LocaleMessages = Record<string, I18nMessages>

export interface LocaleOption {
  value: string
  label: string
}

export interface I18nContextValue {
  locale: string
  setLocale: (locale: string) => void
  /** 翻译，支持 {name} 形式的变量插值；未命中时返回 key */
  t: (key: string, params?: Record<string, string | number>) => string
  /** 判断当前语言包中是否存在该 key */
  has: (key: string) => boolean
  locales: LocaleOption[]
}

export interface I18nProviderProps {
  children: ReactNode
  /** 框架内置语言包之外，业务可追加/覆盖 */
  messages?: LocaleMessages
  defaultLocale?: string
  fallbackLocale?: string
  locales?: LocaleOption[]
  storageKey?: string
  onLocaleChange?: (locale: string) => void
}
