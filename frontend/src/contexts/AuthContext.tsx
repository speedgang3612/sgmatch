import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { authApi } from '../lib/auth';

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  [key: string]: unknown;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  isAgency: boolean;    // 지사 역할 여부
  login: (role?: string) => Promise<void>;
  logout: () => Promise<void>;
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

/**
 * JWT 토큰에서 payload를 직접 파싱하여 유저 정보를 추출한다.
 * /me API를 호출하지 않으므로 네트워크 지연/오류 없이 즉시 반영된다.
 */
function parseUserFromToken(): User | null {
  const token = localStorage.getItem('access_token');
  if (!token) return null;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));

    // JWT 만료 확인
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('token_expires_at');
      localStorage.removeItem('token_type');
      return null;
    }

    return {
      id: payload.sub || '',
      email: payload.email || '',
      name: payload.name,
      role: payload.role || 'user',
    };
  } catch {
    return null;
  }
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => parseUserFromToken());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // localStorage의 JWT를 파싱하여 유저 정보를 즉시 갱신하는 함수
  const refreshFromToken = useCallback(() => {
    const parsed = parseUserFromToken();
    setUser(parsed);
  }, []);

  // /me API 호출 (서버 검증이 필요한 경우)
  const checkAuthStatus = useCallback(async () => {
    try {
      setError(null);
      const result = await authApi.getCurrentUser();
      if (result) {
        setUser(result as User);
      } else {
        setUser(null);
      }
    } catch {
      // API 실패 시 localStorage 토큰으로 폴백
      refreshFromToken();
    }
  }, [refreshFromToken]);

  const login = async (role?: string) => {
    try {
      setError(null);
      await authApi.login(role);
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await authApi.logout();
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그아웃에 실패했습니다.');
    }
  };

  // refetch: localStorage의 JWT를 즉시 파싱 + 서버 검증
  const refetch = useCallback(async () => {
    // 즉시 localStorage에서 파싱 → UI 반영
    refreshFromToken();
    // 비동기적으로 서버 검증도 수행
    await checkAuthStatus();
  }, [refreshFromToken, checkAuthStatus]);

  useEffect(() => {
    // 초기 로드: JWT 파싱(이미 state 초기값으로) + 서버 검증
    checkAuthStatus();
  }, [checkAuthStatus]);

  const isAdmin = user?.role === 'admin';
  const isAgency = user?.role === 'agency';  // 지사 역할

  const value: AuthContextType = {
    user,
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