import type { ComponentType, LazyExoticComponent } from 'react';
import { lazy } from 'react';

type PageModule = { default: ComponentType };
type PageLoader = () => Promise<PageModule>;

/**
 * 约定：菜单 component 与 src/pages 下文件路径一一对应。
 * 例如 component = '/chat/index' -> src/pages/chat/index.tsx
 */
const pageModules = import.meta.glob('@/pages/**/*.tsx') as Record<string, PageLoader>;

/** 模块 key 归一化为 pages 下的相对路径，消除别名/相对前缀差异 */
function toPageKey(moduleKey: string): string {
  return moduleKey.replace(/^.*?pages\//, '').replace(/\.tsx$/, '');
}

const pageLoaders = new Map(
  Object.entries(pageModules).map(([moduleKey, loader]) => [toPageKey(moduleKey), loader]),
);

const pageCache = new Map<string, LazyExoticComponent<ComponentType> | null>();

function normalizeComponent(component: string): string {
  return component.replace(/^\/+/, '').replace(/\.(tsx|jsx|ts|js)$/, '');
}

/** 根据菜单 component 解析页面组件，未匹配时返回 null */
export function resolvePageComponent(component: string): LazyExoticComponent<ComponentType> | null {
  if (pageCache.has(component)) return pageCache.get(component) ?? null;

  const loader = pageLoaders.get(normalizeComponent(component));
  const page = loader ? lazy(loader) : null;
  pageCache.set(component, page);
  return page;
}
