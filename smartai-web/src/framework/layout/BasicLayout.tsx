import { Layout, theme } from 'antd'
import { Suspense, useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { defaultCollapsedWidth, defaultSiderWidth } from '../config/settings'
import { useMenu } from '../menu/MenuProvider'
import { useMenuTitle } from '../menu/useMenuTitle'
import { useLayout } from './LayoutProvider'
import { AppLogo } from './components/AppLogo'
import { LayoutHeader } from './components/LayoutHeader'
import { PageLoading } from './components/PageLoading'
import { SettingsDrawer } from './components/SettingsDrawer'
import { SideMenu } from './components/SideMenu'
import { TabsBar } from './components/TabsBar'
import '../styles/layout.less'

const { Content, Sider } = Layout

export interface BasicLayoutProps {
  /** 顶栏最右侧的业务动作插槽（如用户头像菜单），框架不关心其内容 */
  headerActions?: ReactNode
}

/**
 * 通用后台布局，支持 vertical / horizontal / blend 三种菜单模式。
 * 布局内部不关心业务页面，只负责外壳、菜单与多 Tab。
 */
export function BasicLayout({ headerActions }: BasicLayoutProps) {
  const { menuTree, getMenuChain } = useMenu()
  const { settings, logo, addTab, collapsed, setResponsiveCollapsed, refreshToken } = useLayout()
  const getTitle = useMenuTitle()
  const location = useLocation()
  const { token } = theme.useToken()

  const chain = useMemo(() => getMenuChain(location.pathname), [getMenuChain, location.pathname])
  const current = chain.length > 0 ? chain[chain.length - 1] : undefined
  const currentTitle = current ? getTitle(current) : ''

  useEffect(() => {
    if (!current) return
    addTab({ key: current.path, path: current.path, title: currentTitle, closable: true })
    const appTitle = logo.title ?? ''
    document.title = currentTitle ? `${currentTitle} - ${appTitle}` : appTitle
  }, [current, currentTitle, addTab, logo.title])

  const isVertical = settings.layoutMode === 'vertical'
  const isBlend = settings.layoutMode === 'blend'
  const blendNodes = isBlend && chain[0]?.children.length ? chain[0].children : []
  const showSider = isVertical || blendNodes.length > 0

  const sider = showSider ? (
    <Sider
      className={['sa-sider', isBlend ? 'sa-sider--under-header' : ''].filter(Boolean).join(' ')}
      theme="light"
      width={defaultSiderWidth}
      collapsedWidth={defaultCollapsedWidth}
      collapsed={collapsed}
      trigger={null}
      breakpoint={isVertical ? 'lg' : undefined}
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
          <SideMenu nodes={isVertical ? menuTree : blendNodes} collapsed={collapsed} />
        </div>
      </div>
    </Sider>
  ) : null

  const tabs = settings.showTabs ? <TabsBar /> : null

  const content = (
    <Content className="sa-content">
      <div className="sa-content__inner">
        <Suspense key={`${location.pathname}#${refreshToken}`} fallback={<PageLoading />}>
          <Outlet />
        </Suspense>
      </div>
    </Content>
  )

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
  )
}
