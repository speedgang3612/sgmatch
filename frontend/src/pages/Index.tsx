import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Zap,
  BarChart3,
  ShieldCheck,
  UserPlus,
  Search,
  Handshake,
  Star,
  Bike,
  Banknote,
  Shield,
  Wrench,
  Clock,
  ArrowRight,
  Sparkles,
  Calculator,
  ExternalLink,
  MessageCircle,
  Gift,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ConsultModal from "@/components/ConsultModal";
import { useSEO } from "@/hooks/useSEO";

const HERO_IMG = "https://mgx-backend-cdn.metadl.com/generate/images/1031057/2026-04-05/671812cb-2910-45e5-bdb8-3875a2faacdd.png";
const FUTURE_IMG =
  "https://mgx-backend-cdn.metadl.com/generate/images/1031057/2026-03-15/0d83dfa5-63da-4199-89b6-df2d28e7f5c5.png";



export default function Index() {
  const [consultOpen, setConsultOpen] = useState(false);

  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "SpeedGang Match",
    url: "https://speedgangmatch.com",
    description: "배달 라이더와 지사를 가장 빠르게 연결하는 플랫폼. 단가, 프로모션, 정산 방식을 비교하세요.",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://speedgangmatch.com/rider?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      name: "SpeedGang Match",
      url: "https://speedgangmatch.com",
      logo: {
        "@type": "ImageObject",
        url: "https://speedgangmatch.com/assets/hero-background.png",
      },
    },
  }), []);

  useSEO({
    title: "배달 라이더와 지사를 가장 빠르게 연결하는 플랫폼",
    description: "SpeedGang Match는 배달 라이더와 지사를 연결합니다. 단가, 프로모션, 정산 방식, 오토바이 지원 여부를 비교하세요. 라이더가 선택합니다. 지사가 경쟁합니다.",
    url: "/",
    type: "website",
    jsonLd,
  });

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <Navbar />

      {/* 히어로 */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 sm:pt-16 px-4">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_IMG})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/70 via-[#0A0A0A]/55 to-[#0A0A0A]/92" />
        <div className="relative z-10 max-w-5xl mx-auto w-full text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#E63946]/20 border-2 border-[#E63946]/50 rounded-full px-3 py-1.5 sm:px-5 sm:py-2.5 mb-5 sm:mb-8 shadow-lg shadow-[#E63946]/10">
            <span className="w-2 h-2 bg-[#E63946] rounded-full flex-shrink-0" />
            <span className="text-[#E63946] text-xs sm:text-base font-bold tracking-wide whitespace-nowrap">
              라이더가 선택합니다. 지사가 경쟁합니다.
            </span>
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl mb-4 tracking-tighter drop-shadow-lg font-semibold text-center font-sans text-white break-keep">
            SpeedGang
            <span className="font-extrabold text-[#E63946]"> Match</span>
          </h1>

          {/* Main Headline */}
          <p className="text-xl sm:text-2xl md:text-4xl mb-6 max-w-3xl mx-auto drop-shadow font-bold text-center text-white break-keep">
            라이더가 선택하는 배달 플랫폼
          </p>

          {/* Subheadline */}
          <p className="text-sm sm:text-base md:text-lg mb-10 max-w-md sm:max-w-2xl mx-auto font-normal text-center text-[#D1D5DB] break-keep">
            여러 지사의 단가, 프로모션, 정산 방식을 한눈에 비교하고{" "}
            <br className="hidden sm:block" />
            가장 좋은 조건을 선택하세요.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-10">
            <Link to="/rider" className="w-full sm:w-auto">
              <Button className="bg-[#E63946] hover:bg-[#FF4D5A] text-white text-base sm:text-lg font-bold rounded-xl px-6 py-5 sm:px-10 sm:py-7 gap-2 w-full shadow-lg shadow-[#E63946]/30 transition-all duration-300">
                <Search size={18} className="sm:w-5 sm:h-5" /> 라이더 일자리 찾기
              </Button>
            </Link>
            <Link to="/agency" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="!bg-transparent border-2 border-white/30 text-white hover:border-[#E63946] hover:text-[#E63946] text-base sm:text-lg font-bold rounded-xl px-6 py-5 sm:px-10 sm:py-7 gap-2 w-full transition-all duration-300"
              >
                <UserPlus size={18} className="sm:w-5 sm:h-5" /> 지사 모집하기
              </Button>
            </Link>
          </div>

          {/* 통계 카드 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full mb-8">

            {/* 등록 지사 */}
            <div className="bg-[#1A1A1A]/85 backdrop-blur-sm border-2 border-[#E63946]/30 rounded-2xl p-5 flex flex-col items-center justify-center min-h-[150px]">
              <div className="w-10 h-10 bg-[#E63946]/15 rounded-xl flex items-center justify-center mb-3">
                <svg width="20" height="20" fill="none" stroke="#E63946" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <p className="text-sm font-bold text-white mb-1 text-center">등록 지사</p>
              <p className="text-xs text-[#6B7280] mb-3 text-center">전국 파트너 지사</p>
              <span className="text-[11px] font-semibold text-[#E63946] bg-[#E63946]/10 border border-[#E63946]/25 rounded-full px-3 py-1">
                Coming Soon
              </span>
            </div>

            {/* 매칭 완료 */}
            <div className="relative bg-[#1A1A1A]/85 backdrop-blur-sm border-2 border-[#E63946]/30 rounded-2xl p-5 flex flex-col items-center justify-center min-h-[150px]">
              <div className="absolute -top-px left-1/2 -translate-x-1/2 bg-[#E63946] rounded-b-lg px-3 py-0.5">
                <span className="text-[10px] font-bold text-white tracking-widest">MATCH</span>
              </div>
              <div className="w-10 h-10 bg-[#E63946]/15 rounded-xl flex items-center justify-center mb-3">
                <svg width="20" height="20" fill="none" stroke="#E63946" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <p className="text-sm font-bold text-white mb-1 text-center">매칭 완료</p>
              <p className="text-xs text-[#6B7280] mb-3 text-center">라이더 ↔ 지사 연결</p>
              <span className="text-[11px] font-semibold text-[#E63946] bg-[#E63946]/10 border border-[#E63946]/25 rounded-full px-3 py-1">
                Coming Soon
              </span>
            </div>

            {/* 활동 라이더 */}
            <div className="bg-[#1A1A1A]/85 backdrop-blur-sm border-2 border-[#E63946]/30 rounded-2xl p-5 flex flex-col items-center justify-center min-h-[150px]">
              <div className="w-10 h-10 bg-[#E63946]/15 rounded-xl flex items-center justify-center mb-3">
                <svg width="22" height="22" fill="none" stroke="#E63946" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <circle cx="5.5" cy="17.5" r="2.5"/>
                  <circle cx="18.5" cy="17.5" r="2.5"/>
                  <path d="M8 17.5h7"/>
                  <path d="M15 17.5l-1.5-5H9l-2 3.5"/>
                  <path d="M9 12.5l1-4h4l2 4"/>
                  <path d="M19 8h-3l-1 4"/>
                  <path d="M6 8h2"/>
                </svg>
              </div>
              <p className="text-sm font-bold text-white mb-1 text-center">활동 라이더</p>
              <p className="text-xs text-[#6B7280] mb-3 text-center">현재 활동 중인 라이더</p>
              <span className="text-[11px] font-semibold text-[#E63946] bg-[#E63946]/10 border border-[#E63946]/25 rounded-full px-3 py-1">
                Coming Soon
              </span>
            </div>

          </div>

          {/* Highlight text */}
          <p className="text-xs sm:text-sm md:text-base text-[#6B7280] font-medium tracking-wider">
            단가 비교 · 프로모션 확인 · 빠른 지원
          </p>

        </div>
      </section>

      {/* 장점 */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              왜 <span className="text-[#E63946]">SpeedGang Match</span>인가요?
            </h2>
            <p className="text-[#9CA3AF] text-lg max-w-2xl mx-auto">
              투명성을 원하는 라이더와 성과를 원하는 지사를 위해 만들었습니다.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: "빠른 매칭",
                desc: "원하는 지역에서 채용 중인 지사를 빠르게 찾을 수 있습니다.",
              },
              {
                icon: BarChart3,
                title: "간편한 비교",
                desc: "건당 단가, 프로모션, 정산 방식, 지원 옵션을 한눈에 비교하세요.",
              },
              {
                icon: ShieldCheck,
                title: "신뢰할 수 있는 지사",
                desc: "인증된 지사 목록으로 더 안전하고 현명한 선택을 할 수 있습니다.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-8 hover:border-[#E63946]/50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-14 h-14 bg-[#E63946]/10 rounded-xl flex items-center justify-center mb-6">
                  <item.icon size={28} className="text-[#E63946]" />
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-[#9CA3AF] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 이용 방법 */}
      <section className="py-24 px-4 bg-[#111111]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              이용 <span className="text-[#E63946]">방법</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: UserPlus,
                title: "등록하기",
                desc: "라이더 또는 지사로 2분 안에 가입하세요.",
              },
              {
                step: "02",
                icon: Search,
                title: "비교 & 공고 등록",
                desc: "라이더는 조건을 비교하고, 지사는 채용 공고를 등록합니다.",
              },
              {
                step: "03",
                icon: Handshake,
                title: "연결 & 근무 시작",
                desc: "즉시 매칭되어 당일부터 근무를 시작할 수 있습니다.",
              },
            ].map((item, i) => (
              <div key={i} className="relative text-center">
                <div className="text-6xl font-bold text-[#E63946]/30 mb-4">
                  {item.step}
                </div>
                <div className="w-16 h-16 bg-[#E63946]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <item.icon size={32} className="text-[#E63946]" />
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-[#9CA3AF]">{item.desc}</p>
                {i < 2 && (
                  <ArrowRight
                    size={24}
                    className="hidden md:block absolute top-1/2 -right-4 text-[#2A2A2A]"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 지사 비교 미리보기 */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="text-[#E63946]">지사</span> 비교하기
            </h2>
            <p className="text-[#9CA3AF] text-lg max-w-2xl mx-auto">
              단가, 프로모션, 근무 조건을 한눈에 비교하세요.
            </p>
          </div>
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-[#E63946]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Search size={32} className="text-[#E63946]" />
            </div>
            <h3 className="text-xl font-bold mb-3">지사 등록을 기다리고 있습니다</h3>
            <p className="text-[#9CA3AF] mb-6 max-w-md mx-auto">
              현재 등록된 지사가 없습니다. 지사가 등록되면 이곳에서 단가, 프로모션, 정산 방식을 비교할 수 있습니다.
            </p>
            <Link to="/register">
              <Button className="bg-[#E63946] hover:bg-[#FF4D5A] text-white font-bold rounded-xl px-8 py-5 gap-2">
                <UserPlus size={18} /> 지사로 가입하기
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 신규 지사 혜택 */}
      <section className="py-24 px-4 bg-[#111111]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-2 mb-6">
                <Star size={16} className="text-amber-400" />
                <span className="text-amber-400 text-sm font-medium">
                  공정한 기회
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                <span className="text-[#E63946]">신규 지사</span>에게도 공정한
                노출 기회를
              </h2>
              <p className="text-[#9CA3AF] text-lg leading-relaxed mb-8">
                대형 지사가 프로모션을 독점하면 신규 지사는 기회를 얻기
                어렵습니다. SpeedGang Match는 전용 기능을 통해 신규 지사에게
                가시성을 제공합니다.
              </p>
              <div className="space-y-4">
                {[
                  "신규 지사 배지로 즉각적인 인지도 확보",
                  "라이더 검색 결과에서 우선 노출",
                  "라이더 추천 배치",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-[#E63946]/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 bg-[#E63946] rounded-full" />
                    </div>
                    <span className="text-[#9CA3AF]">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                    <Star size={24} className="text-amber-400" />
                  </div>
                  <div>
                    <h4 className="font-bold">신규 지사 스포트라이트</h4>
                    <p className="text-[#6B7280] text-sm">이번 주 추천</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between bg-[#111111] rounded-xl p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#E63946]/10 rounded-lg flex items-center justify-center">
                          <Bike size={18} className="text-[#E63946]" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-[#6B7280]">신규 지사 {i}</p>
                          <p className="text-[#6B7280] text-xs">등록 대기 중</p>
                        </div>
                      </div>
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full border bg-amber-500/20 text-amber-400 border-amber-500/30">
                        Coming Soon
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 미래 비전 */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${FUTURE_IMG})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-transparent to-[#0A0A0A]" />
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-2 mb-5">
              <Sparkles size={14} className="text-amber-400 animate-pulse" />
              <span className="text-amber-400 text-sm font-bold">서비스 준비 중</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              매칭을 <span className="text-[#E63946]">넘어서</span>
            </h2>
            <p className="text-[#9CA3AF] text-lg max-w-2xl mx-auto">
              SpeedGang Match는 배달 라이더를 위한 미래 인프라를 구축하고
              있습니다. 아래 서비스들은 현재 준비 중이며 곧 만나보실 수 있습니다.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {[
              {
                icon: Clock,
                title: "선정산팩토링",
                desc: "배달 수입을 기다리지 마세요. 선정산팩토링으로 즉시 현금화하세요.",
                progress: 35,
              },
              {
                icon: Shield,
                title: "오토바이 보험",
                desc: "배달 라이더를 위한 합리적인 보험 상품.",
                progress: 20,
              },
              {
                icon: Calculator,
                title: "세무 회계 서비스",
                desc: "라이더·지사 전용 세무 신고, 부가세, 종합소득세 관리 서비스.",
                progress: 25,
              },
              {
                icon: Banknote,
                title: "라이더 금융 서비스",
                desc: "소득 선지급 및 라이더 전용 금융 도구.",
                progress: 15,
              },
              {
                icon: Wrench,
                title: "라이더 장비 & 지원",
                desc: "장비, 정비, 라이더 지원 서비스.",
                progress: 10,
              },
            ].map((item, i) => (
              <div
                key={i}
                className="relative bg-[#1A1A1A]/80 backdrop-blur-sm border border-[#2A2A2A] rounded-2xl p-6 text-center hover:border-amber-500/30 transition-all duration-300 group"
              >
                {/* Coming Soon 배지 */}
                <div className="absolute top-3 right-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    Coming Soon
                  </span>
                </div>
                <div className="w-14 h-14 bg-[#E63946]/10 rounded-xl flex items-center justify-center mx-auto mb-5 group-hover:bg-[#E63946]/20 transition-colors">
                  <item.icon size={28} className="text-[#E63946]" />
                </div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-[#6B7280] text-sm mb-3">{item.desc}</p>
                <div className="w-full bg-[#2A2A2A] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-[#E63946] rounded-full transition-all duration-1000"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
                <p className="text-[#6B7280] text-xs mt-2">
                  개발 진행률 {item.progress}%
                </p>
              </div>
            ))}
          </div>
          <p className="text-center text-[#6B7280] text-sm mt-10">
            * 위 서비스들은 향후 순차적으로 출시될 예정입니다. 출시 알림을 받으시려면 가입해주세요.
          </p>
        </div>
      </section>

      {/* 정산 프로그램 소개 */}
      <section id="settlement-program" className="py-24 px-4 scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          <div className="relative bg-gradient-to-br from-[#1A1A1A] to-[#111111] border border-[#2A2A2A] rounded-3xl p-8 sm:p-12 overflow-hidden">
            {/* 배경 장식 */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#E63946]/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                {/* 배지 그룹 */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-2">
                    <Calculator size={14} className="text-emerald-400" />
                    <span className="text-emerald-400 text-sm font-bold">서비스 운영 중</span>
                  </div>
                  <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-2 animate-pulse">
                    <Gift size={14} className="text-amber-400" />
                    <span className="text-amber-400 text-sm font-bold">14일 무료 체험</span>
                  </div>
                </div>

                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  지사 전용 <span className="text-[#E63946]">정산 프로그램</span>
                </h2>
                <p className="text-[#9CA3AF] text-lg leading-relaxed mb-2">
                  라이더별 배달 건수와 금액을 한눈에 정산하고, 일별·주별·월별 리포트로 
                  급여를 효율적으로 관리하세요.
                </p>
                <p className="text-amber-400 text-sm font-medium mb-6">
                  ✨ 14일 무료 체험 후, 담당자 상담을 통해 충분히 검토하고 결정하세요. 강제 결제는 없습니다.
                </p>
                <div className="space-y-3 mb-8">
                  {[
                    "라이더별 배달 건수 / 금액 자동 정산",
                    "일별 · 주별 · 월별 정산 리포트",
                    "급여 계산 및 지급 관리",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                      </div>
                      <span className="text-[#9CA3AF]">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="https://sgnext.co.kr"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="bg-[#E63946] hover:bg-[#FF4D5A] text-white text-lg font-bold rounded-xl px-8 py-6 gap-2 shadow-lg shadow-[#E63946]/25 w-full sm:w-auto">
                      <Sparkles size={18} /> 14일 무료 체험
                      <ExternalLink size={14} className="opacity-70" />
                    </Button>
                  </a>
                  <Button
                    onClick={() => setConsultOpen(true)}
                    variant="outline"
                    className="!bg-transparent border-2 border-white/20 text-white hover:border-[#E63946] hover:text-[#E63946] text-lg font-bold rounded-xl px-8 py-6 gap-2 transition-all duration-300"
                  >
                    <MessageCircle size={18} /> 상담 신청
                  </Button>
                </div>
                <Link to="/pricing" className="inline-flex items-center gap-1 text-[#6B7280] hover:text-[#E63946] text-sm mt-4 transition-colors">
                  요금제 자세히 보기 <ArrowRight size={14} />
                </Link>
              </div>

              <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-3 h-3 rounded-full bg-[#E63946]" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="text-[#6B7280] text-xs ml-2">정산 관리 시스템</span>
                </div>
                <div className="space-y-3">
                  {[
                    { rider: "라이더 A", deliveries: "—", amount: "—", status: "샘플" },
                    { rider: "라이더 B", deliveries: "—", amount: "—", status: "샘플" },
                    { rider: "라이더 C", deliveries: "—", amount: "—", status: "샘플" },
                    { rider: "라이더 D", deliveries: "—", amount: "—", status: "샘플" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between bg-[#111111] rounded-xl p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#E63946]/10 rounded-lg flex items-center justify-center text-xs font-bold text-[#E63946]">
                          {String.fromCharCode(65 + i)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#9CA3AF]">{item.rider}</p>
                          <p className="text-[#6B7280] text-xs">{item.deliveries}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-[#6B7280]">{item.amount}</p>
                        <p className="text-xs font-medium text-[#6B7280]">
                          {item.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-[#2A2A2A] flex justify-between items-center">
                  <span className="text-[#6B7280] text-sm">실제 데이터로 표시됩니다</span>
                  <span className="text-sm font-medium text-[#6B7280]">정산 프로그램 미리보기</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 최종 CTA */}
      <section className="py-24 px-4 bg-[#111111]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            <span className="text-[#E63946]">오늘</span> 바로 시작하세요
          </h2>
          <p className="text-[#9CA3AF] text-lg mb-10 max-w-2xl mx-auto">
            라이더를 최우선으로 생각하고 모든 지사에게 공정한 기회를 제공하는
            플랫폼에 합류하세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button className="bg-[#E63946] hover:bg-[#FF4D5A] text-white text-lg font-bold rounded-xl px-10 py-7 gap-2 w-full sm:w-auto">
                가입하기
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <ConsultModal isOpen={consultOpen} onClose={() => setConsultOpen(false)} />
    </div>
  );
}