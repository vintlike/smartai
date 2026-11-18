# SmartAI Web

AI 智能平台前端：React 19 + Vite 8 + Ant Design 6 + TypeScript，内置布局框架、菜单/路由同源、国际化、主题切换与本地 mock。

## 快速开始

```bash
pnpm install
pnpm dev          # http://localhost:3344
```

dev 环境默认启用内存 mock，登录账号 `admin / admin123`。接真实后端时复制 `.env.example` 为 `.env.local` 并设置 `VITE_USE_MOCK=false` 与 `VITE_API_BASE_URL` / `VITE_API_TARGET`。

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 启动开发服务器（含 mock） |
| `pnpm build` | 类型检查 + 生产构建 |
| `pnpm check` / `pnpm check:fix` | Biome 检查 / 自动修复 |
| `pnpm format` | 格式化检查 |

## 目录结构

```
build/mock/          dev server 内存 mock（db / routes / middleware）
src/api/             请求层与接口封装（http.ts 统一解包、注入 token）
src/auth/            登录态与 RequireAuth
src/components/      通用业务组件（PageContainer / SearchBar / DataTable / TableToolbar / OrgChart）
src/config/          业务接入点：菜单、布局、页面组件映射、鉴权布局
src/framework/       与业务解耦的布局框架（菜单、主题、i18n、页签、刷新）
src/hooks/           通用 hook（useTableToolbar）
src/pages/           业务页面
src/router/          路由入口
```

路径别名 `@/` 指向 `src/`。

## 菜单与路由

- 页面路由由菜单声明自动生成：在 `src/config/menu.config.tsx` 声明菜单项，并在 `src/config/pageComponents.tsx` 补充同名的 `component` 映射。
- 详情页等不进菜单的页面，声明 `hidden: true` 仍会生成路由。
- 菜单数据源默认取本地静态数组；设置 `VITE_MENU_API` 后改为接口获取（dev 设为 `mock` 即走 `/api/sys/menu`），接口菜单需复用相同的 `path` 与 `component` 标识。路由骨架始终由本地声明生成。
- 菜单加载中展示占位，失败展示错误屏与重试按钮；异步请求带序号保护，避免竞态覆盖。

## 列表页规范

```tsx
const toolbar = useTableToolbar(columns, fetchList);
return <DataTable state={toolbar} dataSource={list} pagination={pagination} />;
```

- `DataTable` 统一提供工具栏（斑马纹、刷新、密度、列显隐）、默认分页（10/20/50）、空状态与横向滚动。
- 列 `key` 决定列设置中的显隐标识，操作列建议显式设置 `key`。
- `useTableToolbar` 会自动订阅页签刷新：页签刷新时只重新加载数据，保留筛选、页码与列设置。也可在任意页面用 `usePageRefresh(handler)` 接入同一机制。

## 国际化

```tsx
const { t, has, locale, setLocale } = useI18n();
t('common.total', { total: 12 }); // 共 12 条
```

- 词条位于 `src/framework/i18n/locales.ts`，支持 `{name}` 占位符插值。
- 业务可在 `layout.config.tsx` 通过 `i18nMessages` 覆盖同名 key，`fallbackLocale` 控制缺词兜底语言。

## 主题与样式

- 主题变量统一使用 `--app-color-*`（主色、文本、边框、容器背景、滚动条等），避免写死颜色。
- antd 组件颜色使用 `--ant-color-*` token；图表颜色应从 `useThemeMode()` 读取，跟随主题色联动。
- 样式优先级：UnoCSS 原子类 + Less 组件样式；滚动条等全局样式只在主题层定义。

## 请求与 mock

- `request` 自动拼接 query、注入 token、解包 `{ code, message, data }`，401 时派发 `smartai:unauthorized`。
- mock 路由在 `build/mock/routes.ts` 注册：特殊路由必须放在通用 `crud()` 之前，否则会被 `/:id` 抢占。
