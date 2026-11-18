import {
  AppstoreOutlined,
  CreditCardOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  KeyOutlined,
  PartitionOutlined,
  PictureOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { AppMenuItem } from '@/framework';

/**
 * 菜单配置（业务侧）：布局框架与路由的共同数据源。
 * 默认作为静态菜单渲染，同时作为路由骨架；设置 VITE_MENU_API 后菜单展示改为接口数据，
 * 接口菜单需使用相同的 path 与 component 标识（见 src/api/menu.ts）。
 *
 * 字段说明：
 * - key：唯一标识，默认与路由路径一致
 * - path：跳转路径（缺省时使用 key）
 * - component：页面组件映射表（pageComponents）的 key
 * - hidden：不在菜单中展示（但仍生成路由）
 * - external：外链，点击新窗口打开
 */
export const menus: AppMenuItem[] = [
  {
    key: '/dashboard',
    label: '主控台',
    icon: <SettingOutlined />,
    component: 'Dashboard',
  },
  {
    key: '/aigc-app',
    label: 'AIGC应用',
    icon: <AppstoreOutlined />,
    children: [
      {
        key: '/aigc-app/chat',
        label: 'AI聊天助手',
        icon: <SettingOutlined />,
        component: 'chat',
      },
      {
        key: '/aigc-app/manage',
        label: 'AI应用管理',
        icon: <AppstoreOutlined />,
        component: 'appManage',
        children: [
          {
            /* 详情页路由（对齐旧项目 dynamicRoutes）：不进菜单仅生成路由，挂在归属菜单下自动继承高亮 */
            key: '/aigc-app/config/:appId',
            label: '应用配置',
            component: 'appConfig',
            hidden: true,
          },
        ],
      },
      {
        key: '/aigc-app/image',
        label: 'AI 绘图',
        icon: <PictureOutlined />,
        component: 'image',
      },
      {
        key: '/aigc-app/mindmap',
        label: '思维导图',
        icon: <PartitionOutlined />,
        component: 'mindmap',
      },
    ],
  },
  {
    key: '/aigc-platform',
    label: 'AIGC平台',
    icon: <SettingOutlined />,
    children: [
      {
        key: '/aigc-platform/models',
        label: '模型管理',
        icon: <SettingOutlined />,
        component: 'models',
      },
      {
        key: '/aigc-platform/providers',
        label: '模型供应商管理',
        icon: <SettingOutlined />,
        component: 'providers',
      },
      {
        key: '/aigc-platform/vector',
        label: '向量库管理',
        icon: <DatabaseOutlined />,
        component: 'vector',
      },
      {
        key: '/aigc-platform/knowledge',
        label: '知识库管理',
        icon: <FolderOpenOutlined />,
        component: 'knowledge',
        children: [
          {
            /* 详情页路由（对齐旧项目 dynamicRoutes）：不进菜单仅生成路由，挂在归属菜单下自动继承高亮 */
            key: '/aigc-platform/knowledge/:knowledgeId',
            label: '知识库数据',
            component: 'knowledgeData',
            hidden: true,
          },
        ],
      },
      {
        key: '/aigc-platform/conversation',
        label: '对话数据管理',
        icon: <SettingOutlined />,
        component: 'conversation',
      },
      {
        key: '/aigc-platform/billing',
        label: '账单统计',
        icon: <CreditCardOutlined />,
        component: 'billing',
      },
    ],
  },
  {
    key: '/permission',
    label: '权限管理',
    icon: <SettingOutlined />,
    children: [
      {
        key: '/permission/department',
        label: '部门管理',
        icon: <SettingOutlined />,
        component: 'department',
      },
      {
        key: '/permission/role',
        label: '角色管理',
        icon: <UserOutlined />,
        component: 'role',
      },
      {
        key: '/permission/user',
        label: '用户管理',
        icon: <SettingOutlined />,
        component: 'user',
      },
      {
        key: '/permission/menu',
        label: '菜单管理',
        icon: <SettingOutlined />,
        component: 'menu',
      },
    ],
  },
  {
    key: '/system',
    label: '系统管理',
    icon: <SettingOutlined />,
    children: [
      {
        key: '/system/config',
        label: '平台设置',
        icon: <SettingOutlined />,
        component: 'systemConfig',
      },
      {
        key: '/system/logs',
        label: '日志管理',
        icon: <FileTextOutlined />,
        component: 'logs',
      },
      {
        key: '/system/tokens',
        label: '令牌管理',
        icon: <KeyOutlined />,
        component: 'tokens',
      },
    ],
  },
  {
    key: '/profile',
    label: '个人中心',
    icon: <UserOutlined />,
    component: 'profile',
    hidden: true,
  },
];
