import type { ComponentType, LazyExoticComponent, ReactNode } from 'react';

/**
 * 菜单项：布局框架与业务之间唯一约定的菜单数据结构。
 * 静态配置、接口返回（经转换后）都统一使用该结构。
 */
export interface AppMenuItem {
  /** 唯一标识，默认可与路由路径一致 */
  key: string;
  /** 菜单文字 */
  label: ReactNode;
  /** 菜单图标 */
  icon?: ReactNode;
  /** 跳转路径，缺省时使用 key；纯分组节点可不设置 */
  path?: string;
  /** 是否为外链（点击后新窗口打开 path） */
  external?: boolean;
  /** 是否隐藏：不渲染到菜单中，但仍参与路由生成 */
  hidden?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 页面组件标识：与页面组件映射表（PageComponentMap）的 key 对应 */
  component?: string;
  /** 子菜单 */
  children?: AppMenuItem[];
}

/** 菜单来源：静态数组，或异步加载函数（如从接口获取） */
export type MenuSource = AppMenuItem[] | (() => Promise<AppMenuItem[]>);

/** 菜单模式：vertical-侧边栏菜单 / horizontal-顶部菜单 / blend-顶部+侧边栏混合菜单 */
export type MenuMode = 'vertical' | 'horizontal' | 'blend';

/** 主题模式：浅色 / 深色 */
export type ThemeMode = 'light' | 'dark';

/** 界面语言：简体中文 / 英文 */
export type Locale = 'zh-CN' | 'en-US';

/** 右上角头像对应的用户信息（框架不感知业务，数据由接入方提供） */
export interface AppUserInfo {
  /** 用户昵称 */
  name?: ReactNode;
  /** 登录账号 */
  account?: string;
  /** 头像图片地址 */
  avatar?: string;
  /** 附加描述（角色、邮箱等，展示在下拉信息区） */
  description?: ReactNode;
}

/** 主题色选项（设置抽屉中的色板项） */
export interface ThemeColorOption {
  /** 色值 */
  color: string;
  /** 名称 */
  title: string;
  /** 描述（色块 Tooltip 展示） */
  description?: string;
  /** 是否禁用（禁用项不展示在色板中） */
  disabled?: boolean;
}

/** 页面组件：支持 ReactNode（已实例化的元素）或组件类型（含懒加载组件） */
export type PageComponent = ReactNode | ComponentType | LazyExoticComponent<ComponentType>;

/** 布局配置：接入新项目时唯一需要关心的配置对象 */
export interface LayoutConfig {
  /** 系统标题 */
  title?: ReactNode;
  /** Logo 节点（图片、图标、文字均可） */
  logo?: ReactNode;
  /** 侧边栏折叠时展示的 Logo（缺省回退到 logo） */
  collapsedLogo?: ReactNode;
  /** 菜单模式，默认 vertical */
  menuMode?: MenuMode;
  /** 菜单数据：静态数组或异步函数（接口获取） */
  menu: MenuSource;
  /** 默认主题，默认 light；用户切换后以本地存储优先 */
  defaultThemeMode?: ThemeMode;
  /** 默认主题色（用户切换后以本地存储优先） */
  colorPrimary?: string;
  /** 主题色候选列表（设置抽屉色板），缺省使用框架内置色板 */
  themeColors?: ThemeColorOption[];
  /** 本地偏好存储 key（主题等），默认 smartai-web */
  storageKey?: string;
  /** 默认界面语言，默认 zh-CN；用户切换后以本地存储优先 */
  defaultLocale?: Locale;
  /** 当前语言缺词时的兜底语言，默认 zh-CN */
  fallbackLocale?: Locale;
  /** 业务词条覆盖：同 key 优先于框架内置词条 */
  i18nMessages?: Partial<Record<Locale, Record<string, string>>>;
  /** 点击 Logo 跳转路径，默认 / */
  homePath?: string;
  /** 侧边栏宽度，默认 220 */
  siderWidth?: number;
  /** 侧边栏折叠宽度，默认 64 */
  collapsedWidth?: number;
  /** 是否展示页脚，默认 true；设置抽屉可切换，切换后以本地存储优先 */
  showFooter?: boolean;
  /** 是否展示多页签导航栏，默认 false；设置抽屉可切换，切换后以本地存储优先 */
  showTabs?: boolean;
  /** 是否展示面包屑，默认 true；设置抽屉可切换，切换后以本地存储优先 */
  showBreadcrumb?: boolean;
  /** 是否展示内容区水印，默认 false；设置抽屉可切换，切换后以本地存储优先 */
  showWatermark?: boolean;
  /** 水印文案，默认取 title 的纯文本，再兜底 SmartAI */
  watermarkContent?: string;
  /** 页脚内容，缺省展示版权文案 */
  footerContent?: ReactNode;
  /** 头部右侧自定义操作区 */
  headerActions?: ReactNode;
  /** 设置抽屉自定义内容，缺省使用内置面板（布局 / 界面显示 / 主题） */
  settingsContent?: ReactNode;
  /** 右上角用户信息（头像下拉展示），缺省仅显示默认头像 */
  userInfo?: AppUserInfo;
  /** 点击「个人中心」回调，不传则不展示该菜单项 */
  onProfile?: () => void;
  /** 退出登录回调（点击头像下拉中的退出项时触发） */
  onLogout?: () => void;
}
