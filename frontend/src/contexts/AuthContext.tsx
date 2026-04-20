import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// ------------------------------------------------------------------
// 내부 User 타입 — 기존 컴포넌트들과 호환되는 형태 유지
// ------------------------------------------------------------------
interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  [key: string]: unknown;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  isAgency: boolean;
  /** 로그인 페이지로 이동 (role 파라미터는 하위 호환용) */
  login: (role?: string) => Promise<void>;
  /** Supabase 세션 로그아웃 */
  logout: () => Promise<void>;
  /** 세션 강제 갱신 */
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ------------------------------------------------------------------
// SupabaseUser → 내부 User 변환
// ------------------------------------------------------------------
function mapSupabaseUser(sbUser: SupabaseUser | null): User | null {
  if (!sbUser) return null;
  const meta = sbUser.user_metadata || {};
  return {
    id: sbUser.id,
    email: sbUser.email ?? '',
    name: meta.full_name ?? meta.name ?? meta.display_name,
    role: meta.role ?? sbUser.app_metadata?.role ?? 'user',
  };
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 세션이 바뀌면 내부 user 상태도 갱신
  const syncSession = useCallback((s: Session | null) => {
    setSession(s);
    setUser(mapSupabaseUser(s?.user ?? null));
  }, []);

  useEffect(() => {
    // 초기 세션 로드
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      syncSession(s);
      setLoading(false);
    });

    // 세션 변경 구독 (로그인 / 로그아웃 / 토큰 갱신 등)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      syncSession(s);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [syncSession]);

  // 로그인 → /login 페이지로 이동 (하위 호환: role 파라미터 무시)
  const login = async (_role?: string) => {
    window.location.href = '/login';
  };

  // 로그아웃
  const logout = async () => {
    try {
      setError(null);
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      window.location.href = '/';
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그아웃에 실패했습니다.');
    }
  };

  // 세션 강제 갱신
  const refetch = useCallback(async () => {
    const { data: { session: s } } = await supabase.auth.getSession();
    syncSession(s);
  }, [syncSession]);

  const isAdmin = user?.role === 'admin';
  const isAgency = user?.role === 'agency';

  const value: AuthContextType = {
    user,
    session,
    loading,
    error,
    isAdmin,
    isAgency,
    login,
    logout,
    refetch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};