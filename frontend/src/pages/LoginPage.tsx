import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LogIn, Mail, Lock, Eye, EyeOff, Chrome, Zap, ShieldCheck, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

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
    <div className="min-h-screen bg-[#0A0A0A] flex">

      {/* ═══════════════════════════════════════════════
          왼쪽: 브랜딩 패널 (데스크탑 전용)
      ═══════════════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col justify-between p-12">
        {/* 배경 글로우 레이어 */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-15%] left-[-15%] w-[700px] h-[700px] bg-[#E63946]/20 rounded-full blur-[160px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#E63946]/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#E63946]/5 rounded-full blur-[80px]" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0A]/90 via-transparent to-[#0A0A0A]/80" />
        </div>

        {/* 상단 로고 */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 bg-[#E63946] rounded-xl flex items-center justify-center transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#E63946]/40">
              <Zap size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              SpeedGang<span className="text-[#E63946]">Match</span>
            </span>
          </Link>
        </div>

        {/* 중앙 메인 카피 */}
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <span className="inline-block text-xs font-semibold tracking-widest text-[#E63946] uppercase mb-6 px-3 py-1.5 bg-[#E63946]/10 rounded-full border border-[#E63946]/20 w-fit">
            배달 지사 매칭 플랫폼 #1
          </span>
          <h1 className="text-5xl xl:text-6xl font-black text-white leading-[1.1] mb-6 tracking-tight">
            빠르게 연결되는<br />
            <span className="text-[#E63946]">SG</span><br />
            Matching Service
          </h1>
          <p className="text-[#9CA3AF] text-lg leading-relaxed max-w-sm">
            Connecting verified agencies and riders.<br />
            Sign up in 2 minutes and get started.
          </p>

          {/* 통계 배지 */}
          <div className="flex gap-3 mt-10 flex-wrap">
            {[
              { icon: Users, label: '등록 라이더', value: '1,200+' },
              { icon: ShieldCheck, label: '인증 지사', value: '340+' },
              { icon: TrendingUp, label: '매칭 성공률', value: '94%' },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex flex-col gap-1.5 px-5 py-3.5 rounded-2xl"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <Icon size={14} className="text-[#E63946]" />
                <p className="text-white font-bold text-xl leading-none">{value}</p>
                <p className="text-[#6B7280] text-xs">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 하단 약관 */}
        <div className="relative z-10">
          <p className="text-xs text-[#4B5563]">
            © 2025 SpeedGang Match &nbsp;·&nbsp;{' '}
            <Link to="/terms" className="hover:text-[#9CA3AF] transition-colors underline underline-offset-2">이용약관</Link>
            {' '}&nbsp;·&nbsp;{' '}
            <Link to="/privacy" className="hover:text-[#9CA3AF] transition-colors underline underline-offset-2">개인정보처리방침</Link>
          </p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          오른쪽: 로그인 폼 패널
      ═══════════════════════════════════════════════ */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        {/* 모바일 배경 글로우 */}
        <div className="absolute inset-0 pointer-events-none lg:hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-[#E63946]/8 rounded-full blur-[100px]" />
        </div>

        <div className="relative w-full max-w-[420px]">
          {/* 모바일 전용 로고 */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <div className="w-9 h-9 bg-[#E63946] rounded-xl flex items-center justify-center">
                <Zap size={18} className="text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                SpeedGang<span className="text-[#E63946]">Match</span>
              </span>
            </Link>
          </div>

          {/* 글라스모피즘 카드 */}
          <div
            className="rounded-2xl p-8"
            style={{
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            {/* 타이틀 */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-1.5 tracking-tight">
                {mode === 'login' ? '다시 만나서 반갑습니다 👋' : '새 계정 만들기'}
              </h2>
              <p className="text-sm text-[#6B7280]">
                {mode === 'login'
                  ? '계정 정보를 입력해 로그인하세요.'
                  : '아래 정보를 입력해 가입하세요.'}
              </p>
            </div>

            {/* 구글 로그인 버튼 */}
            <button
              id="google-login-btn"
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading || loading}
              className="w-full flex items-center justify-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all duration-200 mb-5 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
              onMouseEnter={(e) => {
                if (!googleLoading && !loading) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.09)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
              }}
            >
              {googleLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Chrome size={18} />
              )}
              <span>Google로 {mode === 'login' ? '로그인' : '가입'}</span>
            </button>

            {/* 구분선 */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
              <span className="text-xs text-[#4B5563] whitespace-nowrap">또는 이메일로 계속</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
            </div>

            {/* 이메일/비밀번호 폼 */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 이메일 */}
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-xs font-semibold text-[#6B7280] mb-1.5 tracking-widest uppercase"
                >
                  이메일
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4B5563] pointer-events-none" />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full text-white placeholder-[#4B5563] rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-all duration-200"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(230,57,70,0.55)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(230,57,70,0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* 비밀번호 */}
              <div>
                <label
                  htmlFor="login-password"
                  className="block text-xs font-semibold text-[#6B7280] mb-1.5 tracking-widest uppercase"
                >
                  비밀번호
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4B5563] pointer-events-none" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    className="w-full text-white placeholder-[#4B5563] rounded-xl pl-10 pr-12 py-3 text-sm outline-none transition-all duration-200"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(230,57,70,0.55)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(230,57,70,0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#4B5563] hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* 비밀번호 확인 (회원가입 시) */}
              {mode === 'signup' && (
                <div>
                  <label
                    htmlFor="login-confirm-password"
                    className="block text-xs font-semibold text-[#6B7280] mb-1.5 tracking-widest uppercase"
                  >
                    비밀번호 확인
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4B5563] pointer-events-none" />
                    <input
                      id="login-confirm-password"
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="w-full text-white placeholder-[#4B5563] rounded-xl pl-10 pr-12 py-3 text-sm outline-none transition-all duration-200"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(230,57,70,0.55)';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(230,57,70,0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#4B5563] hover:text-white transition-colors"
                    >
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              )}

              {/* 에러 메시지 */}
              {error && (
                <div
                  className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm text-[#E63946]"
                  style={{ background: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,0.2)' }}
                >
                  <span className="shrink-0 mt-0.5">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* 성공 메시지 */}
              {successMsg && (
                <div
                  className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm text-emerald-400"
                  style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}
                >
                  <span className="shrink-0 mt-0.5">✅</span>
                  <span>{successMsg}</span>
                </div>
              )}

              {/* 제출 버튼 */}
              <Button
                id="login-submit-btn"
                type="submit"
                disabled={loading || googleLoading}
                className="w-full font-bold rounded-xl py-3 gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-1 border-0"
                style={{
                  background: 'linear-gradient(135deg, #E63946 0%, #c8303d 100%)',
                  boxShadow: '0 4px 24px rgba(230,57,70,0.35)',
                  color: '#fff',
                }}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
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

          {/* 모바일 전용 약관 */}
          <p className="lg:hidden text-center text-xs text-[#4B5563] mt-6">
            계속 진행하면{' '}
            <Link to="/terms" className="underline underline-offset-2 hover:text-[#9CA3AF]">이용약관</Link>
            {' '}및{' '}
            <Link to="/privacy" className="underline underline-offset-2 hover:text-[#9CA3AF]">개인정보처리방침</Link>
            에 동의하는 것으로 간주됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
