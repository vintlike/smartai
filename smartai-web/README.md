# smartai-web

基于 React 19 + TypeScript + Vite + Ant Design 的**通用后台框架**。

`layout`、`i18n`、`theme`、`menu` 四个模块与业务完全解耦，统一放在 `src/framework`，通过 Provider 对外提供能力；业务层只需要提供「菜单接口」和「页面组件」。

## 快速开始

```bash
pnpm install
pnpm dev      # http://localhost:5173
pnpm build    # 类型检查 + 生产构建
```

默认使用 `src/services/mock-menu.ts` 里的本地菜单数据。配置真实接口：

```bash
cp .env.example .env
# 编辑 .env
VITE_MENU_API=/api/system/menu/list
```

## 目录结构

```
src/
├── framework/                 # 通用框架（不含任何业务逻辑）
│   ├── config/                # 主题色板、布局默认值、Logo 默认配置
│   ├── i18n/                  # I18nProvider + 中英文语言包
│   ├── theme/                 # ThemeProvider（亮/暗、主题色、antd 集成）
│   ├── menu/                  # MenuProvider、菜单归一化、图标、菜单项构建
│   ├── layout/                # LayoutProvider、BasicLayout、Header/Sider/Tabs/设置抽屉
│   ├── styles/                # 框架样式
│   └── index.ts               # 框架统一出口
├── router/                    # 动态路由生成 + 页面组件注册
├── services/                  # 菜单接口（真实接口 / mock）
├── pages/                     # 业务页面，路径与菜单 component 一一对应
└── App.tsx                    # Provider 装配
```

## 框架能力

### 1. 菜单与路由

- 支持多级菜单，自动补全完整路径，自动展开并高亮父级菜单。
- 菜单由接口返回，`MenuProvider` 完成归一化、排序、过滤（`show: false`、`type: 'button'`、`meta.hideInMenu`）。
- `component` 与 `src/pages` 下的文件路径约定映射：

| 菜单 component        | 页面文件                          |
| --------------------- | --------------------------------- |
| `/chat/index`         | `src/pages/chat/index.tsx`        |
| `/aigc/model/index`   | `src/pages/aigc/model/index.tsx`  |
| `Layout`              | 分组节点，不渲染页面              |

找不到页面文件时会渲染「页面组件未找到」提示，而不是白屏。

菜单接口返回结构（节选）：

```json
[
  {
    "id": "a2ccfe694cd91cf159ad35626e4ea202",
    "parentId": "0",
    "name": "AIGC应用",
    "path": "app",
    "type": "menu",
    "component": "Layout",
    "perms": "app",
    "meta": { "title": "AIGC应用", "icon": "PaperPlaneOutline" },
    "orderNo": 1,
    "disabled": false,
    "isExt": false,
    "keepalive": true,
    "show": true,
    "children": []
  }
]
```

说明：

- `path` 支持子级已带父级前缀（如 `aigc` + `aigc/embed-store`）。
- `icon` 支持 iconify 名称（`mdi:home`）或后端常见写法（`PaperPlaneOutline` → `ion:paper-plane-outline`），可通过 `MenuProvider` 的 `iconPrefix` 修改前缀。
- `meta.localeKey` 可选，存在且命中语言包时菜单标题走 i18n。
- `isExt: true` 或 `path` 为 URL 时按外链处理（新窗口打开）。
- `disabled`、`keepalive` 字段已解析并保留，keepalive 暂未做页面缓存。

### 2. Logo

在 `LayoutProvider` 上传入 `logo`，或在 `src/framework/config/logo.ts` 中修改默认值：

```tsx
<LayoutProvider
  logo={{
    src: '/logo.svg',
    title: 'SmartAI',
    showTitle: true,
    showTitleWhenCollapsed: false,
    href: '/',
  }}
>
```

`icon` 可传入自定义 ReactNode，优先级高于 `src`。

### 3. 主题与设置抽屉

顶栏右侧设置按钮打开抽屉，包含：

- 主题风格：亮色 / 暗黑（`themeModes`）
- 菜单模式：左侧 / 顶部 / 混合（`layoutModes`）
- 主题色：`themeColors` 色板 + 自定义取色
- 界面显示：多标签页、面包屑、菜单收起
- 语言：简体中文 / English

主题色板、UI 色卡、报表色卡位于 `src/framework/config/theme.ts`。

同一文件中的 `lightThemeToken` / `darkThemeToken` 是亮暗主题的设计令牌，由 `ThemeProvider` 按当前模式映射到两处：

- antd `ConfigProvider.theme.token`：`colorBgLayout`、`colorBgContainer`、`colorBgElevated`、`colorBorder`、`colorBorderSecondary`、`colorSplit`
- 全局 CSS 变量：`--sa-color-bg-layout`、`--sa-color-bg-container`、`--sa-color-bg-elevated`、`--sa-color-border(-secondary)`、`--sa-scrollbar-thumb/track/width/gutter`

`scrollbarColor` 支持 `滑块颜色` 或 `滑块颜色 轨道颜色` 两种写法。业务组件可直接使用 `useTheme().themeToken` 获取当前令牌。

暗色令牌的 `colorBgLayout` 与 `colorBgElevated` 同为 `#010e1a`，因此 `Segmented` 的轨道用 `colorBgLayout`、选中块用 `colorBgContainer`，避免选中态不可辨识。

### 4. 菜单收起

左侧菜单模式支持顶栏按钮收起 / 展开，也支持设置抽屉中的开关；窄屏（< lg）自动收起。

### 5. Provider API

```tsx
<BrowserRouter>
  <I18nProvider messages={businessMessages} defaultLocale="zh-CN">
    <ThemeProvider defaultSettings={{ mode: 'light' }}>
      <MenuProvider request={fetchMenuList} iconPrefix="ion">
        <LayoutProvider>
          <AppRouter />
        </LayoutProvider>
      </MenuProvider>
    </ThemeProvider>
  </I18nProvider>
</BrowserRouter>
```

| Provider          | 主要能力                                             |
| ----------------- | ---------------------------------------------------- |
| `I18nProvider`    | 语言包合并、`t` / `has`、语言持久化                  |
| `ThemeProvider`   | 亮暗主题、主题色、antd `ConfigProvider` 集成         |
| `MenuProvider`    | 菜单请求、归一化、菜单链查询、路由高亮数据           |
| `LayoutProvider`  | 菜单模式、收起状态、多 Tab、设置抽屉                 |

对应的 hooks：`useI18n`、`useTheme`、`useMenu`、`useLayout`、`useMenuTitle`。

### 6. 国际化

```tsx
const { t, locale, setLocale } = useI18n()
t('layout.settings.title')          // 支持 {name} 插值
```

业务语言包通过 `I18nProvider` 的 `messages` 传入，会与框架语言包深度合并：

```tsx
const businessMessages = {
  'zh-CN': { business: { title: '业务标题' } },
  'en-US': { business: { title: 'Business Title' } },
}
```

### 7. 持久化

| key                        | 内容                       |
| -------------------------- | -------------------------- |
| `smartai:theme-settings`   | 主题风格、主题色           |
| `smartai:layout-settings`  | 菜单模式、收起、Tab、面包屑 |
| `smartai:locale`           | 当前语言                   |

可通过各 Provider 的 `storageKey` 覆盖。

## 接入业务

1. 在 `src/pages` 下按菜单 `component` 创建页面（默认导出 React 组件）。
2. 在 `src/services/menu.ts` 中替换为真实菜单接口（或配置 `VITE_MENU_API`）。
3. 需要扩展语言包、色板、Logo 时，分别使用 `I18nProvider.messages`、`config/theme.ts`、`LayoutProvider.logo`。

## 技术栈

- React 19 / TypeScript / Vite
- Ant Design 6（主题算法、组件）
- React Router 7（动态路由）
- Iconify（菜单图标）+ Lucide（框架图标）
- Biome / Oxlint
