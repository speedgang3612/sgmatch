import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * 로그인 여부만 확인하는 라우트 가드.
 * 비로그인 사용자에게 로그인 유도 UI를 표시한다.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, login } = useAuth();

  // 인증 상태 로딩 중
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E63946] mx-auto mb-4"></div>
          <p className="text-[#9CA3AF]">인증 상태를 확인하는 중...</p>
        </div>
      </div>
    );
  }

  // 비로그인 사용자 — 로그인 유도
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] px-4">
        <Card className="w-full max-w-md bg-[#1A1A1A] border-[#2A2A2A]">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-[#E63946]/10 rounded-full flex items-center justify-center mb-4">
              <Zap className="h-8 w-8 text-[#E63946]" />
            </div>
            <CardTitle className="text-xl text-white">
              로그인이 필요합니다
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-[#9CA3AF]">
              이 페이지에 접근하려면 로그인이 필요합니다.
            </p>

            <div className="space-y-3 pt-2">
              <Button
                id="protected-route-login-btn"
                onClick={() => login()}
                className="w-full bg-[#E63946] hover:bg-[#FF4D5A] text-white font-bold rounded-xl py-3"
              >
                <LogIn className="mr-2 h-4 w-4" />
                로그인하기
              </Button>
              <Link to="/" id="protected-route-home-link">
                <Button
                  variant="outline"
                  className="w-full !bg-transparent border-[#3A3A3A] text-[#9CA3AF] hover:text-white rounded-xl py-3"
                >
                  홈으로 돌아가기
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 로그인 상태 — 자식 컴포넌트 렌더링
  return <>{children}</>;
};

export default ProtectedRoute;
