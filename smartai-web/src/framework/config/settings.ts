import { colorPrimary, defaultLayoutMode, defaultThemeMode } from './theme'
import type { LayoutMode, ThemeMode } from './theme'

/** 布局设置：全部可持久化，全部与业务无关 */
export interface LayoutSettings {
  /** 菜单模式 */
  layoutMode: LayoutMode
  /** 左侧菜单是否收起 */
  collapsed: boolean
  /** 是否显示多 Tab 标签页 */
  showTabs: boolean
  /** 是否显示面包屑 */
  showBreadcrumb: boolean
  /** 顶栏是否吸顶 */
  fixedHeader: boolean
}

export const defaultLayoutSettings: LayoutSettings = {
  layoutMode: defaultLayoutMode,
  collapsed: false,
  showTabs: true,
  showBreadcrumb: true,
  fixedHeader: true,
}

export interface ThemeSettings {
  /** 主题风格 */
  mode: ThemeMode
  /** 主题色 */
  colorPrimary: string
}

export const defaultThemeSettings: ThemeSettings = {
  mode: defaultThemeMode,
  colorPrimary,
}

/** 默认持久化 key，接入方可通过 Provider 的 storageKey 覆盖 */
export const defaultStorageKeys = {
  theme: 'smartai:theme-settings',
  layout: 'smartai:layout-settings',
  locale: 'smartai:locale',
  tabs: 'smartai:tabs',
}

export const defaultSiderWidth = 224
export const defaultCollapsedWidth = 64
export const defaultHeaderHeight = 56
