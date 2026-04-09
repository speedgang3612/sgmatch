import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, User, LogIn, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({
  children,
}) => {
  const { user, loading, isAdmin, login } = useAuth();

  // 로딩 상태
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E63946] mx-auto mb-4"></div>
          <p className="text-[#9CA3AF]">권한을 확인하는 중...</p>
        </div>
      </div>
    );
  }

  // 로그인하지 않은 경우 - 로그인 유도
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] px-4">
        <Card className="w-full max-w-md bg-[#1A1A1A] border-[#2A2A2A]">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-[#E63946]/10 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-[#E63946]" />
            </div>
            <CardTitle className="text-xl text-white">
              관리자 로그인 필요
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-[#9CA3AF]">
              관리자 대시보드에 접근하려면 관리자 계정으로 로그인해야 합니다.
            </p>
            <p className="text-[#6B7280] text-sm">
              Atoms 플랫폼 관리자 계정으로 로그인하세요.
            </p>

            <div className="space-y-3 pt-2">
              <Button
                onClick={login}
                className="w-full bg-[#E63946] hover:bg-[#FF4D5A] text-white font-bold rounded-xl py-3 gap-2"
              >
                <LogIn className="h-4 w-4" />
                관리자 로그인
              </Button>

              <Link to="/">
                <Button
                  variant="outline"
                  className="w-full !bg-transparent border-[#2A2A2A] text-[#9CA3AF] hover:text-white hover:border-[#E63946] font-medium rounded-xl py-3 gap-2 mt-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  홈으로 돌아가기
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 로그인했지만 관리자가 아닌 경우
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] px-4">
        <Card className="w-full max-w-md bg-[#1A1A1A] border-[#2A2A2A]">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-red-500" />
            </div>
            <CardTitle className="text-xl text-white">
              접근 권한 없음
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-[#9CA3AF]">
              현재 계정에는 관리자 권한이 없습니다.
            </p>
            <div className="bg-[#111111] rounded-xl p-4 border border-[#2A2A2A]">
              <div className="flex items-center justify-center gap-2 text-sm">
                <User className="h-4 w-4 text-[#6B7280]" />
                <span className="text-[#9CA3AF]">
                  {user.email}
                </span>
              </div>
              <p className="text-xs text-[#6B7280] mt-1">
                역할: {user.role === 'user' ? '일반 사용자' : user.role}
              </p>
            </div>
            <p className="text-[#6B7280] text-sm">
              관리자 계정으로 다시 로그인해 주세요.
            </p>

            <div className="space-y-3 pt-2">
              <Button
                onClick={login}
                className="w-full bg-[#E63946] hover:bg-[#FF4D5A] text-white font-bold rounded-xl py-3 gap-2"
              >
                <LogIn className="h-4 w-4" />
                다른 계정으로 로그인
              </Button>

              <Link to="/">
                <Button
                  variant="outline"
                  className="w-full !bg-transparent border-[#2A2A2A] text-[#9CA3AF] hover:text-white hover:border-[#E63946] font-medium rounded-xl py-3 gap-2 mt-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  홈으로 돌아가기
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 관리자인 경우 자식 컴포넌트 렌더링
  return <>{children}</>;
};

export default ProtectedAdminRoute;