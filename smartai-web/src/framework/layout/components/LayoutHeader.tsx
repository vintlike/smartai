import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { Button, Layout, Tooltip, theme } from 'antd';
import type { ReactNode } from 'react';
import { defaultCollapsedWidth, defaultSiderWidth } from '@/framework/config/settings';
import { useI18n } from '@/framework/i18n/I18nProvider';
import { AppLogo } from '@/framework/layout/components/AppLogo';
import { HeaderActions } from '@/framework/layout/components/HeaderActions';
import { LayoutBreadcrumb } from '@/framework/layout/components/LayoutBreadcrumb';
import { TopMenu } from '@/framework/layout/components/TopMenu';
import { useLayout } from '@/framework/layout/LayoutProvider';
import { useLayoutSider } from '@/framework/layout/useLayoutSider';

const { Header } = Layout;

export interface LayoutHeaderProps {
  /** 顶栏右侧业务动作区，由接入方传入 */
  actions?: ReactNode;
}

/** 通用顶栏：根据菜单模式切换 logo / 横向菜单 / 面包屑 */
export function LayoutHeader({ actions }: LayoutHeaderProps) {
  const { settings, collapsed, toggleCollapsed } = useLayout();
  const { layoutMode, visible: showSider } = useLayoutSider();
  const { t } = useI18n();
  const { token } = theme.useToken();
  const { showBreadcrumb, fixedHeader } = settings;

  const isVertical = layoutMode === 'vertical';
  const isHorizontal = layoutMode === 'horizontal';
  const isBlend = layoutMode === 'blend';
  /** 混合模式下左侧 logo 区与侧栏同宽，折叠按钮因此与垂直模式落在同一横坐标 */
  const brandWidth = collapsed ? defaultCollapsedWidth : defaultSiderWidth;

  return (
    <Header
      className={['sa-header', fixedHeader ? 'sa-header--fixed' : ''].filter(Boolean).join(' ')}
      style={{
        background: token.colorBgContainer,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      <div className="sa-header__left">
        {isBlend ? (
          <div className="sa-header__brand" style={{ width: brandWidth }}>
            <AppLogo collapsed={collapsed} className="sa-logo--header" />
          </div>
        ) : null}

        {/* 只要有侧栏就提供收起/展开入口（垂直与混合模式均适用） */}
        {showSider ? (
          <Tooltip title={collapsed ? t('layout.header.expand') : t('layout.header.collapse')}>
            <Button
              type="text"
              className="sa-icon-btn"
              aria-label={collapsed ? t('layout.header.expand') : t('layout.header.collapse')}
              onClick={toggleCollapsed}
              icon={
                collapsed ? (
                  <MenuUnfoldOutlined style={{ fontSize: 18 }} />
                ) : (
                  <MenuFoldOutlined style={{ fontSize: 18 }} />
                )
              }
            />
          </Tooltip>
        ) : null}
        {isVertical && showBreadcrumb ? <LayoutBreadcrumb /> : null}

        {isHorizontal ? <AppLogo className="sa-logo--header" /> : null}
        {isHorizontal ? <TopMenu className="sa-header__menu" highlight="leaf" /> : null}
        {isBlend ? <TopMenu className="sa-header__menu" highlight="top" /> : null}
      </div>

      <HeaderActions>{actions}</HeaderActions>
    </Header>
  );
}
