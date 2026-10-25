import type { MenuItem } from '@/framework';
import mockMenus from '@/services/mock-menu';

const MENU_API = import.meta.env.VITE_MENU_API as string | undefined;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 获取菜单列表。
 * - 配置 VITE_MENU_API 时请求真实接口（兼容直接数组与 { data: [] } 两种返回）
 * - 未配置时使用本地 mock，方便框架独立运行
 */
export async function fetchMenuList(): Promise<MenuItem[]> {
  if (!MENU_API) {
    await delay(300);
    return mockMenus;
  }

  const response = await fetch(MENU_API, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`菜单接口请求失败（${response.status}）`);
  }

  const payload: unknown = await response.json();
  const list = Array.isArray(payload) ? payload : (payload as { data?: unknown }).data;
  if (!Array.isArray(list)) {
    throw new Error('菜单接口返回格式不正确');
  }
  return list as MenuItem[];
}
