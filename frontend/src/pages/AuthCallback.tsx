import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * AuthCallback 페이지
 *
 * 백엔드 /api/v1/auth/callback 처리 후
 * 프론트엔드 /auth/callback?token=...&expires_at=...&token_type=Bearer 로 리다이렉트됨
 *
 * 이 페이지에서:
 * 1. URL 파라미터에서 token 추출
 * 2. localStorage에 토큰 저장
 * 3. 홈 또는 원래 경로로 이동
 */
export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    const expiresAt = searchParams.get('expires_at');
    const tokenType = searchParams.get('token_type');

    // 토큰이 있는 경우 저장 후 이동
    if (token) {
      try {
        // 1단계: 토큰 저장
        localStorage.setItem('access_token', token);
        if (expiresAt) localStorage.setItem('token_expires_at', expiresAt);
        if (tokenType) localStorage.setItem('token_type', tokenType);

        // 2단계: 대기 중인 역할이 있으면 백엔드에 역할 업데이트 요청
        const pendingRole = localStorage.getItem('pending_role');
        if (pendingRole) {
          try {
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://sgmatch.onrender.com';
            const res = await fetch(`${apiBase}/api/v1/auth/me/role`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({ role: pendingRole }),
            });
            if (res.ok) {
              // 새 JWT로 교체
              const data = await res.json();
              if (data.token) {
                localStorage.setItem('access_token', data.token);
                if (data.expires_at) localStorage.setItem('token_expires_at', String(data.expires_at));
              }
            }
          } catch (roleErr) {
            console.error('[AuthCallback] 역할 업데이트 실패 (무시하고 계속):', roleErr);
          } finally {
            // 성공/실패 관계없이 pending_role 제거
            localStorage.removeItem('pending_role');
          }
        }

        // 3단계: 원래 경로 또는 홈으로 이동
        const fromUrl = searchParams.get('from_url') || '/';
        navigate(fromUrl, { replace: true });
      } catch (err) {
        console.error('[AuthCallback] 토큰 저장 실패:', err);
        setError('인증 토큰 저장에 실패했습니다. 다시 시도해주세요.');
      }
      return;
    }


    // 토큰이 없는 경우 에러 처리
    const errorMsg = searchParams.get('error') || searchParams.get('msg');
    if (errorMsg) {
      setError(decodeURIComponent(errorMsg));
    } else {
      setError('인증 처리 중 문제가 발생했습니다. 다시 시도해주세요.');
    }
  }, [searchParams, navigate]);

  const handleGoHome = () => {
    navigate('/', { replace: true });
  };

  const handleRetry = () => {
    window.location.href = '/';
  };

  // 에러 상태
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-white px-4">
        <div className="text-center max-w-md space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-[#E63946]/20 blur-xl rounded-full" />
              <AlertCircle
                className="relative h-12 w-12 text-[#E63946]"
                strokeWidth={1.5}
              />
            </div>
          </div>
          <h1 className="text-2xl font-bold">인증 오류</h1>
          <p className="text-[#9CA3AF]">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button
              onClick={handleRetry}
              className="bg-[#E63946] hover:bg-[#FF4D5A] text-white font-bold rounded-xl px-6 py-3"
            >
              다시 시도
            </Button>
            <Button
              onClick={handleGoHome}
              variant="outline"
              className="!bg-transparent border-[#2A2A2A] text-white hover:border-[#E63946] hover:text-[#E63946] font-bold rounded-xl px-6 py-3"
            >
              홈으로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 로딩 상태 (토큰 처리 중)
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E63946] mx-auto mb-4" />
        <p className="text-[#9CA3AF]">인증 처리 중...</p>
      </div>
    </div>
  );
}