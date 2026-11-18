/**
 * 布局框架统一出口（与业务完全解耦，可整体复制到其他项目复用）。
 *
 * 接入新项目仅需要：
 * 1. 定义菜单数据（静态配置或接口获取，结构为 AppMenuItem[]）
 * 2. 组装 LayoutConfig（标题、Logo、菜单模式、主题等）
 * 3. 路由中以 <AppLayout config={layoutConfig} /> 为布局容器
 */

export type { I18nContextValue, I18nMessageMap } from './i18n/I18nProvider';
export { I18nProvider, useI18n } from './i18n/I18nProvider';
export { defaultLocale, messages, translate } from './i18n/locales';
export { AppLayout, type AppLayoutProps } from './layout/AppLayout';
export type { LayoutContextValue } from './layout/AppLayoutProvider';
export { AppLayoutProvider, MOBILE_BREAKPOINT, useLayout } from './layout/AppLayoutProvider';
export { AppBreadcrumb } from './layout/components/AppBreadcrumb';
export { AppHeader } from './layout/components/AppHeader';
export { AppLocaleSwitch } from './layout/components/AppLocaleSwitch';
export { AppLogo } from './layout/components/AppLogo';
export {
  AppMenu,
  type AppMenuProps,
  type AppMenuVariant,
  type MenuVariant,
} from './layout/components/AppMenu';
export { AppSettingDrawer } from './layout/components/AppSettingDrawer';
export { AppSider } from './layout/components/AppSider';
export { AppTabs } from './layout/components/AppTabs';
export { AppThemeSwitch } from './layout/components/AppThemeSwitch';
export { AppUserAvatar } from './layout/components/AppUserAvatar';
export { MenuErrorInline } from './layout/components/MenuStateScreen';
export { MissingPage, NotFoundPage } from './layout/components/ResultPages';
export { usePageRefresh } from './layout/usePageRefresh';
export type { MenuContextValue } from './menu/MenuProvider';
export { MenuProvider, useMenu, useMenuContext } from './menu/MenuProvider';
export {
  findAncestorKeys,
  findFirstLeaf,
  findMenuItem,
  flattenMenu,
  getItemPath,
  resolveMenuChain,
  resolveSelectedKey,
  resolveTabTitle,
  resolveTopKey,
  toAntdMenuItems,
} from './menu/MenuUtil';
export type { PageComponentMap } from './menu/routes';
export { buildMenuRoutes, PageLoading, renderPage } from './menu/routes';
export { chartColors, colorPrimary, defaultThemeColors, uiColors } from './theme/colors';
export type { ThemeContextValue } from './theme/ThemeProvider';
export { ThemeProvider, useThemeMode } from './theme/ThemeProvider';
export { ThemeVars } from './theme/ThemeVars';
export { darkThemeTokens, lightThemeTokens } from './theme/tokens';
export type {
  AppMenuItem,
  AppUserInfo,
  LayoutConfig,
  Locale,
  MenuMode,
  MenuSource,
  PageComponent,
  ThemeColorOption,
  ThemeMode,
} from './types';
