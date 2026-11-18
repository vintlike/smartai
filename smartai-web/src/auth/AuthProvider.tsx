import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import {
  AUTH_CHANGED_EVENT,
  type AuthUser,
  fetchCurrentUser,
  login as loginApi,
  logout as logoutApi,
} from '@/api/auth';
import { clearToken, getToken, UNAUTHORIZED_EVENT } from '@/api/http';
import { PageLoading } from '@/framework';

export interface AuthContextValue {
  user: AuthUser | null;
  /** 首次校验本地 token 是否已结束，未结束时不渲染受保护路由 */
  ready: boolean;
  signIn: (username: string, password: string) => Promise<AuthUser>;
  signOut: () => Promise<void>;
  /** 重新拉取当前用户，资料修改后同步全局展示 */
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(() => !getToken());

  // 带着 token 刷新页面时，先用 /auth/current 换取最新用户信息
  useEffect(() => {
    if (!getToken()) return;
    let cancelled = false;
    fetchCurrentUser()
      .then((next) => {
        if (!cancelled) setUser(next);
      })
      .catch(() => {
        if (cancelled) return;
        clearToken();
        setUser(null);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // 任意接口返回 401 时统一登出，由 RequireAuth 负责跳转登录页
  useEffect(() => {
    const handleUnauthorized = () => {
      clearToken();
      setUser(null);
    };
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, []);

  // 登录接口可能被页面直接调用（不经过 signIn），监听登录态变更同步全局用户
  useEffect(() => {
    const handleAuthChanged = (event: Event) => {
      const detail = (event as CustomEvent<{ user: AuthUser | null }>).detail;
      setUser(detail?.user ?? null);
      setReady(true);
    };
    window.addEventListener(AUTH_CHANGED_EVENT, handleAuthChanged);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, handleAuthChanged);
  }, []);

  const signIn = useCallback(async (username: string, password: string) => {
    const next = await loginApi(username, password);
    setUser(next);
    setReady(true);
    return next;
  }, []);

  const signOut = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // 登出接口失败不影响本地清理
    }
    clearToken();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const next = await fetchCurrentUser();
    setUser(next);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, ready, signIn, signOut, refreshUser }),
    [user, ready, signIn, signOut, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth 必须在 AuthProvider 内使用');
  return context;
}

/**
 * 受保护路由：未登录跳登录页并记录来源地址，校验期间显示加载态。
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth();
  const location = useLocation();

  if (!ready) return <PageLoading />;
  if (!user) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }
  return <>{children}</>;
}
