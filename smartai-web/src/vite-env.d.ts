/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 请求根地址，留空则走 dev proxy 的 /api 前缀 */
  readonly VITE_API_BASE_URL?: string;
  /** dev server 监听地址，默认 0.0.0.0 */
  readonly VITE_DEV_HOST?: string;
  /** dev server 端口，默认 3344 */
  readonly VITE_DEV_PORT?: string;
  /** dev proxy 的后端地址，默认 http://localhost:8080 */
  readonly VITE_API_TARGET?: string;
  /** 是否启用 dev mock 接口，默认开启 */
  readonly VITE_USE_MOCK?: string;
  /** 菜单接口：留空使用静态菜单；'mock' 走 dev mock；其他值视为真实接口地址 */
  readonly VITE_MENU_API?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
