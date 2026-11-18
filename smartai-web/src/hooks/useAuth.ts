import { useAuth as useAuthContext } from '@/auth/AuthProvider';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

/** 登录态快照：在全局 AuthProvider 基础上补充归一化的 status */
export function useAuth() {
  const auth = useAuthContext();
  const status: AuthStatus = auth.ready
    ? auth.user
      ? 'authenticated'
      : 'unauthenticated'
    : 'loading';

  return { ...auth, status };
}
