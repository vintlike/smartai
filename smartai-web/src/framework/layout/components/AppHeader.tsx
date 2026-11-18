import {
  MenuFoldOutlined,
  MenuOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Button, Layout, Tooltip, theme } from 'antd';
import { useState } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import { useLayout } from '../AppLayoutProvider';
import { AppBreadcrumb } from './AppBreadcrumb';
import { AppLocaleSwitch } from './AppLocaleSwitch';
import { AppLogo } from './AppLogo';
import { AppMenu } from './AppMenu';
import { AppSettingDrawer } from './AppSettingDrawer';
import { AppThemeSwitch } from './AppThemeSwitch';
import { AppUserAvatar } from './AppUserAvatar';

const { Header } = Layout;

/**
 * 顶部栏：
 * - horizontal 模式：Logo + 完整水平菜单
 * - blend 模式：折叠开关 + 一级菜单 + 操作区
 * - vertical 模式：折叠开关 + 面包屑 + 操作区
 * 操作区依次为：业务自定义操作、主题切换、语言切换、设置、分隔线、用户头像。
 */
export function AppHeader() {
  const {
    config,
    menuMode,
    collapsed,
    toggleCollapsed,
    isMobile,
    setMobileMenuOpen,
    showBreadcrumb,
  } = useLayout();
  const { t } = useI18n();
  const { token } = theme.useToken();
  const [settingsOpen, setSettingsOpen] = useState(false);

  /** 顶栏模式下菜单整体在顶部；移动端一律使用抽屉菜单 */
  const showTrigger = menuMode !== 'horizontal' || isMobile;
  const showTopMenu = (menuMode === 'horizontal' || menuMode === 'blend') && !isMobile;

  /** 折叠/抽屉开关图标 */
  let triggerIcon = collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />;
  if (isMobile) triggerIcon = <MenuOutlined />;

  const handleTriggerClick = () => {
    if (isMobile) {
      setMobileMenuOpen(true);
      return;
    }
    toggleCollapsed();
  };

  return (
    <Header
      className="app-layout-header"
      style={{
        background: token.colorBgContainer,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
        color: token.colorText,
      }}
    >
      {showTrigger ? (
        <Button
          type="text"
          size="small"
          aria-label={t('menu.toggle')}
          icon={triggerIcon}
          onClick={handleTriggerClick}
        />
      ) : null}
      {menuMode === 'vertical' && !isMobile && showBreadcrumb ? <AppBreadcrumb /> : null}
      {menuMode === 'horizontal' && !isMobile ? <AppLogo collapsed={false} /> : null}
      {showTopMenu ? (
        <AppMenu variant="horizontal" topLevelOnly={menuMode === 'blend'} />
      ) : (
        <div className="app-layout-header-spacer" />
      )}
      <div className="app-layout-header-actions">
        {config.headerActions}
        <AppThemeSwitch />
        <AppLocaleSwitch />
        <Tooltip title={t('settings.title')}>
          <Button
            type="text"
            size="small"
            aria-label={t('settings.title')}
            icon={<SettingOutlined />}
            onClick={() => setSettingsOpen(true)}
          />
        </Tooltip>
        <span className="app-layout-header-divider" aria-hidden />
        <AppUserAvatar />
      </div>
      <AppSettingDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </Header>
  );
}
