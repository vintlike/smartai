import { Suspense, useMemo } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';
import { UserMenu } from '@/components/UserMenu';
import {
  BasicLayout,
  MenuErrorScreen,
  MenuLoadingScreen,
  MissingPage,
  NotFoundPage,
  PageLoading,
  useMenu,
} from '@/framework';
import { resolvePageComponent } from '@/router/pageRegistry';

/**
 * 根据接口菜单动态生成路由。
 * 菜单加载完成后才渲染布局，避免深链接在菜单就绪前命中 404。
 */
export function AppRouter() {
  const { leaves, firstMenuPath, loading, error, refresh } = useMenu();

  const routes = useMemo(() => {
    const pageRoutes = leaves.map((node) => {
      const Page = resolvePageComponent(node.component);
      return {
        path: node.path.replace(/^\/+/, ''),
        element: Page ? (
          <Suspense fallback={<PageLoading />}>
            <Page />
          </Suspense>
        ) : (
          <MissingPage component={node.component} />
        ),
      };
    });

    // 菜单树之外的详情页：由列表页点击进入，路由参数区分具体数据
    const detailRoutes = [
      { path: 'app/info/:id', component: '/app/detail' },
      { path: 'aigc/knowledge/:id', component: '/aigc/knowledge/detail' },
    ].map(({ path, component }) => {
      const Page = resolvePageComponent(component);
      return {
        path,
        element: Page ? (
          <Suspense fallback={<PageLoading />}>
            <Page />
          </Suspense>
        ) : (
          <MissingPage component={component} />
        ),
      };
    });

    return [
      {
        path: '/',
        element: <BasicLayout headerActions={<UserMenu />} />,
        children: [
          {
            index: true,
            element:
              firstMenuPath && firstMenuPath !== '/' ? (
                <Navigate to={firstMenuPath} replace />
              ) : (
                <NotFoundPage />
              ),
          },
          ...pageRoutes,
          ...detailRoutes,
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ];
  }, [leaves, firstMenuPath]);

  const element = useRoutes(routes);

  if (loading) return <MenuLoadingScreen />;
  if (error) return <MenuErrorScreen error={error} onRetry={refresh} />;
  return element;
}
