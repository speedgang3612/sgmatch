import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu, X, LogIn, LogOut, User, Shield, Building2, ChevronDown,
  LayoutDashboard, Handshake, ClipboardList, ShieldCheck, Megaphone, BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "./Logo";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [agencyMenuOpen, setAgencyMenuOpen] = useState(false);
  const agencyMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { user, loading, isAdmin, isAgency, login, logout } = useAuth();

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (agencyMenuRef.current && !agencyMenuRef.current.contains(e.target as Node)) {
        setAgencyMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 지사 관리 드롭다운 메뉴 항목
  const agencyMenuItems = [
    { icon: LayoutDashboard, label: "라이더 찾기", href: "/agency" },
    { icon: Handshake, label: "매칭 현황", href: "/agency?view=match-status" },
    { icon: Building2, label: "내 지사 관리", href: "/agency?view=branches" },
    { icon: ClipboardList, label: "채용 공고", href: "/agency/listings" },
    { icon: ShieldCheck, label: "인증 관리", href: "/agency/verification" },
    { icon: Megaphone, label: "프로모션", href: "/agency/promotions" },
    { icon: BarChart3, label: "분석", href: "/agency/analytics" },
  ];

  const isDashboard =
    location.pathname.startsWith("/rider") ||
    location.pathname.startsWith("/agency") ||
    location.pathname.startsWith("/admin");

  if (isDashboard) return null;

  // ── role 기반 네비게이션 링크 ──────────────────────────────────
  // 지사로 로그인: 홈 / 요금제 / 채용공고등록 / 정산프로그램
  // 기본(비로그인 · 라이더): 홈 / 요금제 / 라이더대시보드 / 지사대시보드 / 정산프로그램
  const links = isAgency
    ? [
        { label: "홈", href: "/" },
        { label: "채용공고 등록", href: "/agency/listings" },
        { label: "구독플랜", href: "/pricing" },
        { label: "정산프로그램", href: "https://sgnext.co.kr", isNew: true, isExternal: true },
      ]
    : [
        { label: "홈", href: "/" },
        { label: "라이더 대시보드", href: "/rider" },
        { label: "지사 대시보드", href: "/agency" },
        { label: "구독플랜", href: "/pricing" },
        { label: "정산프로그램", href: "https://sgnext.co.kr", isNew: true, isExternal: true },
      ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-[#2A2A2A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Logo size="sm" />

          <div className="hidden md:flex items-center gap-6">
            {links.map((l) => {
              const isExtLink = 'isExternal' in l && l.isExternal;
              const isAnchorLink = l.href.includes("#");

              // 외부 링크는 새 탭으로 열기
              if (isExtLink) {
                return (
                  <a
                    key={l.href}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium transition-colors relative inline-flex items-center gap-1.5 text-[#9CA3AF] hover:text-white"
                  >
                    {l.label}
                    {'isNew' in l && l.isNew && (
                      <span className="relative flex items-center">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-[#E63946] opacity-75 animate-ping" />
                        <span className="relative inline-flex items-center bg-[#E63946] text-white text-[8px] font-extrabold tracking-wider px-1 py-0.5 rounded-full leading-none">
                          N
                        </span>
                      </span>
                    )}
                  </a>
                );
              }

              const LinkOrA = isAnchorLink ? "a" : Link;
              const linkProps = isAnchorLink
                ? { href: l.href }
                : { to: l.href };
              return (
                <LinkOrA
                  key={l.href}
                  {...(linkProps as any)}
                  className={`text-sm font-medium transition-colors relative inline-flex items-center gap-1.5 ${
                    location.pathname === l.href
                      ? "text-[#E63946]"
                      : "text-[#9CA3AF] hover:text-white"
                  }`}
                >
                  {l.label}
                  {'isNew' in l && l.isNew && (
                    <span className="relative flex items-center">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-[#E63946] opacity-75 animate-ping" />
                      <span className="relative inline-flex items-center bg-[#E63946] text-white text-[8px] font-extrabold tracking-wider px-1 py-0.5 rounded-full leading-none">
                        N
                      </span>
                    </span>
                  )}
                </LinkOrA>
              );
            })}

            {/* 관리자 메뉴 - admin 역할일 때만 표시 */}
            {isAdmin && (
              <Link
                to="/admin"
                className={`text-sm font-medium transition-colors inline-flex items-center gap-1.5 ${
                  location.pathname === "/admin"
                    ? "text-[#E63946]"
                    : "text-amber-400 hover:text-amber-300"
                }`}
              >
                <Shield size={14} />
                관리자
              </Link>
            )}

            {loading ? (
              <div className="w-20 h-9 bg-[#1A1A1A] rounded-lg animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-[#9CA3AF] flex items-center gap-1.5">
                  <User size={14} />
                  {user.name || user.email}
                  {/* role 값 배지 */}
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    user.role === 'admin'
                      ? 'bg-amber-500/20 text-amber-400'
                      : user.role === 'agency'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-[#2A2A2A] text-[#9CA3AF]'
                  }`}>
                    {user.role || 'user'}
                  </span>
                  {isAdmin && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">
                      Admin
                    </span>
                  )}
                </span>

                {/* 지사 관리 드롭다운 — agency 역할일 때만 표시 */}
                {isAgency && (
                  <div className="relative" ref={agencyMenuRef}>
                    <button
                      onClick={() => setAgencyMenuOpen(!agencyMenuOpen)}
                      className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border transition-all ${
                        agencyMenuOpen
                          ? 'bg-[#E63946]/10 border-[#E63946]/50 text-[#E63946]'
                          : 'bg-[#1A1A1A] border-[#2A2A2A] text-[#9CA3AF] hover:text-white hover:border-[#E63946]/30'
                      }`}
                    >
                      <Building2 size={14} />
                      지사 관리
                      <ChevronDown size={12} className={`transition-transform ${agencyMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {agencyMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl shadow-2xl shadow-black/50 py-2 z-50">
                        {agencyMenuItems.map((item) => (
                          <Link
                            key={item.href}
                            to={item.href}
                            onClick={() => setAgencyMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#9CA3AF] hover:text-white hover:bg-[#2A2A2A]/50 transition-colors"
                          >
                            <item.icon size={15} />
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <Button
                  onClick={logout}
                  variant="outline"
                  className="!bg-transparent border-[#2A2A2A] text-[#9CA3AF] hover:text-white hover:border-[#E63946] text-sm font-medium rounded-lg px-4 h-9 gap-1.5"
                >
                  <LogOut size={14} /> 로그아웃
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => window.location.href = '/login'}
                  variant="outline"
                  className="!bg-transparent border-[#2A2A2A] text-[#9CA3AF] hover:text-white hover:border-[#E63946] text-sm font-medium rounded-lg px-4 h-9 gap-1.5"
                >
                  <LogIn size={14} /> 로그인
                </Button>
                <Link to="/register">
                  <Button className="bg-[#E63946] hover:bg-[#FF4D5A] text-white text-sm font-bold rounded-lg px-5 h-9">
                    가입하기
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <button
            className="md:hidden text-white"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-[#111111] border-t border-[#2A2A2A] px-4 py-4 space-y-3">
          {links.map((l) => {
            const isAnchorLink = l.href.includes("#");
            if (isAnchorLink) {
              return (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 text-[#9CA3AF] hover:text-white font-medium py-2"
                >
                  {l.label}
                  {"isNew" in l && l.isNew && (
                    <span className="relative flex items-center">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-[#E63946] opacity-75 animate-ping" />
                      <span className="relative inline-flex items-center bg-[#E63946] text-white text-[8px] font-extrabold tracking-wider px-1 py-0.5 rounded-full leading-none">
                        N
                      </span>
                    </span>
                  )}
                </a>
              );
            }
            return (
              <Link
                key={l.href}
                to={l.href}
                onClick={() => setOpen(false)}
                className="block text-[#9CA3AF] hover:text-white font-medium py-2"
              >
                {l.label}
              </Link>
            );
          })}

          {/* 모바일 관리자 메뉴 */}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 text-amber-400 hover:text-amber-300 font-medium py-2"
            >
              <Shield size={14} />
              관리자
            </Link>
          )}

          {user ? (
            <div className="space-y-2 pt-2 border-t border-[#2A2A2A]">
              <p className="text-sm text-[#9CA3AF] flex items-center gap-1.5">
                <User size={14} />
                {user.name || user.email}
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  user.role === 'admin'
                    ? 'bg-amber-500/20 text-amber-400'
                    : user.role === 'agency'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-[#2A2A2A] text-[#9CA3AF]'
                }`}>
                  {user.role || 'user'}
                </span>
                {isAdmin && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">
                    Admin
                  </span>
                )}
              </p>

              {/* 모바일 — 지사 관리 메뉴 */}
              {isAgency && (
                <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-2 space-y-0.5">
                  <p className="text-[10px] text-[#6B7280] font-medium uppercase tracking-wider px-2 py-1">지사 관리</p>
                  {agencyMenuItems.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 px-2 py-2 text-sm text-[#9CA3AF] hover:text-white hover:bg-[#2A2A2A]/50 rounded-lg transition-colors"
                    >
                      <item.icon size={14} />
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}

              <Button
                onClick={() => { logout(); setOpen(false); }}
                variant="outline"
                className="w-full !bg-transparent border-[#2A2A2A] text-[#9CA3AF] hover:text-white font-medium rounded-lg gap-1.5"
              >
                <LogOut size={14} /> 로그아웃
              </Button>
            </div>
          ) : (
            <div className="space-y-2 pt-2 border-t border-[#2A2A2A]">
              <Button
                onClick={() => { window.location.href = '/login'; setOpen(false); }}
                variant="outline"
                className="w-full !bg-transparent border-[#2A2A2A] text-[#9CA3AF] hover:text-white font-medium rounded-lg gap-1.5"
              >
                <LogIn size={14} /> 로그인
              </Button>
              <Link to="/register" onClick={() => setOpen(false)}>
                <Button className="w-full bg-[#E63946] hover:bg-[#FF4D5A] text-white font-bold rounded-lg mt-2">
                  가입하기
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}