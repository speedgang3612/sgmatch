import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

/**
 * AuthCallback 페이지
 *
 * Supabase OAuth / 이메일 인증 후 리다이렉트되는 경로.
 * supabase-js가 URL hash/query에서 자동으로 세션을 추출하므로
 * onAuthStateChange 이벤트를 기다렸다가 홈으로 이동한다.
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Supabase가 URL을 파싱하여 세션을 설정하는 동안 대기
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // 로그인 완료 → 홈 또는 원래 경로로 이동
        const params = new URLSearchParams(window.location.search);
        const redirectTo = params.get('redirect') || '/';
        navigate(redirectTo, { replace: true });
        subscription.unsubscribe();
        return;
      }
      if (event === 'PASSWORD_RECOVERY') {
        navigate('/', { replace: true });
        subscription.unsubscribe();
        return;
      }
    });

    // 3초 안에 세션이 없으면 에러 처리
    const timeout = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/', { replace: true });
      } else {
        // URL에 에러 파라미터가 있는지 확인
        const params = new URLSearchParams(window.location.search);
        const errMsg = params.get('error_description') || params.get('error');
        setError(errMsg ? decodeURIComponent(errMsg) : '인증 처리 중 문제가 발생했습니다.');
      }
      subscription.unsubscribe();
    }, 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [navigate]);

  const handleGoHome = () => navigate('/', { replace: true });
  const handleRetry = () => (window.location.href = '/login');

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-white px-4">
        <div className="text-center max-w-md space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-[#E63946]/20 blur-xl rounded-full" />
              <AlertCircle className="relative h-12 w-12 text-[#E63946]" strokeWidth={1.5} />
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E63946] mx-auto mb-4" />
        <p className="text-[#9CA3AF]">인증 처리 중...</p>
      </div>
    </div>
  );
}