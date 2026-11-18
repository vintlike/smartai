# SmartAI-Web 全量复现提示词（可直接用于生成一模一样的项目）

> **用法**：把全文作为一次性输入交给具备文件写入能力的编码代理，即可从零生成结构、交互、样式一致的项目。
> 若模型单次输出受限，按文末《分阶段生成指令》分 3 轮执行，每轮结束先跑 `pnpm check` 与 `pnpm build` 再进入下一轮。
> **铁律**：严格遵守本文给出的文件路径、导出名、类名、文案、数值、token 值。不要"优化"命名，不要引入 Redux / axios / CSS-in-JS，不要把内联样式换成 less。

---

## 0. 项目定位

一个纯前端 AIGC 应用管理平台 SPA（react + vite + antd），全部数据来自本地 mock（仅"模型供应商管理"接真实接口）。
核心价值是**一套与业务完全解耦、可整体复用的布局框架**（framework）+ **可配置菜单驱动路由**（config）。

- 产品名：`AI 智能平台`（document.title 与顶栏标题一致）
- 语言：简体中文界面（含中英切换）
- 目标视口：桌面优先，768px 以下走移动端抽屉菜单
- 开发端口：`3344`；后端代理：`/api` → `http://localhost:8080`

## 1. 技术栈（版本必须一致）

运行时依赖：
| 依赖 | 版本 |
| --- | --- |
| react / react-dom | ^19.2.8 |
| react-router-dom | ^7.15.1 |
| antd | ^6.4.3 |
| @ant-design/icons | ^6.2.3 |
| echarts | ^6.1.0 |
| echarts-for-react | ^3.0.6 |
| @chenglou/pretext | ^1.0.0 |

开发依赖：
`@biomejs/biome ^2.5.13`、`vite ^8.3.0`、`typescript ~6.0.2`、`@vitejs/plugin-react ^6.1.1`、`unocss ^66.11.0`、`@unocss/preset-attributify ^66.11.0`、`@unocss/transformer-attributify-jsx ^66.11.0`、`less ^4.9.1`、`husky`、`lint-staged`、`commitlint + @commitlint/config-conventional`、`czg`、`@types/node`、`@types/react`、`@types/react-dom`。

**禁止**：redux / @reduxjs/toolkit / axios / styled-components / classnames / ahooks / vite-plugin-fake-server / svgr。
状态一律用 Context + useState，请求一律用原生 fetch，样式一律用 UnoCSS 原子类 + CSS 变量 + 两个 less 文件。

## 2. 目录结构（逐文件生成，不得增减顶层目录）

```
smartai-web/
├─ build/vite/
│  ├─ build.ts
│  ├─ plugins.ts
│  ├─ resolve.ts
│  └─ server.ts
├─ public/
│  ├─ favicon.svg
│  └─ logo.svg
├─ src/
│  ├─ api/
│  │  ├─ aigc.ts
│  │  ├─ http.ts
│  │  ├─ menu.ts
│  │  └─ system.ts
│  ├─ components/
│  │  └─ PageContainer.tsx
│  ├─ config/
│  │  ├─ layout.config.tsx
│  │  ├─ menu.config.tsx
│  │  └─ pageComponents.tsx
│  ├─ framework/
│  │  ├─ i18n/{I18nProvider.tsx,locales.ts}
│  │  ├─ layout/
│  │  │  ├─ AppLayout.tsx
│  │  │  ├─ AppLayoutProvider.tsx
│  │  │  ├─ styles.less
│  │  │  └─ components/
│  │  │     ├─ AppHeader.tsx
│  │  │     ├─ AppLocaleSwitch.tsx
│  │  │     ├─ AppLogo.tsx
│  │  │     ├─ AppMenu.tsx
│  │  │     ├─ AppSettingDrawer.tsx
│  │  │     ├─ AppSider.tsx
│  │  │     ├─ AppTabs.tsx
│  │  │     ├─ AppThemeSwitch.tsx
│  │  │     └─ AppUserAvatar.tsx
│  │  ├─ menu/{MenuProvider.tsx,MenuUtil.ts,routes.tsx}
│  │  ├─ theme/{colors.ts,ThemeProvider.tsx,tokens.ts}
│  │  ├─ index.ts
│  │  └─ types.ts
│  ├─ pages/
│  │  ├─ aigc-app/
│  │  │  ├─ AIApp.tsx
│  │  │  ├─ AIAppConfig.tsx
│  │  │  ├─ AIChat.tsx
│  │  │  ├─ mockData.ts
│  │  │  ├─ types.ts
│  │  │  └─ components/{ApiChannelDrawer.tsx,AppCard.tsx,AppFormModal.tsx}
│  │  ├─ aigc-platform/
│  │  │  ├─ Billing.tsx
│  │  │  ├─ ConversationManage.tsx
│  │  │  ├─ KnowledgeData.tsx
│  │  │  ├─ KnowledgeManage.tsx
│  │  │  ├─ ModelManage.tsx
│  │  │  ├─ ProviderManage.tsx
│  │  │  ├─ VectorManage.tsx
│  │  │  ├─ mockData.ts
│  │  │  ├─ types.ts
│  │  │  └─ components/{ChatModelTab.tsx,EmbeddingModelTab.tsx,ImageModelTab.tsx,KnowledgeCard.tsx,KnowledgeFormModal.tsx,SupplierFormModal.tsx}
│  │  ├─ permission/{DepartmentManage.tsx,MenuManage.tsx,RoleManage.tsx,UserManage.tsx,mockData.ts,types.ts}
│  │  ├─ system/{LogManage.tsx,SystemConfig.tsx,TokenManage.tsx,mockData.ts,types.ts}
│  │  ├─ Dashboard.tsx
│  │  └─ NotFound.tsx
│  ├─ router/index.tsx
│  ├─ App.tsx
│  ├─ index.less
│  └─ main.tsx
├─ .husky/{commit-msg,pre-commit}
├─ scripts/prepare-hooks.mjs
├─ biome.json
├─ commitlint.config.js
├─ index.html
├─ package.json
├─ tsconfig.json / tsconfig.app.json / tsconfig.node.json
├─ unocss.config.ts
└─ vite.config.ts
```

命名与组织约束：
- `src/framework/**` 不得 import 任何 `@/pages`、`@/api`、`@/config` 内容（与业务零耦合，必须可整目录复制到其他项目）。
- 业务侧只允许通过 `src/config/layout.config.tsx` 一个对象接入框架。
- 组件文件一律 PascalCase + `.tsx`；工具/类型/常量文件 camelCase 或 `types.ts`；每个页面/组件默认导出，框架层用命名导出并统一从 `framework/index.ts` 汇总。

## 3. 工程配置

### 3.1 `vite.config.ts`
```ts
import type { UserConfig } from 'vite';
import build from './build/vite/build.ts';
import plugins from './build/vite/plugins.ts';
import resolve from './build/vite/resolve.ts';
import server from './build/vite/server.ts';

export default (): UserConfig => ({ resolve, plugins, server, build });
```

`build/vite/plugins.ts`：`[react(), UnoCSS()]`
`build/vite/resolve.ts`：`alias: { '@': path.resolve(import.meta.dirname, '../../src') }`（必须用 `import.meta.dirname`，不要用 `__dirname`）
`build/vite/server.ts`：`{ host: '0.0.0.0', port: 3344, open: false, proxy: { '/api': { target: 'http://localhost:8080', changeOrigin: true } } }`
`build/vite/build.ts`：
```ts
export default {
  outDir: 'dist',
  assetsDir: 'assets',
  sourcemap: false,
  chunkSizeWarningLimit: 1500,
  rollupOptions: {
    output: {
      codeSplitting: {
        groups: [
          { name: 'react-vendor', test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom)[\\/]/ },
          { name: 'antd-vendor', test: /[\\/]node_modules[\\/](antd|@ant-design|@rc-component|rc-[^\\/]+)[\\/]/ },
          { name: 'echarts-vendor', test: /[\\/]node_modules[\\/](echarts|echarts-for-react|zrender)[\\/]/ },
        ],
      },
    },
  },
};
```

### 3.2 `unocss.config.ts`
- shortcuts：`center: 'flex items-center justify-center'`、`itemCenter: 'absolute left-50% top-50% transform -translate-x-50% -translate-y-50%'`
- theme.colors：primary `#409eff`、success `#0ac17e`、danger `#ff3c31`、warning `#fc8519`、info `#72caed`、textColorPrimary `#353535`、textColorRegular `#666`、textColorSecondary `#999`、borderColor `#f0f0f0`、titleColor `#727272`
- transformers：`transformerVariantGroup(), transformerDirectives(), transformerAttributifyJsx()`
- presets：`presetUno(), presetAttributify(), presetIcons({ scale: 1.2, cdn: 'https://esm.sh/' }), presetTypography()`

### 3.3 TypeScript
`tsconfig.app.json`：target `es2023`、lib `["ES2023","DOM","DOM.Iterable"]`、module `esnext`、types `["vite/client"]`、paths `{"@/*":["./src/*"]}`、`allowArbitraryExtensions`、`skipLibCheck`、`moduleResolution: "bundler"`、`allowImportingTsExtensions`、`verbatimModuleSyntax`、`moduleDetection: "force"`、`noEmit`、`jsx: "react-jsx"`、`strict`、`noUnusedLocals`、`noUnusedParameters`、`erasableSyntaxOnly`、`noFallthroughCasesInSwitch`、`noUncheckedSideEffectImports`；include `["src"]`，tsBuildInfoFile `./node_modules/.tmp/tsconfig.app.tsbuildinfo`。
`tsconfig.json` 为 solution 式引用 app / node 两个配置。

### 3.4 Biome（`biome.json`）
- 格式化：space、2 空格、lf、lineWidth 100、bracketSpacing、trailingNewline
- JS：单引号、分号 always、尾逗号 all、`jsxQuoteStyle: "double"`、`arrowParentheses: "always"`、`bracketSameLine: false`
- linter preset recommended，`noUnusedImports`/`noUnusedVariables` 为 error
- overrides `src/pages/**` 关闭：`a11y.noStaticElementInteractions`、`a11y.useKeyWithClickEvents`、`suspicious.noExplicitAny`、`suspicious.noArrayIndexKey`、`style.noNonNullAssertion`、`correctness.useExhaustiveDependencies`
- assist：`source.organizeImports: "on"`

### 3.5 `package.json` scripts
```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "lint": "biome lint .",
  "lint:fix": "biome lint --write .",
  "format": "biome format .",
  "format:fix": "biome format --write .",
  "check": "biome check .",
  "check:fix": "biome check --write .",
  "prepare": "node scripts/prepare-hooks.mjs",
  "cz": "czg"
}
```
`scripts/prepare-hooks.mjs`：因项目位于 monorepo 子目录，husky 的 `.git` 在上层，需用 `git rev-parse --git-path hooks` 定位 hooks 目录并写入 `core.hooksPath`，同时确保 `.husky/commit-msg`（`npx --no -- commitlint --edit $1`）与 `.husky/pre-commit`（`npx lint-staged`）可执行。

### 3.6 `index.html`
`lang="zh-CN"`、`<title>AI 智能平台</title>`、favicon `/favicon.svg`、`viewport`、`<div id="root">`、`<script type="module" src="/src/main.tsx">`。

### 3.7 `src/main.tsx`
导入顺序固定：`antd/dist/reset.css` → `./index.less` → `virtual:uno.css`；`StrictMode` 包裹 `<App />`；找不到 `#root` 时抛 `未找到 #root 挂载节点`。

## 4. 类型契约（`src/framework/types.ts`，逐字段保留注释语义）

```ts
AppMenuItem {
  key: string;            // 唯一标识，默认可与路由路径一致
  label: ReactNode;
  icon?: ReactNode;
  path?: string;          // 缺省用 key
  external?: boolean;     // 外链新窗口
  hidden?: boolean;       // 不渲染菜单，但仍生成路由
  disabled?: boolean;
  component?: string;     // 对应 PageComponentMap 的 key
  children?: AppMenuItem[];
}
MenuSource = AppMenuItem[] | (() => Promise<AppMenuItem[]>)
MenuMode = 'vertical' | 'horizontal' | 'blend'
ThemeMode = 'light' | 'dark'
Locale = 'zh-CN' | 'en-US'
AppUserInfo { name?: ReactNode; account?: string; avatar?: string; description?: ReactNode }
ThemeColorOption { color: string; title: string; description?: string; disabled?: boolean }
PageComponent = ReactNode | ComponentType | LazyExoticComponent<ComponentType>
LayoutConfig {
  title?: ReactNode;
  logo?: ReactNode;
  collapsedLogo?: ReactNode;
  menuMode?: MenuMode;              // 默认 vertical
  menu: MenuSource;                 // 必填
  defaultThemeMode?: ThemeMode;     // 默认 light
  colorPrimary?: string;
  themeColors?: ThemeColorOption[];
  storageKey?: string;              // 默认 'smartai-web'
  homePath?: string;                // 默认 '/'
  siderWidth?: number;              // 默认 220
  collapsedWidth?: number;          // 默认 64
  showFooter?: boolean;             // 默认 true
  showTabs?: boolean;               // 默认 false
  footerContent?: ReactNode;
  headerActions?: ReactNode;
  settingsContent?: ReactNode;
  userInfo?: AppUserInfo;
  onLogout?: () => void;
}
```

## 5. Provider 组装与布局骨架

### 5.1 组装顺序（`framework/layout/AppLayout.tsx`，顺序不可换）
```
I18nProvider(storageKey)
└ ThemeProvider(defaultMode, colorPrimary, storageKey)
  └ AppLayoutProvider(config)
    └ MenuProvider(source = config.menu)
      └ LayoutShell
```
`LayoutShell` 内：
```
<Layout className="app-layout" hasSider={showSider && !isMobile}>
  {showSider && <AppSider />}
  <Layout>
    <AppHeader />
    <Content className="app-layout-content">
      {showTabs && !isMobile && <AppTabs />}
      <div className="app-layout-page"><Outlet /></div>
    </Content>
    {showFooter !== false && <Footer className="app-layout-footer">{footerContent ?? `© ${year} SmartAI`}</Footer>}
  </Layout>
</Layout>
```
其中 `showSider = menuMode !== 'horizontal' || isMobile`，`year = new Date().getFullYear()`。
内容区高度链必须成立：`html/body/#root` 100% → `.app-layout` 100% → `.app-layout-content` flex:1 min-height:0 overflow:hidden → `.app-layout-page` flex:1 min-height:0 overflow-y:auto；否则聊天页 `h-full` 会失效。

### 5.2 布局状态（`AppLayoutProvider`）
Context 暴露：`config, menuMode, setMenuMode, collapsed, setCollapsed, toggleCollapsed, showTabs, setShowTabs, isMobile, mobileMenuOpen, setMobileMenuOpen`。

- 断点：`MOBILE_BREAKPOINT = 768`，用 `window.matchMedia('(max-width: 767px)')` + `change` 监听；初值 `window.innerWidth < 768`。
- 初始化优先级：localStorage > config 值 > 默认值。
- 写回策略：`setMenuMode` / `setCollapsed` / `setShowTabs` 同时写 localStorage。
- 外部配置变化：`config.menuMode`、`config.showTabs` 用 `useRef` 记录上一次值，**跳过首次挂载**（保证用户本地偏好优先），变化时才 setState 并写 localStorage。
- `isMobile` 变为 true 时自动 `setMobileMenuOpen(false)`。
- `useLayout()` 在 Provider 外使用时抛 `useLayout 必须在 AppLayoutProvider 内使用`。

### 5.3 localStorage key 表（storageKey 默认 `smartai-web`）
| 键 | 值 | 写入方 |
| --- | --- | --- |
| `${k}-theme` | `light` / `dark` | ThemeProvider |
| `${k}-color` | 十六进制色值 | ThemeProvider |
| `${k}-locale` | `zh-CN` / `en-US` | I18nProvider |
| `${k}-collapsed` | `true` / `false` | AppLayoutProvider |
| `${k}-menu-mode` | `vertical` / `horizontal` / `blend` | AppLayoutProvider |
| `${k}-show-tabs` | `true` / `false` | AppLayoutProvider |
| `${k}-tabs` | JSON 字符串数组（页签路径） | AppTabs |

`greyMode` / `weakMode` 不持久化，刷新即失效。

## 6. 菜单系统

### 6.1 三种模式 × 三种变体
| 菜单模式 | 桌面渲染 | 移动端渲染 |
| --- | --- | --- |
| `vertical` | 侧边栏 `AppMenu variant="vertical"`（完整树）+ 头部折叠按钮 | 抽屉（左侧）+ 头部按钮开抽屉，菜单仍为 vertical |
| `horizontal` | 不渲染侧边栏；顶栏 = Logo + `AppMenu variant="horizontal"`（完整树，可下拉子菜单） | 抽屉 + 头部按钮（`MenuOutlined`） |
| `blend` | 侧边栏 = `AppMenu variant="blend"`（仅当前一级菜单的子项）；顶栏 = `AppMenu variant="horizontal" topLevelOnly` | 抽屉 + 头部按钮 |

- 顶栏在 `horizontal`/`blend` 且非移动端才显示菜单；`vertical` 用 `.app-layout-header-spacer` 占位把操作区推到右侧。
- `horizontal` 且非移动端才显示顶栏 Logo（`vertical`/`blend` 的 Logo 在侧边栏顶部）。
- `AppMenu` 的 `loading` 为 true 时渲染居中 `<Spin size="small" />`（容器 `.app-layout-menu-loading`）。
- 非 horizontal 变体传 `openKeys` 与 `onOpenChange={setOpenKeys}`；horizontal 不传（交给 antd 内部）。
- antd Menu 参数：`mode = horizontal ? 'horizontal' : 'inline'`，`theme = isDark ? 'dark' : 'light'`，类名 `app-layout-top-menu` / `app-layout-inline-menu`。
- 高亮：普通变体用 `selectedKey`；`horizontal + topLevelOnly` 用 `activeTopKey`。
- 点击：`horizontal + topLevelOnly` → `navigateByTopKey(key)`；其余 → `navigateByKey(key)`。

### 6.2 菜单树工具（`MenuUtil.ts`，全部纯函数，必须保留）
- `flattenMenu(items)`：深度优先展平。
- `getItemPath(item)`：`item.path ?? item.key`。
- `findMenuItem(items, key)`：深度优先查找。
- `findAncestorKeys(items, key, parents=[])`：返回自顶向下的祖先 key 数组。
- `findFirstLeaf(item)`：跳过 `hidden` 子节点递归找第一个叶子；子项全隐藏时，自身有 `component` 则返回自身。
- `resolveSelectedKey(items, pathname)`：
  1. 展平并排除 `external`，路径精确相等 → 返回该 key；
  2. 含 `:param` 的路径（`pathToPattern` 把 `:x` 段转为 `[^/]+`，其余段转义，锚定 `^...$`）：命中后若该菜单不隐藏 → 返回自身 key；若隐藏（详情页）→ 用 `findVisibleLeafAncestorKey` 向上找最近的、可见且没有可见子项的祖先 key；
  3. 最长前缀匹配：`pathname === path || pathname 以 path + '/' 开头`，取路径最长者。
- `findVisibleLeafAncestorKey`（内部）：从最近祖先往前，跳过 hidden 祖先；若某祖先没有"非 hidden 且非 external"的子项则返回它。
- `resolveTopKey(items, key)`：key 是一级则返回自身，否则返回其所属一级 key。
- `resolveTabTitle(items, pathname)`：精确路径 → 动态段路径 → 回退 pathname；返回菜单 `label`（因此菜单文案变更后页签标题自动同步）。
- `toAntdMenuItems(items)`：过滤 hidden，递归 children，空 children 置 undefined。

### 6.3 菜单数据加载（`MenuProvider`）
- `source` 为数组：直接使用，`loading=false`。
- `source` 为函数：`loading=true`，调用并 `setMenus(data ?? [])`，失败 `console.error('[layout] 菜单加载失败：', error)`；用 `cancelled` 标记避免卸载后 setState。
- `topItems`：一级菜单去掉 children（只留 key/label/icon/disabled），供 blend 顶栏。
- `activeGroupItems`：`activeTopKey` 对应一级菜单的子项；无子项时返回自身单项。
- `navigateByKey` → 找到 item 后跳转；`item.external` 用 `window.open(path, '_blank', 'noopener,noreferrer')`，否则 `navigate(path)`。
- `navigateByTopKey` → `findFirstLeaf(item) ?? item` 后按上一条规则跳转。
- 路由变化时 `setOpenKeys(findAncestorKeys(menus, selectedKey))`，实现父级自动展开、同级自动收起。

### 6.4 菜单驱动路由（`menu/routes.tsx`）
- `PageComponentMap = Record<string, PageComponent>`。
- `renderPage(page)`：`typeof page === 'function'` **或** `typeof page === 'object' && page !== null && '$$typeof' in page`（覆盖 `lazy`、`forwardRef` 等 exotic 组件对象）→ `createElement(page)`；其余按 ReactNode 原样返回。**这一条必须照抄，漏了 lazy 会直接渲染报错。**
- `buildMenuRoutes(menus, pageComponents, fallback?)`：递归 walk，先处理 children 再处理自身；无 `component` 跳过；映射缺失时 `console.warn('[layout] 菜单 ${key} 未找到组件映射：${component}')` 并跳过；命中的路由为 `{ path: getItemPath(item), element: <Suspense fallback={fallback ?? <PageLoading/>}>{renderPage(page)}</Suspense> }`。
- `PageLoading`：`display:flex; justify-content:center; padding:80px 0` + `<Spin />`。
- 注意：路由 path 保留 `:param` 原名（react-router 7 直接可识别）。

## 7. 多页签（`AppTabs.tsx`）

渲染条件：`showTabs && !isMobile`（由 LayoutShell 控制）；桌面端固定在内容区顶部，不随页面滚动。

- 状态：`tabs: string[]`（初值从 `${k}-tabs` 读取：JSON 解析失败返回 `[]`；去重；过滤非字符串与 `'/'`）、`contextMenuKey`、`contextMenuPos`。
- 当前激活键 = `location.pathname`。
- 开签：pathname !== `'/'` 且不在列表时追加到末尾。
- 持久化：tabs 变化即 `localStorage.setItem(`${k}-tabs`, JSON.stringify(tabs))`。
- 关闭右键菜单：`contextMenuKey` 存在时给 `document` 挂 `click` 监听，点击任意处置空。
- 右键定位：在容器上监听 `contextmenu`，`(event.target).closest('[role="tab"]')` 命中才 `preventDefault()`；用 `Array.from(container.querySelectorAll('[role="tab"]')).indexOf(tabNode)` 与 `tabs` 下标对齐取路径；记录 `clientX/clientY`。
- 关闭单个：`tabs.length <= 1` 直接 return；关闭当前签时 `navigate(next[Math.min(index, next.length - 1)])`。
- 关闭其他：只留目标签，目标不是当前签则导航过去。
- 关闭左侧：`index <= 0` return；保留 `tabs.slice(index)`；当前签不在结果里则导航到目标签。
- 关闭右侧：保留 `tabs.slice(0, index + 1)`；当前签被波及则导航到目标签。
- 关闭全部：`tabs.length <= 1` return；保留第一个签并（必要时）导航过去。
- 右键菜单项（顺序与禁用条件固定）：
  1. `刷新` → `window.location.reload()`；
  2. `关闭` → `disabled: tabs.length <= 1`；
  3. `关闭其他标签` → `disabled: tabs.length <= 1`；
  4. `关闭左侧其他标签` → `disabled: index <= 0`；
  5. `关闭右侧其他标签` → `disabled: index === -1 || index >= tabs.length - 1`。
- 右上角：`tabBarExtraContent.right` 内两个 `type="text" size="small"` 按钮 —— 刷新（`ReloadOutlined`，title=刷新）与 `Dropdown`（`CaretDownFilled`）。下拉项 = `关闭全部标签`（disabled 同上）+ `divider` + 当前激活签的 5 项菜单。
- Tabs 参数：`hideAdd`、`activeKey=pathname`、`type = tabs.length > 1 ? 'editable-card' : 'card'`、`onChange=key => navigate(key)`、`onEdit` 仅 `remove` 时 closeTab、`closable: tabs.length > 1`、`items` 的 label 用 `resolveTabTitle(menus, path)`。
- 自定义右键菜单：`.app-layout-tabs-context` 绝对定位容器（`position: fixed; z-index: 1050; left/top = 鼠标坐标`）内放 antd `<Menu items={...} />`。

## 8. 顶栏 / 侧边栏 / Logo / 头像

### 8.1 `AppHeader`
结构顺序（从左到右）：折叠/抽屉按钮 → （horizontal 时）Logo → （horizontal/blend 且非移动）菜单 或 弹簧占位 → 操作区（`config.headerActions` → 主题切换 → 语言切换 → 设置 → 头像）。
- 折叠按钮显示条件：`menuMode !== 'horizontal' || isMobile`。
- 图标：`collapsed ? MenuUnfoldOutlined : MenuFoldOutlined`；移动端恒为 `MenuOutlined`。
- 点击：移动端 `setMobileMenuOpen(true)`，否则 `toggleCollapsed()`。
- 容器：antd `Header`，内联 `background: token.colorBgContainer`、`borderBottom: 1px solid token.colorBorderSecondary`、`color: token.colorText`。
- 设置按钮 `SettingOutlined` 外包 `Tooltip title="平台设置"`，点击打开同文件内的 `AppSettingDrawer`。

### 8.2 `AppSider`
- 移动端：`<Drawer placement="left" open={mobileMenuOpen} onClose size={siderWidth} closable={false} styles={{ body: { padding: 0, background: token.colorBgContainer, color: token.colorText } }}>`，内含 Logo + `.app-layout-sider-menu`（`AppMenu variant="vertical"`）。
- 桌面 `horizontal`：返回 `null`。
- 桌面其他：`<Sider collapsible collapsed trigger={null} width={220} collapsedWidth={64} theme={isDark ? 'dark' : 'light'} style={{ background: token.colorBgContainer, borderRight: 1px solid token.colorBorderSecondary }}>`；`variant = menuMode === 'blend' ? 'blend' : 'vertical'`。

### 8.3 `AppLogo`
`<button type="button">`，类名 `app-layout-logo`，折叠时追加 `is-collapsed`；`title` 仅在 `config.title` 为字符串时设置；点击 `navigate(config.homePath ?? '/')`；折叠时 logo 取 `collapsedLogo ?? logo`；标题仅展开态渲染，文字色 `token.colorText`（保证深色主题可见）。

### 8.4 `AppUserAvatar`
`Dropdown trigger={['click']} placement="bottomRight"` 包裹 `<button className="app-user-avatar-trigger">` 内 `Avatar size={32}`。
菜单项：① 禁用项 `user-info`（className `app-user-info-item`）：`Avatar size={40}` + 昵称（缺省"未命名用户"）+ 账号（可选）+ 描述（可选）；② `divider`；③ 仅当 `config.onLogout` 存在时追加 `退出登录`（LogoutOutlined），点击调用 `onLogout`。
头像内容：`userInfo.avatar` 优先，否则昵称首字，否则 `UserOutlined`。

## 9. 设置抽屉（`AppSettingDrawer`）

容器：`<Drawer title="平台设置" placement="right" size={320} open onClose>`；内容优先 `config.settingsContent`，否则内置面板。

内置面板（`.app-settings-panel`，纵向 flex，gap 16），并在根节点注入 5 个 CSS 变量：`--app-preview-primary: token.colorPrimary`、`--app-preview-bg: token.colorBgLayout`、`--app-preview-header: token.colorBgContainer`、`--app-preview-border: token.colorBorderSecondary`、`--app-preview-divider: token.colorBorder`。

1. `Divider` 文案「布局设置」（`marginTop: 0`）
2. 三张布局缩略图横排（`.app-layout-mode-list`，space-between，gap 12），顺序 `vertical` / `horizontal` / `blend`：
   - 外层 `<button className="app-layout-mode-item" aria-pressed={selected} aria-label={模式名}>` + `Tooltip`；
   - 缩略图 `.app-layout-mode-thumb`（80×60、`border: 2px solid var(--app-preview-border)` 常驻占位、radius 5、背景 `--app-preview-bg`、`box-shadow: 0 1px 2.5px 0 rgb(0 0 0 / 18%)`、overflow hidden、`transition: border-color .2s`）；选中加 `is-selected` → 边框切 `--app-preview-primary`；
   - 内部结构：非 horizontal 渲染 `.preview-sider`（左侧 30% 宽、主色）；vertical 渲染 `.preview-header-right`（右上 70%×30%、白底），其余渲染 `.preview-header-full`（顶部整宽 30%、主色）；
   - 下方 `.app-layout-mode-title` 12px 文案（左侧菜单模式 / 顶部菜单模式 / 混合菜单模式）。
3. 「显示页签栏」行（label + `Switch checked={showTabs} onChange={setShowTabs}`）
4. `Divider` 文案「主题设置」
5. 「深色模式」行：`Switch checked={isDark} checkedChildren={<MoonOutlined/>} unCheckedChildren={<SunOutlined/>} onChange={c => setThemeMode(c ? 'dark' : 'light')}`
6. 主题色块：小标题「主题色」（12px、opacity .65）；色板取 `(config.themeColors ?? defaultThemeColors).filter(c => !c.disabled)`；每项 24×24、radius 3、白字、`Tooltip` 内容 `描述 ? `${title} · ${description}` : title`；选中渲染 `CheckOutlined` 并加 `is-selected`；`aria-pressed`。
7. 「灰色模式」`Switch`（整站 `grayscale(100%)`）
8. 「色弱模式」`Switch`（整站 `invert(80%)`）

无障碍要求：所有 Switch/色块/缩略图都带 `aria-label`，缩略图与色块带 `aria-pressed`。

## 10. 主题体系

### 10.1 `ThemeProvider`
- 状态：`themeMode`（localStorage `${k}-theme` > defaultMode `light`）、`themeColor`（`${k}-color` > colorPrimary `#415fff`）、`greyMode`、`weakMode`。
- `toggleTheme`：`dark ↔ light`，并持久化。
- 副作用：`document.documentElement.dataset.theme = themeMode`；`classList.toggle('app-grey' / 'app-weakness')`。
- 注入 `ConfigProvider`：
  - `locale = locale === 'en-US' ? enUS : zhCN`（antd 语言包）
  - `theme.algorithm = isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm`
  - token：`colorPrimary`、`colorLink = themeColor`、`...uiColors`、`...(isDark ? darkThemeTokens : lightThemeTokens)`
- `useThemeMode()` 在 Provider 外抛 `useThemeMode 必须在 ThemeProvider 内使用`。

### 10.2 色值常量（`theme/colors.ts`）
- `colorPrimary = '#415fff'`
- `uiColors = { colorSuccess: '#0ac17e', colorError: '#ff3c31', colorWarning: '#fc8519', colorInfo: '#72caed' }`
- `defaultThemeColors`（14 项，顺序固定，后 3 项 `disabled: true`）：
  品牌蓝 `#415fff`、科技蓝 `#1890ff`、薄暮 `#f5222d`、火山 `#fa541c`、日暮 `#fa8c16`、青柠 `#a0d911`(禁)、金盏花 `#faad14`(禁)、日出 `#fadb14`(禁)、极光绿 `#52c41a`、明青 `#13c2c2`、拂晓蓝 `#1677ff`、极客蓝 `#2f54eb`、酱紫 `#722ed1`、法式洋红 `#eb2f96`
- `chartColors`：`[...new Set([colorPrimary, ...Object.values(uiColors)])]` 追加 `#9465bb, #7465f9, #78c77b, #e98248, #f4bef3, #4dbfff, #fc8518, #7086f1, #fba667, #b091f6, #e597c3, #809fff, #85c6cf, #76a6c9, #939ae5, #b0cac3, #7b82be, #7eb9aa, #ddb07a`

### 10.3 主题 token（`theme/tokens.ts`）
- light：`colorBgLayout '#f8f8fa'`、`colorBgContainer '#fff'`、`colorBorder/Secondary/Split '#f0f0f0'`
- dark：`colorBgLayout '#010e1a'`、`colorBgContainer '#011627'`、`colorBgElevated '#010e1a'`、`colorBorder/Secondary/Split '#1a3a5c'`

> 业务样式统一使用 antd v6 CSS 变量名，如 `var(--ant-color-primary)`、`var(--ant-color-primary-bg)`、`var(--ant-color-bg-container)`、`var(--ant-color-bg-layout)`、`var(--ant-color-border)`、`var(--ant-color-text)`、`var(--ant-color-text-secondary)`、`var(--ant-color-text-quaternary)`、`var(--ant-color-fill-tertiary)`、`var(--ant-color-bg-text-hover)`、`var(--ant-color-bg-text-secondary)`。

## 11. 国际化（`framework/i18n`）

- `Locale = 'zh-CN' | 'en-US'`；默认中文；持久化 `${k}-locale`；同步 `document.documentElement.lang`。
- `useI18n()` 无 Provider 时返回兜底上下文（中文），保证 ThemeProvider 可独立复用。
- `translate(locale, key)`：`messages[locale][key] ?? messages['zh-CN'][key] ?? key`。
- 文案字典（key 必须一一对应，中英齐全）：
  菜单：`menu.toggle` 切换菜单 / Toggle menu；
  主题：`theme.switch` 切换主题、`theme.toLight` 切换到浅色模式、`theme.toDark` 切换到深色模式、`theme.darkMode` 深色模式；
  设置：`settings.title` 平台设置、`settings.layout` 布局设置、`settings.theme` 主题设置、`settings.themeColor` 主题色、`settings.greyMode` 灰色模式、`settings.weakMode` 色弱模式、`settings.showTabs` 显示页签栏；
  菜单模式：`menuMode.vertical` 左侧菜单模式、`menuMode.horizontal` 顶部菜单模式、`menuMode.blend` 混合菜单模式；
  语言：`locale.toEnglish` 切换到英文、`locale.toChinese` 切换到中文；
  用户：`user.defaultName` 未命名用户、`user.logout` 退出登录；
  页签：`tabs.refresh` 刷新、`tabs.close` 关闭、`tabs.closeOthers` 关闭其他标签、`tabs.closeLeft` 关闭左侧其他标签、`tabs.closeRight` 关闭右侧其他标签、`tabs.closeAll` 关闭全部标签。
- 语言切换按钮（`AppLocaleSwitch`）：文字标识 `中` / `En`，点击**直接切换**（不做下拉），Tooltip 提示"即将切换到的语言"；按钮类名 `app-locale-switch`，less 中 `min-width: 36px; padding-inline: 8px; font-weight: 500`（防止宽度变化挤动相邻图标）。

## 12. 全局样式与页面容器

### 12.1 `src/index.less`（全文照抄，顺序不可变）
```less
* { margin: 0; padding: 0; box-sizing: border-box; }

html, body, #root { height: 100%; }

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
    'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code { font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace; }

::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track,
::-webkit-scrollbar-corner,
::-webkit-scrollbar-track-piece { background-color: transparent; }
::-webkit-scrollbar-thumb,
::-webkit-scrollbar-thumb:vertical,
::-webkit-scrollbar-thumb:horizontal { background-color: #c1c1c1; border-radius: 8px; }
::-webkit-scrollbar-thumb:hover,
::-webkit-scrollbar-thumb:active { background-color: #a8a8a8; }

/* 深色主题滚动条 */
html[data-theme='dark'] {
  ::-webkit-scrollbar-thumb,
  ::-webkit-scrollbar-thumb:vertical,
  ::-webkit-scrollbar-thumb:horizontal { background-color: #043254; }
  ::-webkit-scrollbar-thumb:hover,
  ::-webkit-scrollbar-thumb:active { background-color: #065286; }
}

.cursor { cursor: pointer; }

/* Table 表头不换行 + 省略号 */
.ant-table-thead {
  th { white-space: nowrap; text-overflow: ellipsis; overflow: hidden; }
}

/* antd v6 面板层级为 body-holder > body > content，必须补全高度传递链 */
.full-height-tabs {
  .ant-tabs-body { height: 100%; }
  .ant-tabs-content { height: 100%; overflow: auto; }
}
```
`main.tsx` 中顺序必须是：`antd/dist/reset.css` → `./index.less` → `virtual:uno.css`（后两者顺序写反会导致 antd 覆写失效）。

### 12.2 `src/framework/layout/styles.less`（结构尺寸，色彩全部留空/用 token 注入）
| 选择器 | 规则 |
| --- | --- |
| `.app-layout` | `height: 100%`、`min-height: 0` |
| `.app-layout-logo` | `display:flex; align-items:center; gap:8px; height:56px; padding:0 16px; border:none; background:none; cursor:pointer; overflow:hidden; white-space:nowrap; color:inherit` |
| `.app-layout-logo.is-collapsed` | `justify-content:center; padding:0` |
| `.app-layout-logo-img img, svg` | `display:block; width:28px; height:28px` |
| `.app-layout-logo-title` | `font-size:16px; font-weight:600` |
| `.ant-layout-header.app-layout-header` | `display:flex; align-items:center; gap:8px; height:56px; line-height:56px; padding:0 16px` |
| `.app-layout-header .app-layout-logo` | `padding:0 12px 0 0` |
| `.app-layout-header-spacer` | `flex:1; min-width:0` |
| `.app-layout-top-menu` | `flex:1; min-width:0; border-bottom:none; background:transparent` |
| `.app-layout-header-actions` | `margin-left:auto; display:flex; align-items:center; gap:4px` |
| `.app-layout-header-actions .app-locale-switch` | `min-width:36px; padding-inline:8px; font-weight:500` |
| `.app-settings-panel` | `display:flex; flex-direction:column; gap:16px` |
| `.app-settings-item` | `display:flex; align-items:center; justify-content:space-between; gap:16px` |
| `.app-settings-label` | `margin:0 0 8px; font-size:12px; opacity:.65` |
| `.app-layout-mode-list` | `display:flex; justify-content:space-between; gap:12px` |
| `.app-layout-mode-item` | `display:flex; flex-direction:column; align-items:center; padding:0; border:none; background:none; cursor:pointer; color:inherit` |
| `.app-layout-mode-thumb` | `position:relative; display:block; width:80px; height:60px; border:2px solid var(--app-preview-border, transparent); border-radius:5px; background:var(--app-preview-bg,#f0f2f5); box-shadow:0 1px 2.5px 0 rgb(0 0 0 / 18%); overflow:hidden; transition:border-color .2s` |
| `.app-layout-mode-thumb.is-selected` | `border-color:var(--app-preview-primary,#415fff)` |
| `.preview-sider` | `position:absolute; inset:0 auto 0 0; width:30%; background:var(--app-preview-primary,#415fff)` |
| `.preview-header-right` | `position:absolute; inset:0 0 auto auto; width:70%; height:30%; background:var(--app-preview-header,#fff); box-shadow:0 0 1px var(--app-preview-divider,#888)` |
| `.preview-header-full` | `position:absolute; inset:0 0 auto 0; height:30%; background:var(--app-preview-primary,#415fff); box-shadow:0 0 1px var(--app-preview-divider,#888)` |
| `.app-layout-mode-title` | `margin-top:5px; font-size:12px; text-align:center` |
| `.app-theme-color-list` | `display:flex; flex-wrap:wrap; gap:12px` |
| `.app-theme-color-item` | `display:inline-flex; align-items:center; justify-content:center; width:24px; height:24px; padding:0; border:none; border-radius:3px; color:#fff; cursor:pointer` |
| `html.app-grey` | `filter: grayscale(100%)` |
| `html.app-weakness` | `filter: invert(80%)` |
| `.app-user-avatar-trigger` | `display:inline-flex; align-items:center; padding:0; border:none; background:none; cursor:pointer; color:inherit` |
| `.app-user-info` | `display:flex; align-items:center; gap:12px; min-width:200px; padding:4px 0` |
| `.app-user-info-meta` | `min-width:0` |
| `.app-user-info-name` | `font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis` |
| `.app-user-info-sub` | `font-size:12px; opacity:.65; white-space:nowrap; overflow:hidden; text-overflow:ellipsis` |
| `.ant-dropdown-menu-item-disabled.app-user-info-item` | `color:inherit; cursor:default` |
| `.app-layout-sider-inner` | `display:flex; flex-direction:column; height:100%` |
| `.app-layout-sider-menu` | `flex:1; overflow-x:hidden; overflow-y:auto` |
| `.app-layout-inline-menu` | `border-inline-end:none` |
| `.app-layout-content` | `flex:1; min-height:0; display:flex; flex-direction:column; overflow:hidden` |
| `.app-layout-tabs` | `flex-shrink:0; padding:6px 16px 0`；内含 `.ant-tabs-nav { margin:0 }` |
| `.app-layout-tabs-extra` | `display:flex; align-items:center` |
| `.app-layout-tabs-context` | `position:fixed; z-index:1050`（left/top 由内联样式给鼠标坐标） |
| `.app-layout-page` | `flex:1; min-height:0; overflow-y:auto; overflow-x:hidden; padding:16px` |
| `.app-layout-footer` | `text-align:center; padding:16px 24px` |
| `.app-layout-menu-loading` | `display:flex; flex:1; justify-content:center; padding:24px 0` |

### 12.3 `src/components/PageContainer.tsx`（受控展示组件，无状态）
Props：`title?`、`titleBefore?`、`extra?`、`footer?`、`children?`、`contentBordered = true`、`contentClassName?`、`className?`、`style?`。
DOM 与类名（顺序固定）：
```
<div className={`page-container ${className ?? ''}`} style>
  {(title || titleBefore || extra) && (
    <div className="page-header">
      <div className="page-header-heading flex items-center justify-between mb-5">
        <div className="page-header-heading-left flex items-center gap-2">
          {titleBefore}
          {title && <Title level={4} className="page-header-heading-title mb-0!">{title}</Title>}
        </div>
        {extra && (
          <div className="page-header-heading-extra flex items-center gap-2">
            <div className="page-header-heading-action flex items-center gap-2">{extra}</div>
          </div>
        )}
      </div>
    </div>
  )}
  <div className={`page-content ${contentBordered ? 'rounded-12px shadow-[0_1px_2px_0_rgba(0,0,0,0.03),0_1px_6px_-1px_rgba(0,0,0,0.02),0_2px_4px_0_rgba(0,0,0,0.02)] bg-[var(--ant-color-bg-container)] p-4' : ''} ${contentClassName ?? ''}`}>
    {children}
  </div>
  {footer && <div className="page-footer mt-4">{footer}</div>}
</div>
```
`Title` 取自 `Typography`。**不要**把 `p-4`/阴影写进 less，必须留在原子类里。

### 12.4 `src/App.tsx`
`useTableHeadTitle()` 全局事件委托：`document.addEventListener('mouseover', ...)`，命中 `.ant-table-thead th` 且 `scrollWidth > clientWidth` 时 `th.setAttribute('title', th.textContent ?? '')`；卸载时移除监听。组件返回 `<RouterProvider router={router} />`。

## 13. 路由、菜单与页面映射

### 13.1 `src/router/index.tsx`（全文）
```tsx
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom';
import { layoutConfig } from '@/config/layout.config';
import { menus } from '@/config/menu.config';
import { pageComponents } from '@/config/pageComponents';
import { AppLayout, buildMenuRoutes } from '@/framework';
import NotFound from '@/pages/NotFound';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout config={layoutConfig} />,
    children: [
      { index: true, element: <Navigate to={layoutConfig.homePath ?? '/dashboard'} replace /> },
      ...buildMenuRoutes(menus, pageComponents),
      { path: '*', element: <NotFound /> },
    ],
  },
];

const router = createBrowserRouter(routes);
export default router;
```

### 13.2 `src/config/layout.config.tsx`（字段值必须一致）
```tsx
const currentUser: AppUserInfo = {
  name: '管理员',
  account: 'admin@smartai.com',
  avatar: '/logo.svg',
  description: '超级管理员',
};

export const layoutConfig: LayoutConfig = {
  title: 'AI 智能平台',
  logo: <img src="/logo.svg" alt="SmartAI" />,
  collapsedLogo: <img src="/logo.svg" alt="SmartAI" />,
  menuMode: 'blend',
  menu: menus,
  defaultThemeMode: 'light',
  colorPrimary: '#415fff',
  homePath: '/dashboard',
  userInfo: currentUser,
  showTabs: true,
  onLogout: () => { window.location.href = '/'; },
};
```
未设置即取框架默认：`siderWidth=220`、`collapsedWidth=64`、`showFooter` 默认展示、`storageKey='smartai-web'`。

### 13.3 `src/config/menu.config.tsx`（菜单树逐项照抄）
| key / path | label | icon | component | hidden |
| --- | --- | --- | --- | --- |
| `/dashboard` | 主控台 | SettingOutlined | Dashboard | - |
| `/aigc-app` | AIGC应用 | AppstoreOutlined | （目录，无 component） | - |
| `/aigc-app/chat` | AI聊天助手 | SettingOutlined | chat | - |
| `/aigc-app/manage` | AI应用管理 | AppstoreOutlined | appManage | - |
| `/aigc-app/config/:appId` | 应用配置 | 无 | appConfig | true |
| `/aigc-platform` | AIGC平台 | SettingOutlined | 目录 | - |
| `/aigc-platform/models` | 模型管理 | SettingOutlined | models | - |
| `/aigc-platform/providers` | 模型供应商管理 | SettingOutlined | providers | - |
| `/aigc-platform/vector` | 向量库管理 | DatabaseOutlined | vector | - |
| `/aigc-platform/knowledge` | 知识库管理 | FolderOpenOutlined | knowledge | - |
| `/aigc-platform/knowledge/:knowledgeId` | 知识库数据 | 无 | knowledgeData | true |
| `/aigc-platform/conversation` | 对话数据管理 | SettingOutlined | conversation | - |
| `/aigc-platform/billing` | 账单统计 | CreditCardOutlined | billing | - |
| `/permission` | 权限管理 | SettingOutlined | 目录 | - |
| `/permission/department` | 部门管理 | SettingOutlined | department | - |
| `/permission/role` | 角色管理 | UserOutlined | role | - |
| `/permission/user` | 用户管理 | SettingOutlined | user | - |
| `/permission/menu` | 菜单管理 | SettingOutlined | menu | - |
| `/system` | 系统管理 | SettingOutlined | 目录 | - |
| `/system/config` | 系统配置 | SettingOutlined | systemConfig | - |
| `/system/logs` | 日志管理 | FileTextOutlined | logs | - |
| `/system/tokens` | 令牌管理 | KeyOutlined | tokens | - |
四个隐藏项以外的 `key` 与 `path` 同名（不写 path 字段）。隐藏项必须挂在所属可见菜单 `children` 下，才能继承高亮与页签标题。

### 13.4 `src/config/pageComponents.tsx`
18 个 key → `lazy(() => import(...))`，一一对应：
`Dashboard`→`@/pages/Dashboard`；`chat`→`@/pages/aigc-app/AIChat`；`appManage`→`@/pages/aigc-app/AIApp`；`appConfig`→`@/pages/aigc-app/AIAppConfig`；`models`→`@/pages/aigc-platform/ModelManage`；`providers`→`ProviderManage`；`vector`→`VectorManage`；`knowledge`→`KnowledgeManage`；`knowledgeData`→`KnowledgeData`；`conversation`→`ConversationManage`；`billing`→`Billing`；`department`→`DepartmentManage`；`role`→`RoleManage`；`user`→`UserManage`；`menu`→`MenuManage`；`systemConfig`→`@/pages/system/SystemConfig`；`logs`→`LogManage`；`tokens`→`TokenManage`。
类型标注 `const pageComponents: PageComponentMap`，**不得**写 `AIAppManage` 之类的别名。

## 14. 业务页面逐页规格（顺序即实现顺序）

> 所有页面均默认导出；表格统一 `size="middle"` + `bordered`；无特殊说明时表格分页为 `{current:1, pageSize:10, showSizeChanger:true, showQuickJumper:true, showTotal:(t)=>`共 ${t} 条`}`。

### 14.1 数据看板 `pages/Dashboard.tsx`
- `PageContainer title="数据看板" contentBordered={false} contentClassName="flex flex-col gap-16px"`。
- ECharts 按需引入：`import * as echarts from 'echarts/core'`、`LineChart`、`GridComponent/LegendComponent/TooltipComponent`、`CanvasRenderer`、`echarts.use([...])`；图表组件必须 `import ReactEChartsCore from 'echarts-for-react/esm/core'`。
- 4 张统计卡（`Row gutter={[16,16]}`，`Col xs={24} sm={12} lg={6}`，`Card hoverable`）：
  | 标题 | value | suffix | 图标 | trend | 颜色 |
  | --- | --- | --- | --- | --- | --- |
  | LLM请求量 | 12846 | 次 | MessageOutlined | 12.5 | chartColors[0] |
  | Token消耗量 | 3562800 | 空 | RiseOutlined | 8.3 | chartColors[1] |
  | 用户增长量 | 256 | 人 | UserOutlined | 15.2 | chartColors[3] |
  | 知识库数量 | 48 | 个 | DatabaseOutlined | -2.1 | chartColors[4] |
- `Statistic`：`prefix` 包一层 `<span style={{color, fontSize:22}}>`；`formatter` 输出 `<span style={{fontWeight:600}}>{formatNumber(v)}</span>`；`formatNumber`：≥1e6 → `${(n/1e6).toFixed(2)}M`，否则 `toLocaleString()`；`suffix` `<span style={{fontSize:14,color:isDark?'#ffffff73':'#00000073'}}>`。
- 卡片下方趋势行：`marginTop:8; fontSize:13; color: trend>=0 ? '#0ac17e' : '#ff3c31'`，内容 `ArrowUpOutlined|ArrowDownOutlined` + `Math.abs(trend)%` + 灰色 `较昨日`（`color: isDark?'#ffffff52':'#00000040'`，`marginLeft:4`）。
- 两张图：`Col xs={24} lg={12}`，`Card` 标题「Token消耗量统计报表」「AI请求量统计报表」，`styles={{ body:{ padding:'12px 16px' } }}`，`<ReactEChartsCore echarts={echarts} option={...} style={{width:'100%',height:320}} notMerge />`。
- 图表数据（写死）：
  `tokenChartData.dates = ['07-16','07-17','07-18','07-19','07-20','07-21','07-22']`；`inputTokens=[320000,410000,380000,520000,480000,390000,460000]`；`outputTokens=[180000,250000,210000,310000,280000,220000,270000]`；`requestChartData.requests=[1620,2100,1850,2480,2300,1920,2180]`。
  系列名：`输入Token`(chartColors[0])、`输出Token`(chartColors[1])、`请求量`(chartColors[3])。
- `buildAreaOption`：`tooltip.trigger='axis'`；`legend{bottom:0,textStyle:{color:textColor}}`；`grid{top:20,left:16,right:16,bottom:36,containLabel:true}`；`xAxis{type:'category',boundaryGap:false,axisLine.lineStyle.color,axisLabel.color}`；`yAxis{type:'value',splitLine.lineStyle.color,axisLabel.formatter: M/K}`；series `{type:'line',smooth:true,symbol:'circle',symbolSize:6,lineStyle:{width:2,color},itemStyle:{color},areaStyle:{color:new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:`${color}40`},{offset:1,color:`${color}05`}])}}`；`textColor = isDark ? '#ffffffb3' : '#00000073'`，`axisLineColor = isDark ? '#1a3a5c' : '#f0f0f0'`。

### 14.2 AI聊天助手 `pages/aigc-app/AIChat.tsx`
- `PageContainer className="flex flex-col h-full" title="AI聊天助手" contentBordered={false} contentClassName="flex-1 flex flex-col min-h-0"`。
- 模型下拉 `modelOptions`（5 项）：GPT-4o / GPT-4o Mini / Claude 3.5 Sonnet / DeepSeek Chat / 通义千问 Max，默认 `gpt-4o`。
- 6 条初始消息（3 组问答，`timestamp = now - 300000/-295000/-180000/-175000/-60000/-55000`）：①"你好，请介绍一下你自己"→ SmartAI 自我介绍；②"请用 React + TypeScript 写一个计数器组件"→ 含 `useState` 的代码文本；③"什么是向量数据库？它和传统数据库有什么区别？"→ 4 点对比（HNSW、Milvus 等）。文案按原文，不得改写。
- 消息区：`ref` + `ResizeObserver` 记录 `contentWidth`；空态文案「暂无消息，开始对话吧」（`text-center text-gray-400 mt-20%`）。
- 气泡定宽（pretext）：`BUBBLE_PADDING_X=24`、`BUBBLE_MAX_WIDTH_RATIO=0.8`、`FONT='14px "PingFang SC", "Microsoft YaHei", sans-serif'`、`LINE_HEIGHT=22`；`prepareWithSegments(content, FONT, { whiteSpace:'pre-wrap' })` 只依赖 content；`walkLineRanges(prepared, maxWidth, line => maxW=Math.max(maxW,line.width))` 求最宽行；`contentMaxWidth = Math.floor(containerWidth*0.8) - 24`；`bubbleWidth = Math.ceil(maxW)+24`；`height = max(1,lineCount)*22`；气泡 `maxWidth:'80%'`、`width: bubbleWidth?px`、内层 `whiteSpace:'pre-wrap';lineHeight:'22px';fontSize:'14px';height;overflow:hidden`。
- 气泡外观：用户 `bg-[var(--ant-color-primary)] text-white`，助手 `bg-[var(--ant-color-fill-tertiary)] text-[var(--ant-color-text)]`，`rounded-12px px-3 py-2`；头像 `Avatar size={36}`（User/Robot），`flex-row-reverse` 对用户；行 `mb-4 gap-2`。
- 操作行：用户 → 时间 + 复制 + 编辑；助手 → 复制 + 重新生成 + 点赞 + 踩 + 分享 + 时间；图标类 `text-gray-400 hover:text-[var(--ant-color-primary)] cursor-pointer transition-colors text-14px`；时间 `text-12px text-gray-400`；复制用 `navigator.clipboard.writeText`，成功「复制成功」/失败「复制失败」。
- 输入区：`Input.TextArea` `autoSize`、`maxHeight:300`、`mask:'linear-gradient(to bottom, transparent, #fff 3.75%, #fff calc(100% - 3.75%), transparent)'`、类名 `border-none! bg-transparent! resize-none! pt-3 pr-3 pb-0 pl-4 shadow-none!`、placeholder「今天想聊些什么...」；`Enter` 发送（`!shiftKey` 时 `preventDefault`），`Shift+Enter` 换行。
- 操作栏：左侧 `Select style={{width:180}}` + `Button type="text" size="small" icon={<ClearOutlined/>}`「清空聊天」（清空后 messages=[]）；右侧 `Button type="text" size="small" icon={<PaperClipOutlined/>}`（无事件）+ `Button type="primary" size="small" icon={<SendOutlined/>}`「发送」`disabled={!inputValue.trim()}`。

### 14.3 AI应用管理 `pages/aigc-app/AIApp.tsx`
- `PAGE_SIZE = 11`；`contentBordered={false}`、`contentClassName` 用圆角+阴影+`bg-[var(--ant-color-bg-container)] p-6`；`footer` 仅当 `total > 11` 时渲染右对齐 `Pagination`（`showSizeChanger showQuickJumper defaultCurrent={1} current total={total} pageSize={11} showTotal={(t)=>`共${t}条记录`}`）。
- 网格：`grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5`；第一格永远是「创建应用」方块（虚线边框、`h-220px`、hover 主色边框 + `--ant-color-primary-bg` 底色、48px 圆角块内 `PlusOutlined` 22px、「创建应用」15px/500、「创建空白应用」12px 四级灰）。
- 新建：`id=Date.now().toString()`、`prompt=''`、`knowledgeBaseIds=[]`、`createdAt=new Date().toLocaleString('zh-CN',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).replace(/\//g,'-')`、`createdBy='当前用户'`，插入数组头部；编辑则按 id 合并；删除直接过滤。
- 卡片点击进入 `/aigc-app/config/${id}`。
- `AppCard`：`h-220px`、`p-5`、`rounded-12px`、hover 阴影 + 主色边框；头部 40px 主色底块显示 emoji logo + 16px 加粗名称（truncate）；「关联模型：{label}」12px 次级；简介 13px `ellipsis={{rows:3}}`；右下角 `EllipsisOutlined`（16px，三级灰），点击 `stopPropagation` 打开 `Dropdown trigger={['click']} placement="bottomRight"`。
- 下拉项顺序：`编辑应用` → `删除应用`(danger，`Modal.confirm`「确认删除」/「确定要删除应用「名称」吗？删除后不可恢复。」/okText 删除+danger/cancelText 取消) → divider → `创建时间：xxx`(disabled) → `创建者：xxx`(disabled)。所有 onClick 先 `domEvent.stopPropagation()`。
- `AppFormModal`：`width=600`、`destroyOnHidden`、标题「编辑应用/创建应用」、okText「保存/创建」；`Form layout="horizontal" labelCol={span:6} wrapperCol={span:18}`；字段：
  `name` 应用名称（必填「请输入应用名称」，maxLength 50 showCount）；`model` 关联模型（必填「请选择关联模型」）；`logo` 应用 LOGO（必填「请选择应用 LOGO」，选项 10 个 emoji：🤖机器人/✍️写作/🔍搜索/📊数据/💬对话/🎯目标/📝笔记/🧠智能/⚡效率/🛠️工具）；`cover` 应用封面（`Upload listType="picture-card" maxCount={1} beforeUpload={()=>false}`，占位「上传封面」）；`description` 应用简介（必填「请输入应用简介」，maxLength 200 showCount rows 3）。

### 14.4 应用配置 `pages/aigc-app/AIAppConfig.tsx`
- 取 `appId` 查 `mockApps`，找不到回落 `mockApps[0]`。
- `titleBefore` = 返回按钮（`ArrowLeftOutlined`，跳 `/aigc-app/manage`）+ 36px 主色底圆角块显示 `app.logo`；`title={app.name}`；`extra` 两个按钮：「应用配置」(SettingOutlined，激活为 primary)、「API 接入渠道」(激活为 primary)，`activeView: 'config' | 'api'`；`className="flex flex-col h-full"`、`contentBordered={false}`、`contentClassName="flex-1 flex flex-col min-h-0"`。
- config 视图三列：`w-30%`（Prompt）/ `w-40%`（基础配置+知识库）/ `flex-1 min-w-0`（聊天测试），`gap-4`，每列 `rounded-8px border border-solid border-[var(--ant-color-border)] bg-[var(--ant-color-bg-container)] p-4`。
- 第一列：「Prompt 提示词」14px 加粗；`TextArea className="flex-1!"` placeholder「请输入系统提示词，定义 AI 的行为和回答风格...」；底部右对齐 `Button type="primary" size="small"`「保存」→ `message.success('提示词已保存')`。
- 第二列：「基础配置」→「对话模型」12px 次级标签 + 全宽 Select；「知识库」+ 说明文案「将文档、URL、三方数据源上传为文本知识库后，用户发送消息时，Bot 能够引用文本知识中的内容回答用户问题。」；`Upload.Dragger multiple beforeUpload={()=>false} showUploadList={false} className="flex-1!"`（`CloudUploadOutlined` 24px 主色 + 「点击或拖拽上传文档」）；下方 `Button icon={<LinkOutlined/>} block`「添加 URL 数据源」。
- 第三列：「聊天测试」；空态「发送消息开始测试」；气泡 `max-w-80% px-3 py-2 rounded-8px text-13px whitespace-pre-wrap`，用户主色白字、助手 `bg-[var(--ant-color-bg-text-secondary)]`；发送后 800ms 追加助手消息文案 `这是来自「${app.name}」的模拟回复。实际接入后将根据 Prompt 和知识库内容生成回答。`；输入 `TextArea rows={4}` placeholder「输入消息进行测试...」+ 右下「发送」按钮（disabled 空值）。
- api 视图：渲染 `ApiChannelPanel appName appId`（文件 `components/ApiChannelDrawer.tsx`，默认导出名 `ApiChannelPanel`）。
- `ApiChannelPanel`：左 `w-40%` 秘钥区 —— 标题「API 秘钥」+ `Button type="primary" size="small" icon={<PlusOutlined/>}`「创建秘钥」（`key = 'sk-' + Math.random().toString(36).substring(2,22)`，插入头部，`message.success('秘钥创建成功')`）；表格列 `秘钥`(220, ellipsis, 等宽字体 13px) / `创建时间`(160) / `操作`(120，复制+删除)；`pagination {current:1,pageSize:5,showSizeChanger,showQuickJumper,showTotal:'共 x 条'}`；`scroll={{x:500}}` `size="small"` `bordered`；复制 `message.success('已复制到剪贴板')`；删除 `Modal.confirm`「删除后该秘钥将无法使用，确定要删除吗？」。
- 右 `flex-1` 4 个 `CodeBlock`（title 依次 `API URL`、`Request`、`Response (Stream)`、`API 请求示例`）：块样式 `rounded-8px border border-solid border-[var(--ant-color-border)] bg-[var(--ant-color-bg-layout)] p-4 overflow-auto`，内 `pre` `text-13px m-0 whitespace-pre-wrap break-all font-mono`。`baseUrl='https://api.example.com/v1'`；请求体 `model: appId`、system 内容 `你是${appName}的AI助手。`、`stream:true`、`temperature:0.7`、`max_tokens:2048`；流式响应 4 段 chunk + `data: [DONE]`；Python 示例使用 `openai.OpenAI(api_key="sk-xxxxxxxxxxxxxxxxxxxxx", base_url=...)` 与 `for chunk in response`。

### 14.5 模型管理 `pages/aigc-platform/ModelManage.tsx`
- `PageContainer title="模型管理"`，内部 `Tabs activeKey={activeTab}`，三项：`chat`「Chat模型供应商」、`embedding`「Embedding向量模型」、`image`「Image文生图模型」。

**ChatModelTab**
- 顶部 `Alert type="info" showIcon className="mb-4"` 文案「对于完全适配OpenAI接口格式的模型都可在OpenAI中配置（只需要定义BaseUrl）」。
- 布局 `flex gap-4`：左 `w-220px flex-shrink-0`（标题「模型供应商」14px/600 + `Button type="link" size="small" icon={<PlusOutlined/>}`「新增」；列表项 `px-3 py-2 rounded-6px text-14px`，选中 `bg-[var(--ant-color-primary-bg)] text-[var(--ant-color-primary)] font-500`，否则 `hover:bg-[var(--ant-color-bg-text-hover)]`；项内 `名称` + 12px 四级灰 `(版本数)` + hover 才出现的 `EditOutlined`）。
- 右 `flex-1 min-w-0`：标题「{供应商} 模型列表」+ `Button type="primary" size="small"`「新增模型」；表格列：`模型版本`（`Tag color="blue"`）、`回复上限`（`${v} tokens`）、`生成随机性`（禁用 `InputNumber size="small" min=0 max=2 step=0.1`）、`Top P`（禁用 `InputNumber min=0 max=1 step=0.05`）、`操作`(120，编辑/删除；删除 `Popconfirm title="确定删除该版本？"`）；`scroll={{x:800}}` `size="small"`。
- 新增/编辑模型 `Drawer size={480}`，`extra` = 取消/确定；`Form labelCol={6} wrapperCol={18} initialValues={{maxTokens:4096,temperature:0.7,topP:1.0}}`：
  `supplier` 模型供应商（必填）；`version` 模型版本（必填「请选择或输入模型版本」，`Select showSearch mode="tags" maxCount={1} tokenSeparators=[',']`，`filterOption` 大小写不敏感，选项 gpt-4o/gpt-4o-mini/gpt-4/gpt-3.5-turbo/qwen-max/qwen-plus/ERNIE-4.0）；`baseUrl`（必填「请输入BaseUrl」）；`alias` 模型别名（必填）；`apiKey`（必填「请输入Api Key」）；`maxTokens` 回复上限 `Slider min=100 max=8000 step=100`；`temperature` `Slider min=0 max=2 step=0.1`；`topP` `Slider min=0 max=1 step=0.05`。Tooltip 文案：版本「该LLM供应商对应的模型版本号」/BaseUrl「模型的基础请求URL地址（或中转地址）」/ApiKey「模型的ApiKey」/回复上限「控制模型输出的Tokens长度上限。通常 100 Tokens 约等于150个中文汉字」/随机性「调高参数会使得模型的输出更多样性和创新性，反之降低参数将会减少多样性」/TopP「模型在生成输出时会从概率最高的词汇开始选择，直到这些词汇的总概率累积达到Top p值。这样可以限制模型只选择这些高概率的词汇，从而控制输出内容的多样性。建议不要与"生成随机性"同时调整」。
  成功提示：`编辑模型成功` / `新增模型成功` / `删除成功`。
- 供应商增改走 `SupplierFormModal`（见 14.5 末）。

**EmbeddingModelTab**（结构同 Chat，差异如下）
- `Alert type="warning"` 文案「注意：为了实现向量数据库的动态切换，这里Embedding供应商统一选择支持1024纬度的模型」。
- 分组写死 3 组：`g1 OpenAI`、`g2 通义千问`、`g3 Cohere`，`models` 由 `mockEmbeddingModels.filter(m => m.name === 组名)` 得到。
- 表格列：`模型别名`/`模型版本`/`向量纬度`/`Api Key`（次级色）/`Base Url`(ellipsis)/`操作`；`scroll={{x:900}}`。
- Drawer 表单：供应商、版本（`mode="tags"`，选项 text-embedding-ada-002 / text-embedding-3-small / text-embedding-3-large / text-embedding-v2 / embed-multilingual-v3）、BaseUrl、模型别名、Api Key、向量纬度（512/768/1024/1536，`initialValues={{dimension:1024}}`）。

**ImageModelTab**（结构同 Embedding，差异如下）
- `Alert type="info"` 文案「鉴于很多模型的文生图效果很差甚至没有，这里只建议使用OpenAI的DALL-E模型」。
- 分组：`g1 OpenAI DALL-E`、`g2 Azure DALL-E`。
- 表格列：`模型别名`/`模型版本`/`Api Key`/`Endpoint`(ellipsis)/`Deployment Name`/`操作`；`scroll={{x:1000}}`。
- Drawer 表单：供应商、版本（dall-e-3 / dall-e-2 / stable-diffusion-v1.5 / stable-diffusion-xl / midjourney-v5）、BaseUrl（编辑时写回 `record.endpoint`）、模型别名、Api Key、`imageSize`（1024*1024 / 1024*1792 / 1792*1024）、`imageQuality`（standard / hd）、`imageStyle`（vivid / natural）；编辑回显缺省值 `1024*1024` / `standard` / `vivid`；新增时 `deploymentName = values.alias`、`endpoint = values.baseUrl`。

**SupplierFormModal**（三类模型共用，默认导出）
`Modal width={520} destroyOnHidden`，标题「编辑模型供应商 / 新增模型供应商」，okText「保存 / 确定」；字段：`name` 供应商名称（必填，maxLength 50 showCount）、`code` 供应商标识（必填，placeholder「请输入供应商标识，例如：openai」）、`remark` 备注（TextArea rows 3 maxLength 200 showCount）。`open` 为 true 时编辑态 `setFieldsValue`，新增态 `resetFields`。

### 14.6 模型供应商管理 `pages/aigc-platform/ProviderManage.tsx`（唯一接真实后端）
- `modelProviderApi.list()` 拉取（`GET /api/aigc/model-provider`），`useEffect` 挂载执行；失败 `message.error('获取供应商列表失败')`；`isAdmin = true`（常量，带 TODO 注释）。
- `PageContainer title="模型供应商管理"`，`extra` = `Button type="primary" icon={<PlusOutlined/>}`「新增供应商」（仅 isAdmin）。
- 列：`供应商名称`(200)/`供应商标识`(180)/`备注`(ellipsis)/`创建时间`(180)/`操作`(120, fixed right，编辑 + `Popconfirm`「确认删除」+ 描述「确定删除供应商「名称」吗？」)；`scroll={{x:900}}` `size="middle"` `bordered`；分页 `pageSize:10` 且 `total` 来自接口。
- 新增/编辑**不用 antd Modal**，而是自绘遮罩：`<div className="fixed inset-0 z-1000 flex items-center justify-center" style={{backgroundColor:'rgba(0,0,0,0.45)'}} onClick={handleCancel}>` 内 `<div className="rounded-8px bg-[var(--ant-color-bg-container)] p-6" style={{width:520}} onClick={e=>e.stopPropagation()}>`；标题 16px/500「编辑模型供应商 / 新增模型供应商」；表单同上（name/code/remark）；底部右对齐「取消」+「保存|确定」。
- 成功提示：`编辑成功` / `新增成功` / `删除成功`，删除失败「删除失败」。

### 14.7 向量库管理 `pages/aigc-platform/VectorManage.tsx`
- `PageContainer title="向量库管理"` + `extra`「新增向量库」；数据源 `mockVectorDBs`。
- 列：`数据库别名`(130)/`供应商`(100，`Tag`：Redis=red、PgVector=blue、Milvus=green)/`向量纬度`(100)/`数据库地址`(140)/`数据库端口`(100)/`数据库用户名`(120，空显示 `-`)/`数据库密码`(120，空 `-`)/`数据库名`(120，空 `-`)/`表名称`(130，空 `-`)/`操作`(120 fixed right)；`scroll={{x:1200}}`。
- `Modal width={600} destroyOnHidden` 标题「编辑向量库 / 新增向量库」；顶部 `Alert type="warning" showIcon`：「注意：请慎重修改模型的向量纬度参数（Dimension），此参数需要和向量库匹配（错误修改可能将影响已有的向量数据）」。
- 表单 `initialValues={{dimension:1024}}`，`vendor` 用 `Form.useWatch` 驱动条件字段：
  供应商（必填，Redis/PgVector/Milvus）→ 数据库别名（必填）→ 数据库地址（必填）→ 数据库端口（必填，`InputNumber min=1 max=65535 className="w-full!"`）→ 若 `vendor==='Redis'`：「Redis库索引名」必填；否则「数据库名」「表名称」均必填 → 若 `vendor!=='Milvus'`：「数据库用户名」「数据库密码」（`Input.Password`，非必填）→ 向量纬度（必填，选项 512/768/1024/1536，label 带 `QuestionCircleOutlined` Tooltip「慎重修改此参数，纬度高会消耗更多的算力，但纬度高并不代表搜索更精确」）。
- 提交时按 vendor 清理无关字段：Redis 只留 `redisIndex`，非 Redis 留 `dbName`/`tableName`，Milvus 不留 `username`/`password`。提示：`新增向量库成功` / `编辑向量库成功` / `删除成功`。

### 14.8 知识库管理 `pages/aigc-platform/KnowledgeManage.tsx`
- `PAGE_SIZE=11`，`PageContainer title="知识库管理" contentBordered={false}`，`footer` 同上（`共${total}条记录`）。
- 卡片网格外层 `<div className="rounded-12px bg-[var(--ant-color-bg-container)] p-4">`（**无阴影**），内层同 14.3 网格。
- 创建方块文案「创建知识库」/「创建新的知识库」。
- `KnowledgeCard`：顶部 40px 主色块固定 `📚`；名称 16px 加粗；描述 13px 3 行省略；底部「文档数：{docCount} | {大小}」+ 数据库名（`DatabaseOutlined`）；`formatSize`：<1024 → `x B`，<1MB → `x.x KB`，否则 `x.x MB`；点击进 `/aigc-platform/knowledge/${id}`；下拉：编辑知识库 / 删除知识库(confirm「确定要删除知识库「名称」吗？删除后不可恢复。」) / divider / 创建时间 / 创建者。
- `KnowledgeFormModal`：`width=520`，标题「编辑知识库 / 创建知识库」，okText「保存 / 创建」；字段：名称（必填，maxLength 50 showCount）、向量数据库（必填，选项来自 `mockVectorDBs.map(v=>({value:v.alias,label:v.alias}))`）、向量模型（必填，选项 label 为 `${name} - ${alias}`）、知识库描述（必填，TextArea rows 3 maxLength 200 showCount）。
- 新建：`id=Date.now()`、`createdAt` 同上格式化、`createdBy='当前用户'`，插到头部。

### 14.9 知识库数据 `pages/aigc-platform/KnowledgeData.tsx`
- 路由参数 `knowledgeId`，找不到回落 `mockKnowledgeBases[0]`。
- `PageContainer className="flex flex-col h-full" titleBefore=返回按钮(跳 `/aigc-platform/knowledge`) title="知识库数据" contentBordered={false} contentClassName="flex-1 flex gap-4 min-h-0"`。
- 左栏 `w-300px flex-shrink-0 rounded-8px border ... overflow-auto`：封面区 `px-5 py-5` + 下方 `border-b`，内 120px 高主色底 `📚` 48px 居中、`Title level={5}` 居中、描述 13px 3 行省略居中；信息区 `px-5 pb-5 flex flex-col gap-4`：`知识库ID`（Input 可改但 onChange 空实现）、`关联向量数据库`（`Tag color="blue"`）、`关联向量化模型`（`Tag color="green"`），每项 label 在上 12px 次级、值在下。
- 右栏 `flex-1 ... p-4 min-w-0 flex flex-col min-h-0 overflow-hidden` 内 `Tabs defaultActiveKey="import" className="full-height-tabs flex-1 min-h-0"`，4 个 tab：
  1. `import` 数据导入：两张选择卡（`导入文档`/`手动录入文档`，`flex-1 max-w-320px p-4 border-2 rounded-8px`，选中主色边框，右下角主色三角 `border-l-14px border-b-14px`）；上传模式用 `Upload.Dragger multiple accept=".txt,.md,.docx,.doc,.pdf"`（`beforeUpload` 返回 false 并直接把文档插入列表头部，提示「「文件名」上传成功」）；录入模式为 Form（文档名称/文档内容 required，提交前校验空值提示「请填写文档名称和内容」，`fileSize = new Blob([content]).size`，成功「文档录入成功」并清空表单）。
  2. `documents` 文档管理：列 `文档名称`(180)/`文档链接`(200, ellipsis, `Text copyable` 12px)/`文档来源`(100, Tag)/`切片数量`(90)/`切片状态`(100, 已训练=green 未训练=orange)/`文件大小`(100)/`操作`(120 fixed right，重新向量化+编辑+删除，`Space wrap size={4}`)；`scroll={{x:1000}}`。重新向量化 confirm：「确认重新向量化」/「您确定重新向量化该文档「名称」？此操作将会删除Vector向量库中旧数据。」→ 「已开始重新向量化」；删除 confirm「确定要删除文档「名称」吗？」。
  3. `slices` 切片管理：列 `文档名称`(180)/`字符数`(90)/`切片内容`(ellipsis, `Paragraph ellipsis={{rows:2,expandable:true}}`)/`切片状态`(100)/`创建时间`(160)；`scroll={{x:800,y:'max-content'}}`。
  4. `search` 向量搜索：`flex flex-col gap-4 h-full min-h-0 xl:flex-row`；左 `w-full xl:w-300px`（`TextArea rows={6}` placeholder「请输入关键词查询向量文本」+ 全宽主色「搜索」）；空态「搜索后展示匹配结果」；结果卡：`结果 N` + `Tag color="blue"`「相似度：xx.x%」（`score*100` 保留 1 位）+ 内容；空关键词 `message.warning('请输入搜索关键词')`；mock 结果 = 全部切片，`score = Math.random()*0.3+0.7`。
- 编辑文档 `Modal width={520}` 标题「编辑文档」，字段「文档名称」/「文档内容」（内容初值固定 `文档内容预览...`），保存「编辑成功」。

### 14.10 对话数据管理 `pages/aigc-platform/ConversationManage.tsx`
- `PageContainer title="对话数据管理"` + `Tabs defaultActiveKey="messages"`：`messages`「会话消息」、`sessions`「会话窗口」。
- 会话消息列：`用户名`(100)/`请求IP`(140)/`对话角色`(100，Tag：user=blue、assistant=green、system=orange)/`模型名称`(130)/`Token消耗`(110)/`提示词Token消耗`(140)/`会话时间`(180)/`操作`(120 fixed right，`EyeOutlined` + 删除 `Popconfirm`「确定要删除该会话消息吗？」)；`scroll={{x:1100}}`。
- 会话窗口列：`对话次数`(100)/`Token消耗量`(120)/`最后一次对话时间`(180)/`创建时间`(180)/`操作`(120 fixed right，同上，文案「确定要删除该会话窗口吗？」)；`scroll={{x:800}}`。
- 删除仅本地过滤 + `message.success('删除成功')`。

### 14.11 账单统计 `pages/aigc-platform/Billing.tsx`
- `PageContainer title="账单统计"` + `extra`「刷新」（`ReloadOutlined`，重置为 mock 全量并提示「刷新成功」）。
- 列（宽度用百分比）：`用户名`15% / `模型名称`12% / `Tokens`10%（`sorter` 数值升/降）/ `Prompt Tokens`12% / `Completion Tokens`13% / `IP地址`12% / `调用时间`16%（按时间排序）/ `操作`120（删除 Popconfirm「确定要删除该账单记录吗？」）；`scroll={{x:1000}}` `bordered`。
- 数据 53 条，生成规则见 16.3（含 Math.random，注意第 18 章说明）。

### 14.12 部门管理 `pages/permission/DepartmentManage.tsx`
- 树表：`Table` + `expandable={{ defaultExpandAllRows: true }}`，`scroll={{x:900}}`，分页 `total` 取扁平化节点数，`showTotal`「共 N 条」。
- 列：`部门名称`(220)/`上级部门`(180)/`部门描述`(ellipsis)/`操作`(120 fixed right：新增子部门 `PlusOutlined`、编辑、删除 Popconfirm)。删除描述动态：有子部门时「该部门下存在子部门，删除后子部门将一并删除，确定删除「名称」吗？」，否则「确定删除「名称」吗？」。
- 顶部「新建部门」；`Modal destroyOnHidden` 标题「编辑部门 / 新建部门」：`parentDept` 上级部门（`TreeSelect`，必填「请选择上级部门」，`treeDefaultExpandAll allowClear`，value 用 id）+ `deptName` 部门名称（必填，maxLength 20）+ `deptDesc` 部门描述（TextArea rows 3 maxLength 100 showCount）。
- 编辑时按 `parentDept` 名称反查 id 回显；提交时把 id 转回名称存入记录；新增子部门时自动选中当前行；提示「新建部门成功」/「编辑成功」/「删除成功」。
- 树工具函数：`flattenTree`、`toTreeSelectData`、`addChildToTree`、`updateTree`、`removeFromTree`（递归 map/filter 实现，不引三方库）。

### 14.13 角色管理 `pages/permission/RoleManage.tsx`
- 列：`角色名称`(200)/`角色标识`(200)/`角色描述`(ellipsis)/`操作`(120 fixed right)；`scroll={{x:800}}`。
- `Modal width={600}` 标题「编辑角色 / 新建角色」：`roleName`（必填，maxLength 20）、`roleKey`（必填，placeholder「请输入角色标识，如：admin」，maxLength 30）、`roleDesc`（TextArea rows 3 maxLength 100 showCount）、`menuPermissions` 菜单权限（`valuePropName="checkedKeys"`、`trigger="onCheck"`、规则 `{type:'array',required:true,message:'请勾选菜单权限'}`，内部 `Tree checkable defaultExpandAll treeData={menuPermissionTree}`，容器 `max-h-300px overflow-y-auto rounded-6px border border-solid border-[var(--ant-color-border)] p-2`）。
- 删除 `Modal.confirm`「确定要删除角色「名称」吗？」；提示「新建角色成功」/「编辑角色成功」/「删除成功」。

### 14.14 用户管理 `pages/permission/UserManage.tsx`
- 列：`用户名`(120)/`真实姓名`(120)/`角色`(120)/`部门`(120)/`账号状态`(100，1=「启用」success、0=「禁用」error)/`邮箱`(180)/`手机`(140)/`操作`(120 fixed right)；`scroll={{x:1100}}`。
- `Modal width={600} destroyOnHidden`，`Form initialValues={{status:true}}`：用户名（必填，maxLength 50）；**密码仅新建时渲染**（必填「请输入密码」+ `min:6`「密码长度不能少于6个字符」，`Input.Password` maxLength 100）；真实姓名（必填，maxLength 20）；角色（必填，Select 选项来自 `mockRoles` 的 `roleName`）；部门（必填，`TreeSelect` 树来自 `mockDepartments`，value 用 `deptName`，`treeDefaultExpandAll allowClear`）；账号状态（`Switch checkedChildren="启用" unCheckedChildren="禁用"`，提交 `values.status ? 1 : 0`）；邮箱（`{type:'email'}`「请输入正确的邮箱格式」）；手机（`{pattern:/^1\d{10}$/, message:'请输入正确的手机号'}`，maxLength 11）。
- 删除 `Modal.confirm`「确定要删除用户「真实姓名」吗？」；提示「新建用户成功」/「编辑用户成功」/「删除成功」。

### 14.15 菜单管理 `pages/permission/MenuManage.tsx`
- 树表 `expandable={{ defaultExpandAllRows:true }}`、`scroll={{x:1400}}`、分页 total 为扁平化节点数。
- 9 列：`菜单名称`(200)/`菜单路径`(200，`Typography.Text code`)/`菜单类型`(90，Tag：目录 blue、菜单 green、按钮 orange)/`组件路径`(220，空 `-`)/`图标`(80，居中，`ICON_MAP[icon]` 或 `-`)/`排序`(70，居中)/`权限标识`(200，`Text code` 或 `-`)/`状态`(80，启用 success/禁用 error)/`操作`(120 fixed right：新增子项（仅非 button 显示）+ 编辑 + 删除)。
- `ICON_MAP` 17 项：DashboardOutlined、AppstoreOutlined、SettingOutlined、DatabaseOutlined、FolderOpenOutlined、CreditCardOutlined、UserOutlined、FileTextOutlined、KeyOutlined、MessageOutlined、RobotOutlined、CloudServerOutlined、SafetyOutlined、MenuOutlined、ApartmentOutlined、TeamOutlined、ControlOutlined。
- `Modal width={560} destroyOnHidden` 标题「编辑菜单 / 新增菜单」，`labelCol={5}`：上级菜单（`TreeSelect`，`treeData=[{title:'顶级菜单',value:'__root__',disabled:true}, ...toTreeSelectData(dataSource)]`，`treeDefaultExpandAll allowClear`，placeholder「请选择上级菜单（不选则为顶级菜单）」，按钮型节点 disabled）；菜单类型（`Radio.Group`：目录/菜单/按钮，必填）；菜单名称（必填 maxLength 20）；菜单路径（必填，placeholder「请输入菜单路径，如 /permission/menu」）；组件路径（仅 `menuType==='menu'` 显示，placeholder「请输入组件路径，如 pages/permission/MenuManage」）；图标（仅非按钮显示，`Select allowClear showSearch`，选项渲染图标+名称）；排序（`InputNumber min=1 max=999` 全宽）；权限标识（placeholder「请输入权限标识，如 /permission/menu:add」）；状态（Switch 启用/禁用）。
- 新建默认 `{menuType:'catalog', status:1, order:1}`；新增子项默认 `menuType = 父级为 catalog ? 'menu' : 'button'`；删除描述动态（有子菜单时「该菜单下存在子菜单，删除后子菜单将一并删除，确定删除「名称」吗？」）。提示「新增菜单成功」/「编辑成功」/「删除成功」。

### 14.16 系统配置 `pages/system/SystemConfig.tsx`（占位页）
`PageContainer title="系统配置"` + `<Text>系统配置页面</Text>`，仅此。

### 14.17 日志管理 `pages/system/LogManage.tsx`
- `PageContainer title="日志管理"`；列：`操作用户`(120)/`操作状态`(100，success=「成功」/error=「失败」)/`操作描述`(150)/`请求URL`(200 ellipsis)/`耗时/毫秒`(120，>1000 时文字 `#ff4d4f`)/`操作方法`(220 ellipsis)/`IP地址`(140)/`操作时间`(180)/`操作`(120 fixed right，仅 `EyeOutlined`)；`scroll={{x:1400}}`；20 条只读数据。

### 14.18 令牌管理 `pages/system/TokenManage.tsx`
- `PageContainer title="令牌管理"` + `extra`「刷新」（重置 mock + 「刷新成功」）。
- 列：`令牌`(40% ellipsis)/`账户`(25%)/`过期时间`(20%)/`操作`(120，删除 Popconfirm「确定要删除该令牌吗？」)；`scroll={{x:800}}` `bordered`；46 条。

### 14.19 404 `pages/NotFound.tsx`
`<Result status="404" title="404" subTitle="抱歉，您访问的页面不存在" extra={<Button type="primary" onClick={()=>navigate('/')}>返回首页</Button>} />`。

## 15. API 层契约（`src/api`）

### 15.1 `http.ts`
```ts
export interface ApiResult<T> { code: number; message: string; data: T; }
const SUCCESS_CODE = 200;
export async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!response.ok) throw new Error(`请求失败：${response.status} ${response.statusText}`);
  const result = (await response.json()) as ApiResult<T>;
  if (result.code !== SUCCESS_CODE) throw new Error(result.message || '请求失败');
  return result.data;
}
```

### 15.2 `aigc.ts`
- `PageResult<T> { list: T[]; total: number }`。
- `withQuery(url, params?: Record<string,string|undefined>)`：过滤 `undefined` 与 `''`，`encodeURIComponent` 拼接。
- 导出对象（方法统一 `list/getById/create/update/delete`）：`modelProviderApi`（`/api/aigc/model-provider`，list 返回 `PageResult<{id,name,code,remark?}>`，带 `{name,code}` 查询）、`modelApi`（`/api/aigc/model`）、`embedStoreApi`（`/api/aigc/embed-store`）、`knowledgeApi`（`/api/aigc/knowledge`）、`docsApi`（`/api/aigc/docs`）、`appApi`（`/api/aigc/app`）、`conversationApi`（含 `listByUserId`→`/api/aigc/conversation/user/{id}`）、`messageApi`（含 `listByConversationId`→`/api/aigc/message/conversation/{id}`）。create/update 均 `POST`/`PUT` + `JSON.stringify(data)`，delete 为 `DELETE /{id}`。

### 15.3 `system.ts`
导出实体 `SysUserRecord`/`SysRoleRecord`/`SysDeptRecord`/`SysLogRecord`（均含 `id` 与 `[key:string]: unknown`）；接口对象 `userApi`(`/api/sys/user`)、`roleApi`(`/api/sys/role`，含 `listByUserId`)、`menuApi`(`/api/sys/menu`，含 `listByRoleId`/`listByUserId`)、`deptApi`(`/api/sys/dept`)、`logApi`(`/api/sys/log`，含 `deleteAll`→`DELETE /api/sys/log/all`)。本地 `withQuery` 支持 `string | number | undefined`。
> 本项目页面**只使用** `modelProviderApi`；其余 api 文件必须存在且可编译，但页面仍走 mock。

### 15.4 `menu.ts`
`SysMenu` 实体（id/name/parentId/path/perms/type/orderNo/icon/component/isDisabled/isExt/isKeepalive/isShow）；`iconMap` 11 项（dashboard/appstore/comment/database/folder/creditCard/team/user/key/setting/fileText）；`toMenuItem` 映射（hidden=`isShow===0`、disabled=`isDisabled===1`、external=`isExt===1`）；`toMenuTree(list)` 过滤 `type==='button'|'btn'`、按 `orderNo` 升序、按 `parentId` 组树；`fetchMenus()` 请求 `/api/sys/menu` 后 `toMenuTree`。

## 16. mock 数据清单（规模与关键内容）

### 16.1 `pages/aigc-app/mockData.ts`
`modelOptions` 5 项（见 14.2）；`mockApps` **12 条**，id `1`–`12`，字段 `{id,name,logo,model,description,prompt,knowledgeBaseIds,createdAt,createdBy}`：
1 智能客服助手 🤖 gpt-4o（kb-1，2025-06-15 10:30，张三）/ 2 文案创作助手 ✍️ claude-3.5-sonnet / 3 代码审查助手 🔍 deepseek-chat（kb-2）/ 4 数据分析顾问 📊 gpt-4o-mini / 5 翻译大师 🌐 gpt-4o / 6 会议纪要生成器 📋 qwen-max（kb-3）/ 7 SQL 生成助手 🗄️ deepseek-chat / 8 周报撰写助手 📝 claude-3.5-sonnet / 9 PPT 大纲规划 📊 gpt-4o-mini / 10 合同审查助手 ⚖️ qwen-max（kb-4）/ 11 产品需求分析 🎯 gpt-4o / 12 邮件回复助手 💬 deepseek-chat。
创建者循环：张三、李四、王五、赵六。`prompt` 每项一句角色设定（照原文），`createdAt` 在 2025-06-15 至 2025-08-10 之间递增。

### 16.2 `pages/aigc-platform/mockData.ts`
- `mockChatModels`：4 个供应商 / 8 个版本 —— OpenAI(gpt-4o、gpt-4o-mini、gpt-3.5-turbo，均 4096/0.7/1.0)；Azure OpenAI(gpt-4，8192/0.5/0.95；gpt-35-turbo，4096/0.7/1.0)；通义千问(qwen-max 8192/0.85/0.8；qwen-plus 4096/0.7/1.0)；文心一言(ERNIE-4.0 8192/0.8/1.0)。
- `mockEmbeddingModels` 3 条：OpenAI/text-embedding-ada-002/ada-002/1536；通义千问/text-embedding-v2/v2/1024；Cohere/embed-multilingual-v3/v3/1024（baseUrl 分别 `https://api.openai.com/v1`、`https://dashscope.aliyuncs.com`、`https://api.cohere.ai/v1`）。
- `mockImageModels` 2 条：OpenAI DALL-E / Azure DALL-E（dall-e-3，endpoint `https://api.openai.com`、`https://xxx.openai.azure.com`）。
- `mockVectorDBs` 3 条：知识库主库(PgVector,1024,192.168.1.100:5432,smartai/kb_embeddings/postgres)、缓存向量库(Redis,1024,192.168.1.101:6379,redisIndex `vector_idx_0`)、大规模检索库(Milvus,1536,192.168.1.102:19530,milvus_db/doc_vectors)。
- `mockKnowledgeBases` **21 条**（id kb1–kb21），名称序列：产品帮助文档库、技术文档知识库、客服话术库、法律法规知识库、销售产品资料、内部培训资料、运维故障排查库、市场营销素材库、财务制度知识库、财务制度知识库、产品帮助文档库、技术文档知识库、客服话术库、法律法规知识库、销售产品资料、内部培训资料、运维故障排查库、市场营销素材库、财务制度知识库、市场营销素材库、财务制度知识库（后半段是前段的重复项，用于撑出第二页）。docCount 6–35，totalSize 3MB–70MB，createdBy 在 4 人中循环。
- `mockKnowledgeDocuments` 6 条（doc1–doc6）：产品使用指南.pdf / 常见问题解答.md / API接口文档.txt / 故障排除手册.docx / 版本更新日志.md / 部署说明书.pdf；source 交替 上传/录入（doc3、doc5 为录入）；sliceStatus doc4、doc6 为未训练。
- `mockKnowledgeSlices` 8 条（s1–s8），charCount 290–750，s6、s8 未训练。
- `mockConversationMessages` 38 条（`Array.from({length:38})`）：username `user1`–`user8`，role 按 `i%3` 循环 assistant/user/system，modelName 轮换 gpt-4o/gpt-4o-mini/qwen-max/ERNIE-4.0，时间递减 1 小时。
- `mockConversationSessions` 25 条：messageCount 1–50、tokenUsed 500–20500、lastConversationTime 递减 2 小时、createTime 递减 1 天。

### 16.3 其他 mock
- `Billing` 内联 53 条：`Array.from({length:53})`，username `user1@example.com`–`user12@example.com` 循环，modelName 在 gpt-4o/gpt-4o-mini/deepseek-v3/qwen-max/glm-4-plus 循环，`tokens=promptTokens+completionTokens`（prompt 100–2100、completion 200–3200），ip `192.168.x.x`，callTime 每次回溯 6 小时。
- `TokenManage` 内联 46 条：token `sk-` + 两段 36 进制随机串，account `userN@example.com`，expireTime = now + (i+1)*30 天。
- `permission/mockData.ts`：角色 4（超级管理员 admin / 普通用户 user / 运营人员 operator / 开发者 developer，含 menuPermissions 数组）；`menuPermissionTree` 覆盖 5 个一级 + 15 个页面菜单，每个菜单 4 个操作权限（add/edit/delete/view）；用户 5（admin/zhangsan/lisi/wangwu/zhaoliu，仅 wangwu status=0）；部门 13 节点（总公司 → 技术研发部[前端/后端/测试]、产品部[产品设计/用户研究]、市场营销部[品牌推广/渠道运营]、人力资源部、财务部）；菜单 80 节点（5 一级 + 15 菜单 + 60 按钮，`buildMenuButtons` 生成 add/edit/delete/view，m5-3 令牌管理 status=0）。
- `system/mockData.ts`：日志 20 条（id 1–20，success 15 条 / fail 5 条；costTime 含 3012、5023、8923、15023 等超 1000 的项）。
- `ApiChannelDrawer` 内联 3 条秘钥。

### 16.4 非确定性说明（必须知道）
账单/令牌/会话/切片搜索/Math.random 生成的数据每次运行的数值都不同（含 `Date.now()` 时间戳）。**结构、条数、交互完全一致，但具体数值不可复现**。若要求"两次生成数值也一致"，把 `Math.random()` 换成固定种子或写死数组，此时必须在文档中同步调整；默认不改，保持代码原样。

## 17. 视觉规范常量（统一遵守）

| 项 | 值 |
| --- | --- |
| 顶栏 / Logo 高度 | 56px（Logo 图标 28×28，标题 16px/600） |
| 侧栏宽度 / 折叠宽度 | 220 / 64 |
| 内容区内边距 | 16px（`.app-layout-page`）；页签栏 `padding:6px 16px 0` |
| 卡片 / 面板圆角 | 12px（页面卡片）、8px（内部分块、输入框容器）、6px（列表项） |
| 卡片高度 | 220px（应用卡、知识库卡、创建方块） |
| 卡片网格 | `repeat(auto-fill, minmax(280px, 1fr))`，gap 20px |
| 卡片内边距 | 20px（卡片）/ 24px（AIApp 页面内容区）/ 16px（知识库外层、PageContainer 默认） |
| 头像 | 用户 32px（顶栏）、40px（下拉信息行）、36px（聊天气泡） |
| 图标块 | 48px（创建方块内）、40px（卡片内）、36px（应用配置标题前） |
| 聊天气泡 | 圆角 12px、`px-3 py-2`、最大宽 80%、行高 22px、字号 14px |
| 表格 | `size="middle"` + `bordered`（模型子表为 `small`） |
| 分页 | `showSizeChanger` + `showQuickJumper`（卡片页 Pagination 也带） |
| 间距节奏 | 4 / 8 / 12 / 16 / 20 / 24 px |
| 抽屉宽度 | 设置 320、模型 480 |
| 弹窗宽度 | 应用 600、知识库/供应商 520、向量库/角色/用户 600、菜单 560 |

## 18. 已知坑与硬约束（漏一条就会不一致或报错）

1. **React.lazy 渲染**：`renderPage` 必须判断 `'$$typeof' in page`，否则 `createElement` 拿到 exotic 对象直接崩。
2. **antd v6 Tabs DOM**：层级是 `body-holder > body > content`，`.full-height-tabs` 只能写 `.ant-tabs-body` / `.ant-tabs-content`；写 v5 的 `.ant-tabs-tabpane` 无效。
3. **水平菜单 + 移动端**：`horizontal` 模式也必须处理 `isMobile`（抽屉 + 头部 `MenuOutlined`），否则移动端没有入口。
4. **选中态抖动**：布局缩略图用 `border: 2px solid var(--app-preview-border)` 常驻占位，只切 `border-color`；语言按钮 `min-width:36px`。
5. **ECharts**：必须 `import ReactEChartsCore from 'echarts-for-react/esm/core'`（`lib/core` 是 CJS，ESM 互操作会拿到 module 对象导致 React 报错）；`style` 必须显式 `width:'100%'`