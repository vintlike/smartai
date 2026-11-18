import { Spin } from 'antd';
import { type ComponentType, createElement, type ReactNode, Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { MissingPage } from '../layout/components/ResultPages';
import type { AppMenuItem, PageComponent } from '../types';
import { getItemPath } from './MenuUtil';

/** 页面组件映射表：key 与菜单项的 component 字段对应（接口菜单返回组件标识时同样适用） */
export type PageComponentMap = Record<string, PageComponent>;

/** 懒加载页面占位 */
export function PageLoading() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
      <Spin />
    </div>
  );
}

/** 渲染页面：函数组件统一 createElement；lazy/forwardRef 等 exotic 组件对象同样需要 createElement，其余按 ReactNode 原样返回 */
export function renderPage(page: PageComponent): ReactNode {
  if (
    typeof page === 'function' ||
    (typeof page === 'object' && page !== null && '$$typeof' in page)
  ) {
    return createElement(page as ComponentType);
  }
  return page;
}

/**
 * 由菜单树生成路由：菜单项声明了 component（对应映射表 key）时生成对应路由。
 * 未注册组件时渲染兜底提示页，避免整站白屏；静态菜单、接口菜单均适用。
 */
export function buildMenuRoutes(
  menus: AppMenuItem[],
  pageComponents: PageComponentMap,
  fallback?: ReactNode,
): RouteObject[] {
  const routes: RouteObject[] = [];

  const walk = (items: AppMenuItem[]) => {
    for (const item of items) {
      if (item.children?.length) walk(item.children);
      if (!item.component) continue;
      const page = pageComponents[item.component];
      if (page === undefined || page === null) {
        console.warn(`[layout] 菜单 ${item.key} 未找到组件映射：${item.component}`);
        routes.push({
          path: getItemPath(item),
          element: <MissingPage component={item.component} />,
        });
        continue;
      }
      routes.push({
        path: getItemPath(item),
        element: <Suspense fallback={fallback ?? <PageLoading />}>{renderPage(page)}</Suspense>,
      });
    }
  };

  walk(menus);
  return routes;
}
