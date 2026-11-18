import { Menu, type MenuProps, Spin } from 'antd';
import { useMenuContext } from '../../menu/MenuProvider';
import { useThemeMode } from '../../theme/ThemeProvider';
import { useLayout } from '../AppLayoutProvider';
import { MenuErrorInline } from './MenuStateScreen';

/**
 * 菜单变体：
 * - vertical：侧边栏完整菜单（vertical 模式 / 移动端）
 * - horizontal：顶部完整水平菜单（horizontal 模式）
 * - blend：侧边栏子菜单，只显示当前激活一级菜单下的子项（blend 模式）
 */
export type MenuVariant = 'vertical' | 'horizontal' | 'blend';

/** 兼容早期命名 */
export type AppMenuVariant = MenuVariant;

export interface AppMenuProps {
  /** 菜单变体 */
  variant: MenuVariant;
  /** 仅展示一级菜单（blend 布局的顶部使用），点击后整组切换 */
  topLevelOnly?: boolean;
}

/** 通用菜单组件：按变体渲染对应的菜单形态 */
export function AppMenu({ variant, topLevelOnly = false }: AppMenuProps) {
  const {
    items,
    topItems,
    activeGroupItems,
    selectedKey,
    activeTopKey,
    openKeys,
    setOpenKeys,
    loading,
    error,
    refresh,
    navigateByKey,
    navigateByTopKey,
  } = useMenuContext();
  const { isDark } = useThemeMode();
  const { collapsed } = useLayout();

  if (loading) {
    return (
      <div className="app-layout-menu-loading">
        <Spin size="small" />
      </div>
    );
  }

  if (error) {
    return <MenuErrorInline error={error} onRetry={refresh} />;
  }

  const isHorizontal = variant === 'horizontal';

  /** 菜单项：vertical/horizontal 展示完整菜单树；blend 展示激活分组子项；水平且仅一级时展示一级菜单 */
  let menuItems = items;
  if (variant === 'blend') menuItems = activeGroupItems;
  else if (isHorizontal && topLevelOnly) menuItems = topItems;

  /** 高亮项：blend 布局顶部高亮一级菜单，其余高亮最深菜单项 */
  const activeKey = isHorizontal && topLevelOnly ? activeTopKey : selectedKey;
  const selectedKeys = activeKey ? [activeKey] : [];

  return (
    <Menu
      mode={isHorizontal ? 'horizontal' : 'inline'}
      theme={isDark ? 'dark' : 'light'}
      className={isHorizontal ? 'app-layout-top-menu' : 'app-layout-inline-menu'}
      items={menuItems as MenuProps['items']}
      selectedKeys={selectedKeys}
      onClick={({ key }) =>
        isHorizontal && topLevelOnly ? navigateByTopKey(key) : navigateByKey(key)
      }
      {...(isHorizontal ? {} : { openKeys, onOpenChange: setOpenKeys, inlineCollapsed: collapsed })}
    />
  );
}
