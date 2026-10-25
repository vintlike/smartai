/**
 * 通用后台框架入口。
 * layout / i18n / theme / menu 均与业务无关，接入方只依赖这里的导出。
 */

export type { LogoConfig } from './config/logo';
export { defaultLogoConfig } from './config/logo';
export type { LayoutSettings, ThemeSettings } from './config/settings';
export {
  defaultCollapsedWidth,
  defaultHeaderHeight,
  defaultLayoutSettings,
  defaultSiderWidth,
  defaultStorageKeys,
  defaultThemeSettings,
} from './config/settings';
export type { LayoutMode, ThemeColorOption, ThemeMode, ThemeToken } from './config/theme';
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
} from './config/theme';

// ---------- i18n ----------
export {
  frameworkLocales,
  frameworkMessages,
  I18nProvider,
  useI18n,
} from './i18n/I18nProvider';
export type {
  I18nContextValue,
  I18nMessages,
  I18nProviderProps,
  LocaleMessages,
  LocaleOption,
} from './i18n/types';
export type { BasicLayoutProps } from './layout/BasicLayout';
// ---------- layout ----------
export { BasicLayout } from './layout/BasicLayout';
export { AppLogo } from './layout/components/AppLogo';
export { BrandMark } from './layout/components/BrandMark';
export type { HeaderActionsProps } from './layout/components/HeaderActions';
export { HeaderActions } from './layout/components/HeaderActions';
export type { LayoutHeaderProps } from './layout/components/LayoutHeader';
export { LayoutHeader } from './layout/components/LayoutHeader';
export { MenuErrorScreen, MenuLoadingScreen } from './layout/components/MenuStateScreen';
export { PageLoading } from './layout/components/PageLoading';
export { MissingPage, NotFoundPage } from './layout/components/ResultPages';
export { SettingsDrawer } from './layout/components/SettingsDrawer';
export { SideMenu } from './layout/components/SideMenu';
export { TabsBar } from './layout/components/TabsBar';
export { TopMenu } from './layout/components/TopMenu';
export type { LayoutContextValue, LayoutProviderProps, TabItem } from './layout/LayoutProvider';
export { LayoutProvider, useLayout } from './layout/LayoutProvider';
export { MenuIcon } from './menu/MenuIcon';
// ---------- menu ----------
export { MenuProvider, useMenu } from './menu/MenuProvider';
export { buildMenuItems } from './menu/menuItems';
export {
  createMenuIndex,
  findMenuChain,
  findTopMenuNode,
  flattenMenuTree,
  getFirstMenuPath,
  getMenuLeaves,
  getOpenKeysByPath,
  normalizeMenuTree,
} from './menu/menuUtils';
export type {
  AppMenuNode,
  MenuContextValue,
  MenuItem,
  MenuMeta,
  MenuProviderProps,
  MenuRequest,
} from './menu/types';
export { useMenuTitle } from './menu/useMenuTitle';
export type { ThemeContextValue, ThemeProviderProps } from './theme/ThemeProvider';
// ---------- theme ----------
export { ThemeProvider, useTheme } from './theme/ThemeProvider';
