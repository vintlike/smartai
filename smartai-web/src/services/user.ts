/**
 * 当前登录账号信息。
 * 真实项目中应由登录接口返回或由 token 解析后注入，这里用静态数据占位。
 */
export interface CurrentUser {
  id: string;
  /** 登录账号 */
  username: string;
  /** 展示名称 */
  nickname: string;
  avatar?: string;
  email?: string;
  phone?: string;
  /** 角色名称 */
  roleName?: string;
  /** 所属部门 */
  deptName?: string;
  /** 最近登录时间 */
  lastLoginAt?: string;
}

/** 当前登录账号（业务接入时替换为接口数据） */
export const currentUser: CurrentUser = {
  id: '1001',
  username: 'admin',
  nickname: '超级管理员',
  email: 'admin@smartai.dev',
  phone: '138****8888',
  roleName: '系统管理员',
  deptName: '平台研发部',
  lastLoginAt: '2026-10-25 09:12:30',
};

/** 会话缓存 key，退出登录时清理 */
const sessionKey = 'smartai:token';

/**
 * 退出登录：真实项目在此调用退出接口、清理 token 并跳转登录页，
 * 这里只做本地会话清理，交由调用方决定后续跳转。
 */
export async function logout(): Promise<void> {
  localStorage.removeItem(sessionKey);
}
