import { lazy } from 'react'
import type { ComponentType, LazyExoticComponent } from 'react'

type PageModule = { default: ComponentType }

/**
 * 约定：菜单 component 与 src/pages 下文件路径一一对应。
 * 例如 component = '/chat/index' -> src/pages/chat/index.tsx
 */
const pageModules = import.meta.glob('../pages/**/*.tsx') as Record<
  string,
  () => Promise<PageModule>
>

const pageCache = new Map<string, LazyExoticComponent<ComponentType> | null>()

function normalizeComponent(component: string): string {
  return component.replace(/^\/+/, '').replace(/\.(tsx|jsx|ts|js)$/, '')
}

/** 根据菜单 component 解析页面组件，未匹配时返回 null */
export function resolvePageComponent(
  component: string,
): LazyExoticComponent<ComponentType> | null {
  if (pageCache.has(component)) return pageCache.get(component) ?? null

  const path = `../pages/${normalizeComponent(component)}.tsx`
  const loader = pageModules[path]
  const page = loader ? lazy(loader) : null
  pageCache.set(component, page)
  return page
}
