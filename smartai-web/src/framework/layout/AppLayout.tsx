import { Layout, Watermark } from 'antd';
import { Outlet, useLocation } from 'react-router-dom';
import { I18nProvider } from '../i18n/I18nProvider';
import { MenuProvider } from '../menu/MenuProvider';
import { ThemeProvider } from '../theme/ThemeProvider';
import { ThemeVars } from '../theme/ThemeVars';
import type { LayoutConfig } from '../types';
import { AppLayoutProvider, useLayout } from './AppLayoutProvider';
import { AntdAppProvider } from './components/AntdAppProvider';
import { AppHeader } from './components/AppHeader';
import { AppSider } from './components/AppSider';
import { AppTabs } from './components/AppTabs';
import './styles.less';

const { Content, Footer } = Layout;

/** 布局主体：按菜单模式组合 侧边栏 / 顶部栏 / 内容区 / 页脚 */
function LayoutShell() {
  const { config, menuMode, isMobile, showTabs, showFooter, showWatermark, refreshKey } =
    useLayout();
  const { pathname } = useLocation();

  /**
   * 移动端任意菜单模式都需渲染 AppSider（内部以抽屉形式承载菜单）；
   * 桌面端 horizontal 模式无侧边栏。
   */
  const showSider = menuMode !== 'horizontal' || isMobile;
  const year = new Date().getFullYear();
  const watermarkContent =
    config.watermarkContent ?? (typeof config.title === 'string' ? config.title : 'SmartAI');

  /** key 含当前路径与刷新计数：切换标签或点击刷新都会重挂载页面内容，实现当前标签局部刷新 */
  const page = (
    <div className="app-layout-page" key={`${pathname}-${refreshKey}`}>
      <Outlet />
    </div>
  );

  return (
    <Layout className="app-layout" hasSider={showSider && !isMobile}>
      {showSider ? <AppSider /> : null}
      <Layout>
        <AppHeader />
        <Content className="app-layout-content">
          {showTabs && !isMobile ? <AppTabs /> : null}
          {showWatermark ? (
            <Watermark content={watermarkContent} className="app-layout-watermark">
              {page}
            </Watermark>
          ) : (
            page
          )}
        </Content>
        {showFooter ? (
          <Footer className="app-layout-footer">
            {config.footerContent ?? `© ${year} SmartAI`}
          </Footer>
        ) : null}
      </Layout>
    </Layout>
  );
}

export interface AppLayoutProps {
  /** 布局配置：标题、Logo、菜单数据源、菜单模式、主题等 */
  config: LayoutConfig;
}

/**
 * 应用布局入口（与业务完全解耦）：
 * 内部组装 国际化 Provider → 主题 Provider → antd App → 布局 Provider → 菜单 Provider，
 * 业务只需传入 LayoutConfig，并在路由中以子路由（Outlet）形式声明页面。
 */
export function AppLayout({ config }: AppLayoutProps) {
  const storageKey = config.storageKey ?? 'smartai-web';

  return (
    <I18nProvider
      storageKey={storageKey}
      defaultLocale={config.defaultLocale}
      fallbackLocale={config.fallbackLocale}
      messages={config.i18nMessages}
    >
      <ThemeProvider
        defaultMode={config.defaultThemeMode}
        colorPrimary={config.colorPrimary}
        storageKey={storageKey}
      >
        <AntdAppProvider>
          <ThemeVars />
          <AppLayoutProvider config={config}>
            <MenuProvider source={config.menu}>
              <LayoutShell />
            </MenuProvider>
          </AppLayoutProvider>
        </AntdAppProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
