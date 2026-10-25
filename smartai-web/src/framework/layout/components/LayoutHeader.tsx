import { Button, Layout, theme, Tooltip } from 'antd'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import type { ReactNode } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import { AppLogo } from './AppLogo'
import { HeaderActions } from './HeaderActions'
import { LayoutBreadcrumb } from './LayoutBreadcrumb'
import { TopMenu } from './TopMenu'
import { useLayout } from '../LayoutProvider'

const { Header } = Layout

export interface LayoutHeaderProps {
  /** 顶栏右侧业务动作区，由接入方传入 */
  actions?: ReactNode
}

/** 通用顶栏：根据菜单模式切换 logo / 横向菜单 / 面包屑 */
export function LayoutHeader({ actions }: LayoutHeaderProps) {
  const { settings, collapsed, toggleCollapsed } = useLayout()
  const { t } = useI18n()
  const { token } = theme.useToken()
  const { layoutMode, showBreadcrumb, fixedHeader } = settings

  const isVertical = layoutMode === 'vertical'
  const isHorizontal = layoutMode === 'horizontal'
  const isBlend = layoutMode === 'blend'

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
                icon={collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
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
  )
}
