import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LogIn, Mail, Lock, Eye, EyeOff, Chrome, ArrowLeft, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import Logo from '@/components/Logo';

type AuthMode = 'login' | 'signup';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // ── 이메일/비밀번호 제출 ─────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError('비밀번호가 일치하지 않습니다.');
        return;
      }
      if (password.length < 6) {
        setError('비밀번호는 6자 이상이어야 합니다.');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        navigate(redirectTo, { replace: true });
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (signUpError) throw signUpError;
        setSuccessMsg(
          '가입 확인 이메일을 발송했습니다. 이메일을 확인해주세요.'
        );
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : '알 수 없는 오류가 발생했습니다.';
      setError(translateError(msg));
    } finally {
      setLoading(false);
    }
  };

  // ── 구글 OAuth ───────────────────────────────────────────────────
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (oauthError) throw oauthError;
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : '구글 로그인 중 오류가 발생했습니다.';
      setError(msg);
      setGoogleLoading(false);
    }
  };

  // ── 에러 메시지 한국어 변환 ──────────────────────────────────────
  const translateError = (msg: string): string => {
    if (msg.includes('Invalid login credentials'))
      return '이메일 또는 비밀번호가 올바르지 않습니다.';
    if (msg.includes('Email not confirmed'))
      return '이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.';
    if (msg.includes('User already registered'))
      return '이미 가입된 이메일입니다. 로그인을 시도해주세요.';
    if (msg.includes('Password should be at least'))
      return '비밀번호는 6자 이상이어야 합니다.';
    if (msg.includes('rate limit'))
      return '잠시 후 다시 시도해주세요.';
    return msg;
  };

  const toggleMode = () => {
    setMode((m) => (m === 'login' ? 'signup' : 'login'));
    setError(null);
    setSuccessMsg(null);
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4 py-12">
      {/* 배경 그라디언트 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#E63946]/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-[420px]">
        {/* 홈 뒤로가기 */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-[#6B7280] hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            홈으로
          </Link>
        </div>

        {/* 카드 */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-8 shadow-2xl shadow-black/50">
          {/* 로고 + 타이틀 */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 bg-[#E63946]/10 border border-[#E63946]/30 rounded-2xl flex items-center justify-center">
                <Zap size={28} className="text-[#E63946]" />
              </div>
            </div>
            <div className="flex justify-center mb-2">
              <Logo size="sm" />
            </div>
            <p className="text-sm text-[#6B7280] mt-1">
              {mode === 'login'
                ? '계정에 로그인하세요'
                : '새 계정을 만드세요'}
            </p>
          </div>

          {/* 구글 로그인 버튼 */}
          <button
            id="google-login-btn"
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-800 font-semibold rounded-xl px-4 py-3 transition-all duration-200 mb-5 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Chrome size={20} className="text-gray-600" />
            )}
            <span>Google로 {mode === 'login' ? '로그인' : '가입'}</span>
          </button>

          {/* 구분선 */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-[#2A2A2A]" />
            <span className="text-xs text-[#4B5563]">또는</span>
            <div className="flex-1 h-px bg-[#2A2A2A]" />
          </div>

          {/* 이메일/비밀번호 폼 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 이메일 */}
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-[#9CA3AF] mb-1.5">
                이메일
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4B5563]"
                />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full bg-[#111111] border border-[#2A2A2A] text-white placeholder-[#4B5563] rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#E63946]/60 focus:ring-1 focus:ring-[#E63946]/30 transition-all"
                />
              </div>
            </div>

            {/* 비밀번호 */}
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-[#9CA3AF] mb-1.5">
                비밀번호
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4B5563]"
                />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="w-full bg-[#111111] border border-[#2A2A2A] text-white placeholder-[#4B5563] rounded-xl pl-10 pr-12 py-3 text-sm focus:outline-none focus:border-[#E63946]/60 focus:ring-1 focus:ring-[#E63946]/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#4B5563] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* 비밀번호 확인 (회원가입 시) */}
            {mode === 'signup' && (
              <div>
                <label htmlFor="login-confirm-password" className="block text-sm font-medium text-[#9CA3AF] mb-1.5">
                  비밀번호 확인
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4B5563]"
                  />
                  <input
                    id="login-confirm-password"
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="w-full bg-[#111111] border border-[#2A2A2A] text-white placeholder-[#4B5563] rounded-xl pl-10 pr-12 py-3 text-sm focus:outline-none focus:border-[#E63946]/60 focus:ring-1 focus:ring-[#E63946]/30 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#4B5563] hover:text-white transition-colors"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {/* 에러 / 성공 메시지 */}
            {error && (
              <div className="bg-[#E63946]/10 border border-[#E63946]/30 rounded-xl px-4 py-3 text-sm text-[#E63946]">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-sm text-emerald-400">
                {successMsg}
              </div>
            )}

            {/* 제출 버튼 */}
            <Button
              id="login-submit-btn"
              type="submit"
              disabled={loading || googleLoading}
              className="w-full bg-[#E63946] hover:bg-[#FF4D5A] text-white font-bold rounded-xl py-3 gap-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn size={16} />
              )}
              {mode === 'login' ? '로그인' : '회원가입'}
            </Button>
          </form>

          {/* 모드 전환 */}
          <p className="text-center text-sm text-[#6B7280] mt-6">
            {mode === 'login' ? '아직 계정이 없으신가요?' : '이미 계정이 있으신가요?'}{' '}
            <button
              id="toggle-auth-mode-btn"
              type="button"
              onClick={toggleMode}
              className="text-[#E63946] hover:text-[#FF4D5A] font-semibold transition-colors"
            >
              {mode === 'login' ? '회원가입' : '로그인'}
            </button>
          </p>
        </div>

        {/* 약관 안내 */}
        <p className="text-center text-xs text-[#4B5563] mt-6">
          계속 진행하면{' '}
          <Link to="/terms" className="underline hover:text-[#9CA3AF]">이용약관</Link>
          {' '}및{' '}
          <Link to="/privacy" className="underline hover:text-[#9CA3AF]">개인정보처리방침</Link>
          에 동의하는 것으로 간주됩니다.
        </p>
      </div>
    </div>
  );
}
