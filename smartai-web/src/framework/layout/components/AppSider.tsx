import { Drawer, Layout, theme } from 'antd';
import { useThemeMode } from '../../theme/ThemeProvider';
import { useLayout } from '../AppLayoutProvider';
import { AppLogo } from './AppLogo';
import { AppMenu } from './AppMenu';

const { Sider } = Layout;

/**
 * 侧边栏：
 * - vertical 模式 / 移动端：vertical 变体（完整菜单树）
 * - blend 模式：blend 变体（仅展示当前激活一级菜单的子项）
 * - horizontal 模式不渲染
 * - 移动端以抽屉形式展示
 */
export function AppSider() {
  const { config, menuMode, collapsed, isMobile, mobileMenuOpen, setMobileMenuOpen } = useLayout();
  const { isDark } = useThemeMode();
  const { token } = theme.useToken();
  const siderWidth = config.siderWidth ?? 220;
  const collapsedWidth = config.collapsedWidth ?? 64;

  /** 移动端：抽屉形态 */
  if (isMobile) {
    return (
      <Drawer
        placement="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        size={siderWidth}
        closable={false}
        styles={{
          body: {
            padding: 0,
            background: token.colorBgContainer,
            color: token.colorText,
          },
        }}
      >
        <div className="app-layout-sider-inner">
          <AppLogo collapsed={false} />
          <div className="app-layout-sider-menu">
            <AppMenu variant="vertical" />
          </div>
        </div>
      </Drawer>
    );
  }

  /** 顶栏模式无需侧边栏 */
  if (menuMode === 'horizontal') return null;

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      trigger={null}
      width={siderWidth}
      collapsedWidth={collapsedWidth}
      theme={isDark ? 'dark' : 'light'}
      style={{
        background: token.colorBgContainer,
        borderRight: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      <div className="app-layout-sider-inner">
        <AppLogo />
        <div className="app-layout-sider-menu">
          <AppMenu variant={menuMode === 'blend' ? 'blend' : 'vertical'} />
        </div>
      </div>
    </Sider>
  );
}
