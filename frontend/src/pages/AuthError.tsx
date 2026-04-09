import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function AuthErrorPage() {
  const [searchParams] = useSearchParams();
  const [countdown, setCountdown] = useState(5);
  const errorMessage =
    searchParams.get('msg') ||
    '죄송합니다. 인증 정보가 유효하지 않거나 만료되었습니다.';

  // Check if it's a network/DNS error
  const isNetworkError =
    errorMessage.includes('dns') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('balancer resolve') ||
    errorMessage.includes('network');

  const displayMessage = isNetworkError
    ? '서버 연결에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.'
    : errorMessage;

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = '/';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleReturnHome = () => {
    window.location.href = '/';
  };

  const handleRetryLogin = () => {
    window.location.href = '/api/v1/auth/login';
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0A] p-6 text-center">
      <div className="space-y-6 max-w-md">
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-[#E63946]/20 blur-xl rounded-full" />
              <AlertCircle
                className="relative h-12 w-12 text-[#E63946]"
                strokeWidth={1.5}
              />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white">인증 오류</h1>

          <p className="text-base text-[#9CA3AF]">{displayMessage}</p>

          <div className="pt-2">
            <p className="text-sm text-[#6B7280]">
              {countdown > 0 ? (
                <>
                  <span className="text-[#E63946] font-semibold text-base">
                    {countdown}
                  </span>
                  초 후 홈페이지로 자동 이동합니다
                </>
              ) : (
                '이동 중...'
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          {isNetworkError && (
            <Button
              onClick={handleRetryLogin}
              className="bg-[#E63946] hover:bg-[#FF4D5A] text-white font-bold rounded-xl px-6 gap-2"
            >
              <RefreshCw size={18} /> 다시 시도
            </Button>
          )}
          <Button
            onClick={handleReturnHome}
            variant="outline"
            className="!bg-transparent border-[#2A2A2A] text-white hover:border-[#E63946] hover:text-[#E63946] font-bold rounded-xl px-6"
          >
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    </div>
  );
}