import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Check,
  X,
  ArrowRight,
  Sparkles,
  Calculator,
  MessageCircle,
  Clock,
  Phone,
  Star,
  Shield,
  Gift,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ConsultModal from "@/components/ConsultModal";
import { useSEO } from "@/hooks/useSEO";

const plans = [
  {
    name: "무료 체험",
    price: "₩0",
    period: "14일간",
    desc: "모든 기능을 제한 없이 체험해보세요.",
    badge: "시작하기",
    badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    highlight: false,
    features: [
      { text: "라이더별 배달 건수 / 금액 정산", included: true },
      { text: "일별 정산 리포트", included: true },
      { text: "주별 · 월별 정산 리포트", included: true },
      { text: "급여 계산 및 지급 관리", included: true },
      { text: "데이터 내보내기 (Excel)", included: true },
      { text: "우선 기술 지원", included: false },
      { text: "맞춤 리포트 설정", included: false },
      { text: "다중 지사 관리", included: false },
    ],
  },
  {
    name: "프로",
    price: "상담 후 결정",
    period: "",
    desc: "지사 규모에 맞는 합리적인 요금을 제안드립니다.",
    badge: "추천",
    badgeColor: "bg-[#E63946]/20 text-[#E63946] border-[#E63946]/30",
    highlight: true,
    features: [
      { text: "라이더별 배달 건수 / 금액 정산", included: true },
      { text: "일별 정산 리포트", included: true },
      { text: "주별 · 월별 정산 리포트", included: true },
      { text: "급여 계산 및 지급 관리", included: true },
      { text: "데이터 내보내기 (Excel)", included: true },
      { text: "우선 기술 지원", included: true },
      { text: "맞춤 리포트 설정", included: true },
      { text: "다중 지사 관리", included: true },
    ],
  },
];

const steps = [
  {
    step: "01",
    icon: Gift,
    title: "14일 무료 체험",
    desc: "가입 즉시 모든 기능을 14일간 무료로 사용하세요. 신용카드 등록 없이 바로 시작할 수 있습니다.",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
  },
  {
    step: "02",
    icon: Phone,
    title: "담당자 상담",
    desc: "체험 기간 중 또는 종료 후, 담당자와 편하게 상담하세요. 지사 규모에 맞는 최적의 플랜을 안내드립니다.",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
  },
  {
    step: "03",
    icon: Shield,
    title: "충분히 검토 후 결정",
    desc: "강제 결제는 없습니다. 충분한 설명을 듣고 납득이 되셨을 때 결정하시면 됩니다.",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
  },
];

const testimonials = [
  {
    name: "김지사장",
    agency: "은평 지사",
    quote:
      "매주 엑셀로 정산하던 걸 이제 클릭 한 번이면 끝납니다. 월 20시간은 절약하는 것 같아요.",
    riders: 45,
    saved: "월 20시간 절약",
  },
  {
    name: "이대표",
    agency: "강남 익스프레스",
    quote:
      "라이더들도 본인 정산 내역을 바로 확인할 수 있어서 문의 전화가 확 줄었습니다.",
    riders: 78,
    saved: "문의 80% 감소",
  },
  {
    name: "박사장",
    agency: "송파 라이더스",
    quote:
      "무료 체험 때 써보고 바로 결정했습니다. 상담도 친절하고 우리 지사에 맞게 설정해줘서 좋았어요.",
    riders: 32,
    saved: "정산 오류 0건",
  },
];

export default function Pricing() {
  const [consultOpen, setConsultOpen] = useState(false);

  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Product",
    name: "SpeedGang Match 정산 프로그램",
    description: "지사 전용 정산 프로그램. 라이더별 배달 건수와 금액을 한눈에 정산하고 리포트로 관리하세요.",
    url: "https://speedgangmatch.com/pricing",
    brand: {
      "@type": "Organization",
      name: "SpeedGang Match",
    },
    offers: [
      {
        "@type": "Offer",
        name: "무료 체험",
        price: "0",
        priceCurrency: "KRW",
        description: "14일간 모든 기능을 무료로 체험",
        availability: "https://schema.org/InStock",
      },
      {
        "@type": "Offer",
        name: "프로",
        price: "0",
        priceCurrency: "KRW",
        description: "상담 후 지사 규모에 맞는 합리적인 요금 결정",
        availability: "https://schema.org/InStock",
      },
    ],
    review: [
      {
        "@type": "Review",
        author: { "@type": "Person", name: "김지사장" },
        reviewBody: "매주 엑셀로 정산하던 걸 이제 클릭 한 번이면 끝납니다.",
        reviewRating: { "@type": "Rating", ratingValue: 5, bestRating: 5 },
      },
      {
        "@type": "Review",
        author: { "@type": "Person", name: "이대표" },
        reviewBody: "라이더들도 본인 정산 내역을 바로 확인할 수 있어서 문의 전화가 확 줄었습니다.",
        reviewRating: { "@type": "Rating", ratingValue: 5, bestRating: 5 },
      },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: 4.9,
      reviewCount: 3,
      bestRating: 5,
    },
  }), []);

  useSEO({
    title: "요금제 - 정산 프로그램 14일 무료 체험",
    description: "SpeedGang Match 정산 프로그램 요금 안내. 14일 무료 체험 후 담당자 상담으로 결정하세요. 강제 결제 없이 충분히 검토 후 결정할 수 있습니다.",
    url: "/pricing",
    jsonLd,
  });

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#E63946]/20 border border-[#E63946]/50 rounded-full px-4 py-2 mb-6">
            <Calculator size={16} className="text-[#E63946]" />
            <span className="text-[#E63946] text-sm font-bold">
              정산 프로그램 요금 안내
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-5 leading-tight">
            먼저 써보고,
            <br />
            <span className="text-[#E63946]">납득되면</span> 결정하세요
          </h1>
          <p className="text-[#9CA3AF] text-lg max-w-2xl mx-auto leading-relaxed">
            14일 무료 체험 후 담당자와 상담하세요.
            <br />
            강제 결제 없이, 충분한 설명을 듣고 결정하실 수 있습니다.
          </p>
        </div>
      </section>

      {/* 3단계 흐름 */}
      <section className="py-20 px-4 bg-[#111111]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              이용 <span className="text-[#E63946]">흐름</span>
            </h2>
            <p className="text-[#9CA3AF] text-lg">
              강요 없는, 신뢰 기반의 전환 프로세스
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((item, i) => (
              <div key={i} className="relative text-center">
                <div className="text-6xl font-bold text-[#E63946]/20 mb-4">
                  {item.step}
                </div>
                <div
                  className={`w-16 h-16 ${item.bgColor} border ${item.borderColor} rounded-2xl flex items-center justify-center mx-auto mb-6`}
                >
                  <item.icon size={30} className={item.color} />
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-[#9CA3AF] leading-relaxed">{item.desc}</p>
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

      {/* 플랜 비교 */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="text-[#E63946]">플랜</span> 비교
            </h2>
            <p className="text-[#9CA3AF] text-lg">
              무료 체험으로 시작하고, 필요할 때 업그레이드하세요.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {plans.map((plan, i) => (
              <div
                key={i}
                className={`relative rounded-2xl p-8 transition-all duration-300 ${
                  plan.highlight
                    ? "bg-gradient-to-b from-[#E63946]/10 to-[#1A1A1A] border-2 border-[#E63946]/50 shadow-lg shadow-[#E63946]/10"
                    : "bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#E63946]/30"
                }`}
              >
                {/* Badge */}
                <div className="mb-6">
                  <span
                    className={`text-xs font-bold px-3 py-1.5 rounded-full border ${plan.badgeColor}`}
                  >
                    {plan.badge}
                  </span>
                </div>

                <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-extrabold text-white">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-[#6B7280] text-sm">
                      / {plan.period}
                    </span>
                  )}
                </div>
                <p className="text-[#9CA3AF] text-sm mb-8">{plan.desc}</p>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <div key={j} className="flex items-center gap-3">
                      {f.included ? (
                        <div className="w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <Check size={12} className="text-emerald-400" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 bg-[#2A2A2A] rounded-full flex items-center justify-center flex-shrink-0">
                          <X size={12} className="text-[#4B5563]" />
                        </div>
                      )}
                      <span
                        className={
                          f.included ? "text-[#9CA3AF]" : "text-[#4B5563]"
                        }
                      >
                        {f.text}
                      </span>
                    </div>
                  ))}
                </div>

                {i === 0 ? (
                  <a
                    href="https://speedgang.pythonanywhere.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl py-6 gap-2 text-base">
                      <Sparkles size={16} /> 14일 무료 체험 시작
                      <ExternalLink size={14} className="opacity-70" />
                    </Button>
                  </a>
                ) : (
                  <Button
                    onClick={() => setConsultOpen(true)}
                    className="w-full bg-[#E63946] hover:bg-[#FF4D5A] text-white font-bold rounded-xl py-6 gap-2 text-base"
                  >
                    <MessageCircle size={16} /> 담당자 상담 신청
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* 체험 연장 안내 */}
          <div className="mt-10 bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6 sm:p-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Clock size={18} className="text-amber-400" />
              <h4 className="text-lg font-bold text-white">
                체험 기간이 부족하신가요?
              </h4>
            </div>
            <p className="text-[#9CA3AF] text-sm mb-4 max-w-lg mx-auto">
              14일이 부족하시면 담당자에게 연장을 요청하세요.
              <br />
              <span className="text-amber-400 font-medium">
                최대 7일 추가 연장
              </span>
              이 가능합니다. 충분히 체험하신 후 결정하세요.
            </p>
            <Button
              onClick={() => setConsultOpen(true)}
              variant="outline"
              className="!bg-transparent border-amber-500/30 text-amber-400 hover:border-amber-400 hover:text-amber-300 rounded-xl px-6 py-5 gap-2 font-bold"
            >
              <Phone size={16} /> 연장 요청하기
            </Button>
          </div>
        </div>
      </section>

      {/* 사용 후기 */}
      <section className="py-20 px-4 bg-[#111111]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              실제 <span className="text-[#E63946]">사용 후기</span>
            </h2>
            <p className="text-[#9CA3AF] text-lg">
              이미 많은 지사가 정산 프로그램으로 시간을 절약하고 있습니다.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6 hover:border-[#E63946]/30 transition-all duration-300"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star
                      key={j}
                      size={14}
                      className="text-amber-400 fill-amber-400"
                    />
                  ))}
                </div>
                <p className="text-[#9CA3AF] text-sm leading-relaxed mb-5 italic">
                  "{t.quote}"
                </p>
                <div className="border-t border-[#2A2A2A] pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold text-sm">
                        {t.name}
                      </p>
                      <p className="text-[#6B7280] text-xs">{t.agency}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#E63946] font-bold text-sm">
                        {t.saved}
                      </p>
                      <p className="text-[#6B7280] text-xs">
                        라이더 {t.riders}명
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 최종 CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-5">
            지금 바로{" "}
            <span className="text-[#E63946]">무료로 시작</span>하세요
          </h2>
          <p className="text-[#9CA3AF] text-lg mb-8 max-w-xl mx-auto">
            14일 무료 체험, 신용카드 불필요, 강제 결제 없음.
            <br />
            써보시고 마음에 드시면 그때 상담하세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://speedgang.pythonanywhere.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="bg-[#E63946] hover:bg-[#FF4D5A] text-white text-lg font-bold rounded-xl px-10 py-7 gap-2 w-full sm:w-auto shadow-lg shadow-[#E63946]/25">
                <Sparkles size={18} /> 무료 체험 시작하기
                <ExternalLink size={14} className="opacity-70" />
              </Button>
            </a>
            <Button
              onClick={() => setConsultOpen(true)}
              variant="outline"
              className="!bg-transparent border-2 border-white/20 text-white hover:border-[#E63946] hover:text-[#E63946] text-lg font-bold rounded-xl px-10 py-7 gap-2 transition-all duration-300"
            >
              <MessageCircle size={18} /> 상담 먼저 받기
            </Button>
          </div>
        </div>
      </section>

      <Footer />
      <ConsultModal isOpen={consultOpen} onClose={() => setConsultOpen(false)} />
    </div>
  );
}