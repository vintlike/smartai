/**
 * 通用后台框架入口。
 * layout / i18n / theme / menu 均与业务无关，接入方只依赖这里的导出。
 */

export type { LogoConfig } from '@/framework/config/logo';
export { defaultLogoConfig } from '@/framework/config/logo';
export type { LayoutSettings, ThemeSettings } from '@/framework/config/settings';
export {
  defaultCollapsedWidth,
  defaultHeaderHeight,
  defaultLayoutSettings,
  defaultSiderWidth,
  defaultStorageKeys,
  defaultThemeSettings,
} from '@/framework/config/settings';
export type { LayoutMode, ThemeColorOption, ThemeMode, ThemeToken } from '@/framework/config/theme';
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
} from '@/framework/config/theme';

// ---------- i18n ----------
export {
  frameworkLocales,
  frameworkMessages,
  I18nProvider,
  useI18n,
} from '@/framework/i18n/I18nProvider';
export type {
  I18nContextValue,
  I18nMessages,
  I18nProviderProps,
  LocaleMessages,
  LocaleOption,
} from '@/framework/i18n/types';
export type { BasicLayoutProps } from '@/framework/layout/BasicLayout';
// ---------- layout ----------
export { BasicLayout } from '@/framework/layout/BasicLayout';
export { AppLogo } from '@/framework/layout/components/AppLogo';
export { BrandMark } from '@/framework/layout/components/BrandMark';
export type { HeaderActionsProps } from '@/framework/layout/components/HeaderActions';
export { HeaderActions } from '@/framework/layout/components/HeaderActions';
export type { LayoutHeaderProps } from '@/framework/layout/components/LayoutHeader';
export { LayoutHeader } from '@/framework/layout/components/LayoutHeader';
export { MenuErrorScreen, MenuLoadingScreen } from '@/framework/layout/components/MenuStateScreen';
export { PageLoading } from '@/framework/layout/components/PageLoading';
export { MissingPage, NotFoundPage } from '@/framework/layout/components/ResultPages';
export { SettingsDrawer } from '@/framework/layout/components/SettingsDrawer';
export { SideMenu } from '@/framework/layout/components/SideMenu';
export { TabsBar } from '@/framework/layout/components/TabsBar';
export { TopMenu } from '@/framework/layout/components/TopMenu';
export type {
  LayoutContextValue,
  LayoutProviderProps,
  TabItem,
} from '@/framework/layout/LayoutProvider';
export { LayoutProvider, useLayout } from '@/framework/layout/LayoutProvider';
export { MenuIcon } from '@/framework/menu/MenuIcon';
// ---------- menu ----------
export { MenuProvider, useMenu } from '@/framework/menu/MenuProvider';
export type { MenuIconComponent } from '@/framework/menu/menuIconMap';
export { resolveMenuIcon } from '@/framework/menu/menuIconMap';
export { buildMenuItems } from '@/framework/menu/menuItems';
export {
  createMenuIndex,
  findMenuChain,
  findTopMenuNode,
  flattenMenuTree,
  getFirstMenuPath,
  getMenuLeaves,
  getOpenKeysByPath,
  normalizeMenuTree,
} from '@/framework/menu/menuUtils';
export type {
  AppMenuNode,
  MenuContextValue,
  MenuItem,
  MenuMeta,
  MenuProviderProps,
  MenuRequest,
} from '@/framework/menu/types';
export { useMenuTitle } from '@/framework/menu/useMenuTitle';
export type { ThemeContextValue, ThemeProviderProps } from '@/framework/theme/ThemeProvider';
// ---------- theme ----------
export { ThemeProvider, useTheme } from '@/framework/theme/ThemeProvider';
