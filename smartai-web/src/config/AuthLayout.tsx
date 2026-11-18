import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthProvider';
import { AppLayout, type LayoutConfig } from '@/framework';
import { layoutConfig } from './layout.config';

/**
 * 把登录态注入框架配置：用户名、头像、个人中心入口、登出行为随 AuthProvider 变化。
 */
export function AuthLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const config = useMemo<LayoutConfig>(
    () => ({
      ...layoutConfig,
      userInfo: user
        ? {
            name: user.name,
            account: user.account,
            avatar: user.avatar,
            description: user.description,
          }
        : undefined,
      onProfile: () => navigate('/profile'),
      onLogout: () => {
        void signOut();
      },
    }),
    [user, signOut, navigate],
  );

  return <AppLayout config={config} />;
}
