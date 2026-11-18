import { lazy } from 'react';
import type { PageComponentMap } from '@/framework';

/**
 * 页面组件映射表（业务侧）：key 与菜单项的 component 字段对应。
 * - 全部使用懒加载（lazy + Suspense，加载占位由 buildMenuRoutes 统一提供），按需分包
 * - 新增页面：在 menu.config.tsx 声明菜单项，并在此补充 lazy 映射即可
 */
export const pageComponents: PageComponentMap = {
  Dashboard: lazy(() => import('@/pages/Dashboard')),
  chat: lazy(() => import('@/pages/aigc-app/AIChat')),
  image: lazy(() => import('@/pages/aigc-app/AIImage')),
  mindmap: lazy(() => import('@/pages/aigc-app/AIMindmap')),
  appManage: lazy(() => import('@/pages/aigc-app/AIApp')),
  appConfig: lazy(() => import('@/pages/aigc-app/AIAppConfig')),
  models: lazy(() => import('@/pages/aigc-platform/ModelManage')),
  providers: lazy(() => import('@/pages/aigc-platform/ProviderManage')),
  vector: lazy(() => import('@/pages/aigc-platform/VectorManage')),
  knowledge: lazy(() => import('@/pages/aigc-platform/KnowledgeManage')),
  knowledgeData: lazy(() => import('@/pages/aigc-platform/KnowledgeData')),
  conversation: lazy(() => import('@/pages/aigc-platform/ConversationManage')),
  billing: lazy(() => import('@/pages/aigc-platform/Billing')),
  department: lazy(() => import('@/pages/permission/DepartmentManage')),
  role: lazy(() => import('@/pages/permission/RoleManage')),
  user: lazy(() => import('@/pages/permission/UserManage')),
  menu: lazy(() => import('@/pages/permission/MenuManage')),
  systemConfig: lazy(() => import('@/pages/system/SystemConfig')),
  logs: lazy(() => import('@/pages/system/LogManage')),
  tokens: lazy(() => import('@/pages/system/TokenManage')),
  profile: lazy(() => import('@/pages/Profile')),
};
