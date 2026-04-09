import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { client } from '../lib/api';

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
  login: () => Promise<void>;
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

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await client.auth.me();
      if (result?.data) {
        setUser(result.data as User);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    try {
      setError(null);
      await client.auth.toLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await client.auth.logout();
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그아웃에 실패했습니다.');
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const isAdmin = user?.role === 'admin';

  const value: AuthContextType = {
    user,
    loading,
    error,
    isAdmin,
    login,
    logout,
    refetch: checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};