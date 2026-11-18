import type { LogItem } from './types';

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function formatTime(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

const logSeeds: Array<{
  description: string;
  url: string;
  method: string;
  costTime: number;
  status: 'success' | 'fail';
}> = [
  {
    description: '登录系统',
    url: '/api/sys/user/login',
    method: 'POST',
    costTime: 156,
    status: 'success',
  },
  {
    description: '查询用户列表',
    url: '/api/sys/user/list',
    method: 'GET',
    costTime: 89,
    status: 'success',
  },
  {
    description: '新增角色',
    url: '/api/sys/role',
    method: 'POST',
    costTime: 231,
    status: 'success',
  },
  {
    description: '删除菜单',
    url: '/api/sys/menu/12',
    method: 'DELETE',
    costTime: 412,
    status: 'fail',
  },
  {
    description: '更新部门',
    url: '/api/sys/dept/3',
    method: 'PUT',
    costTime: 3012,
    status: 'success',
  },
  {
    description: '查询日志',
    url: '/api/sys/log/list',
    method: 'GET',
    costTime: 1204,
    status: 'success',
  },
  {
    description: '新增知识库',
    url: '/api/aigc/knowledge',
    method: 'POST',
    costTime: 678,
    status: 'success',
  },
  {
    description: '上传知识库文档',
    url: '/api/aigc/docs/upload',
    method: 'POST',
    costTime: 5023,
    status: 'success',
  },
  {
    description: '重新向量化文档',
    url: '/api/aigc/docs/reindex',
    method: 'POST',
    costTime: 8923,
    status: 'fail',
  },
  {
    description: '删除模型供应商',
    url: '/api/aigc/model-provider/2',
    method: 'DELETE',
    costTime: 356,
    status: 'success',
  },
  {
    description: '新增模型',
    url: '/api/aigc/model',
    method: 'POST',
    costTime: 654,
    status: 'success',
  },
  {
    description: '查询账单统计',
    url: '/api/aigc/billing/list',
    method: 'GET',
    costTime: 15023,
    status: 'success',
  },
  {
    description: '导出对话数据',
    url: '/api/aigc/conversation/export',
    method: 'POST',
    costTime: 2311,
    status: 'fail',
  },
  {
    description: '切换主题样式',
    url: '/api/sys/config/theme',
    method: 'PUT',
    costTime: 76,
    status: 'success',
  },
  {
    description: '更新系统配置',
    url: '/api/sys/config',
    method: 'PUT',
    costTime: 189,
    status: 'success',
  },
  {
    description: '创建令牌',
    url: '/api/sys/token',
    method: 'POST',
    costTime: 245,
    status: 'success',
  },
  {
    description: '删除令牌',
    url: '/api/sys/token/8',
    method: 'DELETE',
    costTime: 133,
    status: 'fail',
  },
  {
    description: '查询向量库列表',
    url: '/api/aigc/embed-store/list',
    method: 'GET',
    costTime: 167,
    status: 'success',
  },
  {
    description: '更新向量库配置',
    url: '/api/aigc/embed-store/1',
    method: 'PUT',
    costTime: 582,
    status: 'success',
  },
  {
    description: '用户退出登录',
    url: '/api/sys/user/logout',
    method: 'POST',
    costTime: 54,
    status: 'success',
  },
];

export const mockLogs: LogItem[] = logSeeds.map((seed, index) => {
  const time = new Date(Date.now() - index * 5400000);
  return {
    id: index + 1,
    username: ['admin', 'zhangsan', 'lisi', 'wangwu', 'zhaoliu'][index % 5],
    status: seed.status,
    description: seed.description,
    url: seed.url,
    costTime: seed.costTime,
    method: `${seed.method} ${seed.url}`,
    ip: `192.168.1.${20 + index}`,
    operateTime: formatTime(time),
  };
});
