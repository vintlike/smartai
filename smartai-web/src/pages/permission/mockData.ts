import type { DeptItem, MenuItem, MenuPermissionNode, RoleItem, UserItem } from './types';

const operationTypes = [
  { key: 'add', title: '新增' },
  { key: 'edit', title: '编辑' },
  { key: 'delete', title: '删除' },
  { key: 'view', title: '查看' },
];

interface PermissionMenuSource {
  path: string;
  title: string;
  icon: string;
}

const permissionMenuGroups: Array<{ title: string; menus: PermissionMenuSource[] }> = [
  {
    title: 'AIGC应用',
    menus: [
      { path: '/aigc-app/chat', title: 'AI聊天助手', icon: 'comment' },
      { path: '/aigc-app/manage', title: 'AI应用管理', icon: 'appstore' },
    ],
  },
  {
    title: 'AIGC平台',
    menus: [
      { path: '/aigc-platform/models', title: '模型管理', icon: 'setting' },
      { path: '/aigc-platform/providers', title: '模型供应商管理', icon: 'setting' },
      { path: '/aigc-platform/vector', title: '向量库管理', icon: 'database' },
      { path: '/aigc-platform/knowledge', title: '知识库管理', icon: 'folder' },
      { path: '/aigc-platform/conversation', title: '对话数据管理', icon: 'comment' },
      { path: '/aigc-platform/billing', title: '账单统计', icon: 'creditCard' },
    ],
  },
  {
    title: '权限管理',
    menus: [
      { path: '/permission/department', title: '部门管理', icon: 'team' },
      { path: '/permission/role', title: '角色管理', icon: 'user' },
      { path: '/permission/user', title: '用户管理', icon: 'user' },
      { path: '/permission/menu', title: '菜单管理', icon: 'setting' },
    ],
  },
  {
    title: '系统管理',
    menus: [
      { path: '/system/config', title: '系统配置', icon: 'setting' },
      { path: '/system/logs', title: '日志管理', icon: 'fileText' },
      { path: '/system/tokens', title: '令牌管理', icon: 'key' },
    ],
  },
];

export const menuPermissionTree: MenuPermissionNode[] = [
  {
    key: '/dashboard',
    title: '主控台',
    children: operationTypes.map((item) => ({
      key: `/dashboard:${item.key}`,
      title: item.title,
    })),
  },
  ...permissionMenuGroups.map((group) => ({
    key: group.title,
    title: group.title,
    children: group.menus.map((menu) => ({
      key: menu.path,
      title: menu.title,
      children: operationTypes.map((item) => ({
        key: `${menu.path}:${item.key}`,
        title: item.title,
      })),
    })),
  })),
];

export function collectPermissionKeys(nodes: MenuPermissionNode[]): string[] {
  return nodes.flatMap((node) => [
    node.key,
    ...(node.children ? collectPermissionKeys(node.children) : []),
  ]);
}

const allPermissionKeys = collectPermissionKeys(menuPermissionTree);

function pickPermissions(paths: string[]): string[] {
  return allPermissionKeys.filter((key) =>
    paths.some((path) => key === path || key.startsWith(`${path}:`) || key.startsWith(`${path}/`)),
  );
}

export const mockRoles: RoleItem[] = [
  {
    id: 'role-1',
    roleName: '超级管理员',
    roleKey: 'admin',
    roleDesc: '拥有平台全部菜单与操作权限。',
    menuPermissions: allPermissionKeys,
  },
  {
    id: 'role-2',
    roleName: '普通用户',
    roleKey: 'user',
    roleDesc: '仅可访问主控台与 AIGC 应用相关菜单。',
    menuPermissions: pickPermissions(['/dashboard', '/aigc-app/chat', '/aigc-app/manage']),
  },
  {
    id: 'role-3',
    roleName: '运营人员',
    roleKey: 'operator',
    roleDesc: '可维护 AIGC 平台的知识库、对话数据与账单。',
    menuPermissions: pickPermissions([
      '/dashboard',
      '/aigc-app/chat',
      '/aigc-platform/knowledge',
      '/aigc-platform/conversation',
      '/aigc-platform/billing',
    ]),
  },
  {
    id: 'role-4',
    roleName: '开发者',
    roleKey: 'developer',
    roleDesc: '可维护模型、供应商与向量库配置。',
    menuPermissions: pickPermissions([
      '/dashboard',
      '/aigc-platform/models',
      '/aigc-platform/providers',
      '/aigc-platform/vector',
      '/system/logs',
    ]),
  },
];

export const mockUsers: UserItem[] = [
  {
    id: 'user-1',
    username: 'admin',
    realName: '管理员',
    role: '超级管理员',
    deptName: '总公司',
    status: 1,
    email: 'admin@smartai.com',
    phone: '13800000001',
  },
  {
    id: 'user-2',
    username: 'zhangsan',
    realName: '张三',
    role: '运营人员',
    deptName: '市场营销部',
    status: 1,
    email: 'zhangsan@smartai.com',
    phone: '13800000002',
  },
  {
    id: 'user-3',
    username: 'lisi',
    realName: '李四',
    role: '开发者',
    deptName: '技术研发部',
    status: 1,
    email: 'lisi@smartai.com',
    phone: '13800000003',
  },
  {
    id: 'user-4',
    username: 'wangwu',
    realName: '王五',
    role: '普通用户',
    deptName: '产品部',
    status: 0,
    email: 'wangwu@smartai.com',
    phone: '13800000004',
  },
  {
    id: 'user-5',
    username: 'zhaoliu',
    realName: '赵六',
    role: '普通用户',
    deptName: '人力资源部',
    status: 1,
    email: 'zhaoliu@smartai.com',
    phone: '13800000005',
  },
];

export const mockDepartments: DeptItem[] = [
  {
    id: 'dept-1',
    deptName: '总公司',
    parentDept: '-',
    deptDesc: '公司总部，负责整体经营管理。',
    children: [
      {
        id: 'dept-2',
        deptName: '技术研发部',
        parentDept: '总公司',
        deptDesc: '负责平台研发与技术支撑。',
        children: [
          {
            id: 'dept-3',
            deptName: '前端组',
            parentDept: '技术研发部',
            deptDesc: '负责前端应用开发。',
          },
          {
            id: 'dept-4',
            deptName: '后端组',
            parentDept: '技术研发部',
            deptDesc: '负责服务端与模型接入。',
          },
          {
            id: 'dept-5',
            deptName: '测试组',
            parentDept: '技术研发部',
            deptDesc: '负责质量保障与自动化测试。',
          },
        ],
      },
      {
        id: 'dept-6',
        deptName: '产品部',
        parentDept: '总公司',
        deptDesc: '负责产品规划与体验设计。',
        children: [
          {
            id: 'dept-7',
            deptName: '产品设计组',
            parentDept: '产品部',
            deptDesc: '负责产品方案设计。',
          },
          {
            id: 'dept-8',
            deptName: '用户研究组',
            parentDept: '产品部',
            deptDesc: '负责用户调研与数据分析。',
          },
        ],
      },
      {
        id: 'dept-9',
        deptName: '市场营销部',
        parentDept: '总公司',
        deptDesc: '负责品牌推广与渠道拓展。',
        children: [
          {
            id: 'dept-10',
            deptName: '品牌推广组',
            parentDept: '市场营销部',
            deptDesc: '负责品牌宣传与内容运营。',
          },
          {
            id: 'dept-11',
            deptName: '渠道运营组',
            parentDept: '市场营销部',
            deptDesc: '负责渠道合作与客户拓展。',
          },
        ],
      },
      {
        id: 'dept-12',
        deptName: '人力资源部',
        parentDept: '总公司',
        deptDesc: '负责招聘、培训与绩效管理。',
      },
      {
        id: 'dept-13',
        deptName: '财务部',
        parentDept: '总公司',
        deptDesc: '负责财务核算与预算管理。',
      },
    ],
  },
];

function buildMenuButtons(parent: { id: string; name: string; path: string }): MenuItem[] {
  return operationTypes.map((item, index) => ({
    id: `${parent.id}-${item.key}`,
    parentId: parent.id,
    name: `${parent.name}${item.title}`,
    path: '',
    menuType: 'button',
    order: index + 1,
    perms: `${parent.path}:${item.key}`,
    status: 1,
  }));
}

interface MenuSeed {
  id: string;
  name: string;
  path: string;
  icon: string;
  component?: string;
  status?: 0 | 1;
  children?: MenuSeed[];
}

const menuSeeds: MenuSeed[] = [
  {
    id: 'm1',
    name: '主控台',
    path: '/dashboard',
    icon: 'DashboardOutlined',
    component: 'pages/Dashboard',
  },
  {
    id: 'm2',
    name: 'AIGC应用',
    path: '/aigc-app',
    icon: 'AppstoreOutlined',
    children: [
      {
        id: 'm2-1',
        name: 'AI聊天助手',
        path: '/aigc-app/chat',
        icon: 'MessageOutlined',
        component: 'pages/aigc-app/AIChat',
      },
      {
        id: 'm2-2',
        name: 'AI应用管理',
        path: '/aigc-app/manage',
        icon: 'AppstoreOutlined',
        component: 'pages/aigc-app/AIApp',
      },
    ],
  },
  {
    id: 'm3',
    name: 'AIGC平台',
    path: '/aigc-platform',
    icon: 'SettingOutlined',
    children: [
      {
        id: 'm3-1',
        name: '模型管理',
        path: '/aigc-platform/models',
        icon: 'RobotOutlined',
        component: 'pages/aigc-platform/ModelManage',
      },
      {
        id: 'm3-2',
        name: '模型供应商管理',
        path: '/aigc-platform/providers',
        icon: 'CloudServerOutlined',
        component: 'pages/aigc-platform/ProviderManage',
      },
      {
        id: 'm3-3',
        name: '向量库管理',
        path: '/aigc-platform/vector',
        icon: 'DatabaseOutlined',
        component: 'pages/aigc-platform/VectorManage',
      },
      {
        id: 'm3-4',
        name: '知识库管理',
        path: '/aigc-platform/knowledge',
        icon: 'FolderOpenOutlined',
        component: 'pages/aigc-platform/KnowledgeManage',
      },
      {
        id: 'm3-5',
        name: '对话数据管理',
        path: '/aigc-platform/conversation',
        icon: 'MessageOutlined',
        component: 'pages/aigc-platform/ConversationManage',
      },
      {
        id: 'm3-6',
        name: '账单统计',
        path: '/aigc-platform/billing',
        icon: 'CreditCardOutlined',
        component: 'pages/aigc-platform/Billing',
      },
    ],
  },
  {
    id: 'm4',
    name: '权限管理',
    path: '/permission',
    icon: 'SafetyOutlined',
    children: [
      {
        id: 'm4-1',
        name: '部门管理',
        path: '/permission/department',
        icon: 'ApartmentOutlined',
        component: 'pages/permission/DepartmentManage',
      },
      {
        id: 'm4-2',
        name: '角色管理',
        path: '/permission/role',
        icon: 'TeamOutlined',
        component: 'pages/permission/RoleManage',
      },
      {
        id: 'm4-3',
        name: '用户管理',
        path: '/permission/user',
        icon: 'UserOutlined',
        component: 'pages/permission/UserManage',
      },
      {
        id: 'm4-4',
        name: '菜单管理',
        path: '/permission/menu',
        icon: 'MenuOutlined',
        component: 'pages/permission/MenuManage',
      },
    ],
  },
  {
    id: 'm5',
    name: '系统管理',
    path: '/system',
    icon: 'ControlOutlined',
    children: [
      {
        id: 'm5-1',
        name: '系统配置',
        path: '/system/config',
        icon: 'SettingOutlined',
        component: 'pages/system/SystemConfig',
      },
      {
        id: 'm5-2',
        name: '日志管理',
        path: '/system/logs',
        icon: 'FileTextOutlined',
        component: 'pages/system/LogManage',
      },
      {
        id: 'm5-3',
        name: '令牌管理',
        path: '/system/tokens',
        icon: 'KeyOutlined',
        component: 'pages/system/TokenManage',
        status: 0,
      },
    ],
  },
];

export function toMenuTree(seeds: MenuSeed[], parentId?: string): MenuItem[] {
  return seeds.map((seed, index) => {
    const base: MenuItem = {
      id: seed.id,
      parentId,
      name: seed.name,
      path: seed.path,
      menuType: seed.children ? 'catalog' : 'menu',
      component: seed.component,
      icon: seed.icon,
      order: index + 1,
      status: seed.status ?? 1,
    };
    if (seed.children) {
      return { ...base, children: toMenuTree(seed.children, seed.id) };
    }
    return { ...base, children: buildMenuButtons(base) };
  });
}

export const mockMenus: MenuItem[] = toMenuTree(menuSeeds);
