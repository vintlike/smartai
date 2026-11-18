import { fetchMenus } from '@/api/menu';
import type { AppUserInfo, LayoutConfig } from '@/framework';
import { menus } from './menu.config';

/** 演示用当前用户信息（接入真实登录后由 AuthLayout 覆盖为登录态数据） */
const currentUser: AppUserInfo = {
  name: '管理员',
  account: 'admin@smartai.com',
  avatar: '/logo.svg',
  description: '超级管理员',
};

/**
 * 布局配置（业务侧唯一接入点）：
 * 标题、Logo、菜单数据源、菜单模式、主题、界面开关、用户信息等全部在此声明，布局框架据此渲染。
 * 接入新项目时，只需替换本文件的配置与菜单/页面映射即可。
 */
export const layoutConfig: LayoutConfig = {
  /** 系统标题（展示在 Logo 旁） */
  title: 'AI 智能平台',
  /** Logo（侧边栏 / 顶栏） */
  logo: <img src="/logo.svg" alt="SmartAI" />,
  /** 折叠态 Logo */
  collapsedLogo: <img src="/logo.svg" alt="SmartAI" />,
  /** 菜单模式：'vertical' 侧边栏 / 'horizontal' 顶部 / 'blend' 顶部+侧边栏（可在设置抽屉中切换） */
  menuMode: 'blend',
  /**
   * 菜单数据源：默认使用本地静态菜单；设置 VITE_MENU_API 后改为接口获取
   * （dev 设为 mock 即走 build/mock，见 src/api/menu.ts）
   */
  menu: import.meta.env.VITE_MENU_API ? fetchMenus : menus,
  /** 默认主题：'light' | 'dark'（用户切换后以本地存储优先） */
  defaultThemeMode: 'light',
  /** 默认主题色（可在设置抽屉中切换，切换后以本地存储优先） */
  colorPrimary: '#415fff',
  /** 本地偏好存储 key（主题等），登录页与布局共用 */
  storageKey: 'smartai-layout',
  /** 点击 Logo 跳转路径 */
  homePath: '/dashboard',
  /** 是否展示多页签导航栏（移动端自动隐藏） */
  showTabs: true,
  /** 是否展示面包屑（仅 vertical 模式顶栏展示，可在设置抽屉中切换） */
  showBreadcrumb: true,
  /** 是否展示页脚 */
  showFooter: true,
  /** 是否展示内容区水印（可在设置抽屉中切换） */
  showWatermark: false,
  /** 右上角用户信息（头像下拉展示） */
  userInfo: currentUser,
  /** 退出登录（接入真实登录后替换为清空凭证并跳转登录页） */
  onLogout: () => {
    window.location.href = '/';
  },
};
