import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom';
import { RequireAuth } from '@/auth/AuthProvider';
import { AuthLayout } from '@/config/AuthLayout';
import { layoutConfig } from '@/config/layout.config';
import { menus } from '@/config/menu.config';
import { pageComponents } from '@/config/pageComponents';
import { buildMenuRoutes } from '@/framework';
import Login from '@/pages/Login';
import NotFound from '@/pages/NotFound';

/**
 * 路由与菜单同源：buildMenuRoutes 依据菜单项的 component 字段自动生成页面路由，
 * 新增页面只需在 menu.config.tsx 中声明并补充 pageComponents 映射。
 * 根路由包 RequireAuth 做登录校验，AuthLayout 负责把登录态注入布局配置。
 * 菜单数据源可切换为接口（VITE_MENU_API），路由骨架仍由本地菜单声明生成，
 * 接口菜单通过相同的 component 标识复用这些页面。
 */
const routes: RouteObject[] = [
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: (
      <RequireAuth>
        <AuthLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to={layoutConfig.homePath ?? '/dashboard'} replace /> },
      ...buildMenuRoutes(menus, pageComponents),
      { path: '*', element: <NotFound /> },
    ],
  },
];

const router = createBrowserRouter(routes);
export default router;
