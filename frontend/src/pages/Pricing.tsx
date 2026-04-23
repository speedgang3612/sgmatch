import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Check,
  Building2,
  ClipboardList,
  Sparkles,
  ArrowRight,
  Zap,
  Plus,
  MessageCircle,
  Shield,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ConsultModal from "@/components/ConsultModal";
import { useSEO } from "@/hooks/useSEO";

const plans = [
  {
    name: "Free",
    branches: 1,
    listings: 1,
    price: "무료",
    priceNum: null,
    period: "15일 체험",
    desc: "플랫폼을 무료로 체험해보세요.",
    badge: null,
    highlight: false,
    cta: "무료로 시작하기",
    ctaStyle: "emerald",
  },
  {
    name: "Basic",
    branches: 3,
    listings: 3,
    price: "29,000",
    priceNum: 29000,
    period: "/월",
    desc: "소규모 지사 운영에 최적화된 플랜입니다.",
    badge: null,
    highlight: false,
    cta: "시작하기",
    ctaStyle: "default",
  },
  {
    name: "Standard",
    branches: 5,
    listings: 5,
    price: "49,000",
    priceNum: 49000,
    period: "/월",
    desc: "성장 중인 지사를 위한 가장 인기 있는 플랜입니다.",
    badge: "추천",
    highlight: true,
    cta: "시작하기",
    ctaStyle: "primary",
  },
  {
    name: "Advanced",
    branches: 7,
    listings: 7,
    price: "69,000",
    priceNum: 69000,
    period: "/월",
    desc: "다수의 지사를 효율적으로 운영하세요.",
    badge: null,
    highlight: false,
    cta: "시작하기",
    ctaStyle: "default",
  },
  {
    name: "Premium",
    branches: 9,
    listings: 9,
    price: "89,000",
    priceNum: 89000,
    period: "/월",
    desc: "대형 지사 네트워크를 위한 최상위 플랜입니다.",
    badge: null,
    highlight: false,
    cta: "시작하기",
    ctaStyle: "default",
  },
];

const addOn = {
  branches: 1,
  listings: 1,
  price: "9,900",
  period: "/월",
  desc: "지사 1개 + 공고 1개를 추가합니다.",
};

const features = [
  { icon: Building2, title: "다중 지사 관리", desc: "플랜에 따라 최대 9개 지사를 한 계정으로 관리하세요." },
  { icon: ClipboardList, title: "채용 공고 등록", desc: "지사별 채용 공고를 손쉽게 등록하고 라이더를 모집하세요." },
  { icon: Shield, title: "인증 배지 부여", desc: "인증 완료 지사에게 라이더 신뢰도 배지를 부여합니다." },
  { icon: Star, title: "라이더 매칭", desc: "조건에 맞는 라이더와 빠르게 매칭하세요." },
];

export default function Pricing() {
  const [consultOpen, setConsultOpen] = useState(false);

  useSEO({
    title: "요금제 - SpeedGang Match 구인구직 플랫폼",
    description:
      "SpeedGang Match 요금제 안내. Free 15일 체험부터 Premium까지, 지사 규모에 맞는 플랜을 선택하세요.",
    url: "/pricing",
  });

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <Navbar />

      {/* ── Hero ── */}
      <section className="pt-32 pb-16 px-4 relative overflow-hidden">
        {/* 배경 글로우 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#E63946]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-3 bg-[#E63946]/20 border border-[#E63946]/50 rounded-full px-10 py-5 mb-6">
            <Zap size={36} className="text-[#E63946]" />
            <span className="text-[#E63946] text-2xl font-bold">매칭플랫폼 구독플랜</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-5 leading-tight tracking-tight">
            지사 규모에 맞는{" "}
            <span className="text-[#E63946]">플랜</span>을 선택하세요
          </h1>
          <p className="text-[#9CA3AF] text-lg max-w-2xl mx-auto leading-relaxed">
            Free 플랜으로 15일간 무료 체험 후 결정하세요.
            <br />
            추가 지사·공고는 언제든 9,900원/월에 확장할 수 있습니다.
          </p>
        </div>
      </section>

      {/* ── 플랜 카드 ── */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl p-6 transition-all duration-300 ${
                  plan.highlight
                    ? "bg-gradient-to-b from-[#E63946]/10 to-[#1A1A1A] border-2 border-[#E63946]/60 shadow-xl shadow-[#E63946]/10 scale-[1.03]"
                    : "bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#E63946]/30 hover:-translate-y-1"
                }`}
              >
                {/* 추천 배지 */}
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 bg-[#E63946] text-white text-xs font-extrabold px-4 py-1.5 rounded-full shadow-lg shadow-[#E63946]/40">
                      <Sparkles size={11} />
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* 플랜명 */}
                <div className="mb-4 mt-2">
                  <h3 className={`text-lg font-extrabold ${plan.highlight ? "text-[#E63946]" : "text-white"}`}>
                    {plan.name}
                  </h3>
                  <p className="text-[#6B7280] text-xs mt-1 leading-snug">{plan.desc}</p>
                </div>

                {/* 가격 */}
                <div className="mb-5">
                  <div className="flex items-baseline gap-1">
                    {plan.priceNum === null ? (
                      <span className="text-3xl font-extrabold text-emerald-400">{plan.price}</span>
                    ) : (
                      <>
                        <span className="text-2xl font-extrabold text-white">
                          ₩{plan.price}
                        </span>
                        <span className="text-[#6B7280] text-sm">{plan.period}</span>
                      </>
                    )}
                  </div>
                  <p className="text-[#6B7280] text-xs mt-1">
                    {plan.priceNum === null ? "체험 기간 15일" : "부가세 별도"}
                  </p>
                </div>

                {/* 스펙 */}
                <div className="space-y-2.5 mb-6 flex-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 bg-[#E63946]/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Building2 size={11} className="text-[#E63946]" />
                    </div>
                    <span className="text-[#9CA3AF] text-sm">
                      지사 <span className="text-white font-bold">{plan.branches}개</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 bg-[#E63946]/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <ClipboardList size={11} className="text-[#E63946]" />
                    </div>
                    <span className="text-[#9CA3AF] text-sm">
                      공고 <span className="text-white font-bold">{plan.listings}개</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check size={11} className="text-emerald-400" />
                    </div>
                    <span className="text-[#9CA3AF] text-sm">라이더 매칭</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check size={11} className="text-emerald-400" />
                    </div>
                    <span className="text-[#9CA3AF] text-sm">인증 배지</span>
                  </div>
                </div>

                {/* CTA */}
                <Link to="/register">
                  <Button
                    className={`w-full font-bold rounded-xl py-5 text-sm transition-all ${
                      plan.ctaStyle === "primary"
                        ? "bg-[#E63946] hover:bg-[#FF4D5A] text-white shadow-lg shadow-[#E63946]/30"
                        : plan.ctaStyle === "emerald"
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                        : "!bg-[#2A2A2A] hover:!bg-[#333] text-white border border-[#3A3A3A]"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          {/* ── 추가 옵션 카드 ── */}
          <div className="mt-6 bg-[#111111] border border-[#2A2A2A] border-dashed rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Plus size={22} className="text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-extrabold text-white">추가 옵션</h3>
                  <span className="text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                    유연한 확장
                  </span>
                </div>
                <p className="text-[#9CA3AF] text-sm">{addOn.desc}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-[#6B7280] flex items-center gap-1">
                    <Building2 size={11} /> 지사 +{addOn.branches}개
                  </span>
                  <span className="text-xs text-[#6B7280] flex items-center gap-1">
                    <ClipboardList size={11} /> 공고 +{addOn.listings}개
                  </span>
                </div>
              </div>
            </div>
            <div className="text-left sm:text-right flex-shrink-0">
              <p className="text-2xl font-extrabold text-amber-400">₩{addOn.price}</p>
              <p className="text-[#6B7280] text-xs">{addOn.period} · 부가세 별도</p>
              <Button
                onClick={() => setConsultOpen(true)}
                className="mt-3 !bg-amber-500/20 hover:!bg-amber-500/30 text-amber-400 border border-amber-500/30 font-bold rounded-xl px-5 py-2 text-sm gap-1.5"
              >
                <MessageCircle size={14} /> 상담 문의
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 플랜 비교표 ── */}
      <section className="py-16 px-4 bg-[#111111]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              플랜 <span className="text-[#E63946]">한눈에 비교</span>
            </h2>
            <p className="text-[#9CA3AF]">지사 수와 공고 수 기준으로 플랜을 선택하세요.</p>
          </div>

          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl overflow-hidden">
            {/* 헤더 */}
            <div className="grid grid-cols-4 border-b border-[#2A2A2A] bg-[#111111]">
              <div className="p-4 text-[#6B7280] text-xs font-bold uppercase tracking-wider">플랜</div>
              <div className="p-4 text-[#6B7280] text-xs font-bold uppercase tracking-wider text-center">지사 수</div>
              <div className="p-4 text-[#6B7280] text-xs font-bold uppercase tracking-wider text-center">공고 수</div>
              <div className="p-4 text-[#6B7280] text-xs font-bold uppercase tracking-wider text-center">가격</div>
            </div>

            {/* 행 */}
            {plans.map((plan, i) => (
              <div
                key={plan.name}
                className={`grid grid-cols-4 border-b border-[#2A2A2A] last:border-0 transition-colors ${
                  plan.highlight ? "bg-[#E63946]/5" : "hover:bg-[#1F1F1F]"
                }`}
              >
                <div className="p-4 flex items-center gap-2">
                  <span className={`font-bold ${plan.highlight ? "text-[#E63946]" : "text-white"}`}>
                    {plan.name}
                  </span>
                  {plan.badge && (
                    <span className="text-[10px] font-bold bg-[#E63946]/20 text-[#E63946] border border-[#E63946]/30 px-1.5 py-0.5 rounded-full">
                      {plan.badge}
                    </span>
                  )}
                </div>
                <div className="p-4 text-center">
                  <span className="text-white font-bold">{plan.branches}개</span>
                </div>
                <div className="p-4 text-center">
                  <span className="text-white font-bold">{plan.listings}개</span>
                </div>
                <div className="p-4 text-center">
                  {plan.priceNum === null ? (
                    <span className="text-emerald-400 font-bold">무료</span>
                  ) : (
                    <span className="text-white font-bold">₩{plan.price}<span className="text-[#6B7280] text-xs font-normal">/월</span></span>
                  )}
                </div>
              </div>
            ))}

            {/* 추가 옵션 행 */}
            <div className="grid grid-cols-4 bg-amber-500/5 border-t border-amber-500/20">
              <div className="p-4 flex items-center gap-2">
                <span className="font-bold text-amber-400">추가 옵션</span>
                <Plus size={13} className="text-amber-400" />
              </div>
              <div className="p-4 text-center">
                <span className="text-amber-400 font-bold">+1개</span>
              </div>
              <div className="p-4 text-center">
                <span className="text-amber-400 font-bold">+1개</span>
              </div>
              <div className="p-4 text-center">
                <span className="text-amber-400 font-bold">₩9,900<span className="text-[#6B7280] text-xs font-normal">/월</span></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 포함 기능 ── */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              모든 플랜에 <span className="text-[#E63946]">포함된 기능</span>
            </h2>
            <p className="text-[#9CA3AF]">플랜에 관계없이 동일한 핵심 기능을 제공합니다.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6 hover:border-[#E63946]/30 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-11 h-11 bg-[#E63946]/10 rounded-xl flex items-center justify-center mb-4">
                  <f.icon size={22} className="text-[#E63946]" />
                </div>
                <h3 className="font-bold mb-2">{f.title}</h3>
                <p className="text-[#9CA3AF] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 최종 CTA ── */}
      <section className="py-20 px-4 bg-[#111111]">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-2 mb-6">
            <Sparkles size={14} className="text-emerald-400" />
            <span className="text-emerald-400 text-sm font-bold">Free 플랜으로 15일 무료 체험</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-5">
            지금 바로{" "}
            <span className="text-[#E63946]">무료로 시작</span>하세요
          </h2>
          <p className="text-[#9CA3AF] text-lg mb-8 max-w-xl mx-auto">
            신용카드 없이 15일간 플랫폼을 체험하세요.
            <br />
            언제든 플랜을 업그레이드하거나 추가 옵션을 추가할 수 있습니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button className="bg-[#E63946] hover:bg-[#FF4D5A] text-white text-lg font-bold rounded-xl px-10 py-7 gap-2 w-full sm:w-auto shadow-lg shadow-[#E63946]/25">
                <Sparkles size={18} /> 무료로 시작하기
              </Button>
            </Link>
            <Button
              onClick={() => setConsultOpen(true)}
              variant="outline"
              className="!bg-transparent border-2 border-white/20 text-white hover:border-[#E63946] hover:text-[#E63946] text-lg font-bold rounded-xl px-10 py-7 gap-2 transition-all duration-300"
            >
              <MessageCircle size={18} /> 플랜 상담 받기
            </Button>
          </div>
          <p className="text-[#6B7280] text-sm mt-6 flex items-center justify-center gap-2">
            <ArrowRight size={14} />
            가입 후 바로 Free 플랜이 자동 적용됩니다.
          </p>
        </div>
      </section>

      <Footer />
      <ConsultModal isOpen={consultOpen} onClose={() => setConsultOpen(false)} />
    </div>
  );
}