import { useEffect, useState } from 'react';
import { client } from '../lib/api';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AuthCallback() {
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const attemptLogin = async () => {
    try {
      setError(null);
      setRetrying(true);
      await client.auth.login();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : '인증 처리 중 오류가 발생했습니다.';

      // Check if it's a DNS/network error (retryable)
      const isNetworkError =
        message.includes('dns') ||
        message.includes('timeout') ||
        message.includes('network') ||
        message.includes('ECONNREFUSED') ||
        message.includes('balancer resolve') ||
        (err &&
          typeof err === 'object' &&
          'response' in err &&
          (err as { response?: { status?: number } }).response?.status === 500);

      if (isNetworkError && retryCount < MAX_RETRIES) {
        // Auto-retry with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, retryCount), 8000);
        setRetryCount((prev) => prev + 1);
        setTimeout(() => {
          attemptLogin();
        }, delay);
        return;
      }

      setError(
        isNetworkError
          ? '서버 연결에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.'
          : message
      );
      setRetrying(false);
    }
  };

  useEffect(() => {
    attemptLogin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRetry = () => {
    setRetryCount(0);
    attemptLogin();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

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
              className="bg-[#E63946] hover:bg-[#FF4D5A] text-white font-bold rounded-xl px-6 py-3 gap-2"
            >
              <RefreshCw size={18} /> 다시 시도
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
        <p className="text-[#9CA3AF]">
          {retrying && retryCount > 0
            ? `인증 처리 중... (재시도 ${retryCount}/${MAX_RETRIES})`
            : '인증 처리 중...'}
        </p>
      </div>
    </div>
  );
}