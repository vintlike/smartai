import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { Button, Layout, Tooltip, theme } from 'antd';
import type { ReactNode } from 'react';
import { useI18n } from '@/framework/i18n/I18nProvider';
import { AppLogo } from '@/framework/layout/components/AppLogo';
import { HeaderActions } from '@/framework/layout/components/HeaderActions';
import { LayoutBreadcrumb } from '@/framework/layout/components/LayoutBreadcrumb';
import { TopMenu } from '@/framework/layout/components/TopMenu';
import { useLayout } from '@/framework/layout/LayoutProvider';

const { Header } = Layout;

export interface LayoutHeaderProps {
  /** 顶栏右侧业务动作区，由接入方传入 */
  actions?: ReactNode;
}

/** 通用顶栏：根据菜单模式切换 logo / 横向菜单 / 面包屑 */
export function LayoutHeader({ actions }: LayoutHeaderProps) {
  const { settings, collapsed, toggleCollapsed } = useLayout();
  const { t } = useI18n();
  const { token } = theme.useToken();
  const { layoutMode, showBreadcrumb, fixedHeader } = settings;

  const isVertical = layoutMode === 'vertical';
  const isHorizontal = layoutMode === 'horizontal';
  const isBlend = layoutMode === 'blend';

  return (
    <Header
      className={['sa-header', fixedHeader ? 'sa-header--fixed' : ''].filter(Boolean).join(' ')}
      style={{
        background: token.colorBgContainer,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      <div className="sa-header__left">
        {isVertical ? (
          <>
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
            {showBreadcrumb ? <LayoutBreadcrumb /> : null}
          </>
        ) : null}

        {isHorizontal || isBlend ? <AppLogo className="sa-logo--header" /> : null}
        {isHorizontal ? <TopMenu className="sa-header__menu" highlight="leaf" /> : null}
        {isBlend ? <TopMenu className="sa-header__menu" highlight="top" /> : null}
      </div>

      <HeaderActions>{actions}</HeaderActions>
    </Header>
  );
}
