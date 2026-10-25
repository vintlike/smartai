/**
 * 通用后台框架入口。
 * layout / i18n / theme / menu 均与业务无关，接入方只依赖这里的导出。
 */

// ---------- 配置 ----------
export {
  chartColors,
  colorPrimary,
  darkThemeToken,
  defaultLayoutMode,
  defaultThemeMode,
  layoutModes,
  lightThemeToken,
  themeColors,
  themeModes,
  themeTokens,
  uiColors,
} from './config/theme'
export type { LayoutMode, ThemeColorOption, ThemeMode, ThemeToken } from './config/theme'

export {
  defaultCollapsedWidth,
  defaultHeaderHeight,
  defaultLayoutSettings,
  defaultSiderWidth,
  defaultStorageKeys,
  defaultThemeSettings,
} from './config/settings'
export type { LayoutSettings, ThemeSettings } from './config/settings'

export { defaultLogoConfig } from './config/logo'
export type { LogoConfig } from './config/logo'

// ---------- i18n ----------
export {
  frameworkLocales,
  frameworkMessages,
  I18nProvider,
  useI18n,
} from './i18n/I18nProvider'
export type {
  I18nContextValue,
  I18nMessages,
  I18nProviderProps,
  LocaleMessages,
  LocaleOption,
} from './i18n/types'

// ---------- theme ----------
export { ThemeProvider, useTheme } from './theme/ThemeProvider'
export type { ThemeContextValue, ThemeProviderProps } from './theme/ThemeProvider'

// ---------- menu ----------
export { MenuProvider, useMenu } from './menu/MenuProvider'
export { MenuIcon } from './menu/MenuIcon'
export { buildMenuItems } from './menu/menuItems'
export {
  createMenuIndex,
  findMenuChain,
  findTopMenuNode,
  flattenMenuTree,
  getFirstMenuPath,
  getMenuLeaves,
  getOpenKeysByPath,
  normalizeMenuTree,
} from './menu/menuUtils'
export { useMenuTitle } from './menu/useMenuTitle'
export type {
  AppMenuNode,
  MenuContextValue,
  MenuItem,
  MenuMeta,
  MenuProviderProps,
  MenuRequest,
} from './menu/types'

// ---------- layout ----------
export { BasicLayout } from './layout/BasicLayout'
export { LayoutProvider, useLayout } from './layout/LayoutProvider'
export type { LayoutContextValue, LayoutProviderProps, TabItem } from './layout/LayoutProvider'
export { AppLogo } from './layout/components/AppLogo'
export { BrandMark } from './layout/components/BrandMark'
export { LayoutHeader } from './layout/components/LayoutHeader'
export { MenuErrorScreen, MenuLoadingScreen } from './layout/components/MenuStateScreen'
export { PageLoading } from './layout/components/PageLoading'
export { MissingPage, NotFoundPage } from './layout/components/ResultPages'
export { SettingsDrawer } from './layout/components/SettingsDrawer'
export { SideMenu } from './layout/components/SideMenu'
export { TabsBar } from './layout/components/TabsBar'
export { TopMenu } from './layout/components/TopMenu'
