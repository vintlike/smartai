import { Layout, Watermark, theme } from 'antd';
import type { ReactNode } from 'react';
import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { defaultCollapsedWidth, defaultSiderWidth } from '@/framework/config/settings';
import { AppLogo } from '@/framework/layout/components/AppLogo';
import { LayoutHeader } from '@/framework/layout/components/LayoutHeader';
import { PageLoading } from '@/framework/layout/components/PageLoading';
import { SettingsDrawer } from '@/framework/layout/components/SettingsDrawer';
import { SideMenu } from '@/framework/layout/components/SideMenu';
import { TabsBar } from '@/framework/layout/components/TabsBar';
import { useLayout } from '@/framework/layout/LayoutProvider';
import { useLayoutSider } from '@/framework/layout/useLayoutSider';
import { useMenuTitle } from '@/framework/menu/useMenuTitle';
import { useTheme } from '@/framework/theme/ThemeProvider';
import '@/framework/styles/layout.less';

const { Content, Sider } = Layout;

export interface BasicLayoutProps {
  /** 顶栏最右侧的业务动作插槽（如用户头像菜单），框架不关心其内容 */
  headerActions?: ReactNode;
}

/**
 * 通用后台布局，支持 vertical / horizontal / blend 三种菜单模式。
 * 布局内部不关心业务页面，只负责外壳、菜单与多 Tab。
 */
export function BasicLayout({ headerActions }: BasicLayoutProps) {
  const { settings, logo, addTab, collapsed, setResponsiveCollapsed, refreshToken } = useLayout();
  const { mode } = useTheme();
  const { layoutMode, chain, nodes: siderNodes, visible: showSider } = useLayoutSider();
  const getTitle = useMenuTitle();
  const location = useLocation();
  const { token } = theme.useToken();

  const current = chain.length > 0 ? chain[chain.length - 1] : undefined;
  const currentTitle = current ? getTitle(current) : '';

  useEffect(() => {
    if (!current) return;
    addTab({ key: current.path, path: current.path, title: currentTitle, closable: true });
    const appTitle = logo.title ?? '';
    document.title = currentTitle ? `${currentTitle} - ${appTitle}` : appTitle;
  }, [current, currentTitle, addTab, logo.title]);

  const isVertical = layoutMode === 'vertical';
  const isBlend = layoutMode === 'blend';

  const sider = showSider ? (
    <Sider
      className={['sa-sider', isBlend ? 'sa-sider--under-header' : ''].filter(Boolean).join(' ')}
      theme="light"
      width={defaultSiderWidth}
      collapsedWidth={defaultCollapsedWidth}
      collapsed={collapsed}
      trigger={null}
      breakpoint="lg"
      onBreakpoint={(broken) => setResponsiveCollapsed(broken)}
      style={{
        background: token.colorBgContainer,
        borderRight: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      <div className="sa-sider__inner">
        {isVertical ? (
          <div className="sa-sider__logo">
            <AppLogo collapsed={collapsed} />
          </div>
        ) : null}
        <div className="sa-sider__menu">
          <SideMenu nodes={siderNodes} collapsed={collapsed} />
        </div>
      </div>
    </Sider>
  ) : null;

  const tabs = settings.showTabs ? <TabsBar /> : null;

  const content = (
    <Content className="sa-content">
      <Watermark
        className="sa-content__watermark"
        content={logo.title ?? ''}
        gap={[120, 120]}
        font={{
          color: mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.045)',
        }}
      >
        <div className="sa-content__inner">
          <Suspense key={`${location.pathname}#${refreshToken}`} fallback={<PageLoading />}>
            <Outlet />
          </Suspense>
        </div>
      </Watermark>
    </Content>
  );

  return (
    <>
      {isVertical ? (
        <Layout className="sa-layout" hasSider>
          {sider}
          <Layout className="sa-layout__main">
            <LayoutHeader actions={headerActions} />
            {tabs}
            {content}
          </Layout>
        </Layout>
      ) : (
        <Layout className="sa-layout">
          <LayoutHeader actions={headerActions} />
          <Layout className="sa-layout__body" hasSider={showSider}>
            {sider}
            <Layout className="sa-layout__main">
              {tabs}
              {content}
            </Layout>
          </Layout>
        </Layout>
      )}
      <SettingsDrawer />
    </>
  );
}
