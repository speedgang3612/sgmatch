import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bike,
  Building2,
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Clock,
  Banknote,
  Gift,
  Wrench,
  CheckCircle2,
  Loader2,
  Briefcase,
  ArrowRight,
  Mail,
  FileText,
  AlertCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { cities } from "@/data/regions";
import { getAPIBaseURL } from "@/lib/config";
import { useAuth } from "@/contexts/AuthContext";
import { useSEO } from "@/hooks/useSEO";

type Step = "select" | "rider-form" | "company-form" | "branch-form" | "done";

/* ─── 유효성 검사 헬퍼 ─── */
const PHONE_REGEX = /^01[016789]-?\d{3,4}-?\d{4}$/;
const BIZ_NUMBER_REGEX = /^\d{3}-?\d{2}-?\d{5}$/;
const CURRENT_YEAR = new Date().getFullYear();

function validatePhone(v: string): string | null {
  if (!v.trim()) return "연락처를 입력해주세요.";
  if (!PHONE_REGEX.test(v.replace(/\s/g, "")))
    return "올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)";
  return null;
}

function validateBizNumber(v: string): string | null {
  if (!v.trim()) return "사업자등록번호를 입력해주세요.";
  if (!BIZ_NUMBER_REGEX.test(v.replace(/\s/g, "")))
    return "올바른 사업자등록번호 형식이 아닙니다. (예: 123-45-67890)";
  return null;
}

function validateBirthYear(v: string): string | null {
  if (!v.trim()) return "출생년도를 입력해주세요.";
  const year = parseInt(v, 10);
  if (isNaN(year)) return "숫자만 입력해주세요.";
  if (year < 1940 || year > CURRENT_YEAR - 15)
    return `1940 ~ ${CURRENT_YEAR - 15} 사이의 년도를 입력해주세요.`;
  return null;
}

function validateRequired(v: string, label: string): string | null {
  if (!v.trim()) return `${label}을(를) 입력해주세요.`;
  return null;
}

function validateSelect(v: string, label: string): string | null {
  if (!v) return `${label}을(를) 선택해주세요.`;
  return null;
}

function validateEmail(v: string): string | null {
  if (!v.trim()) return null; // 선택 필드
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
    return "올바른 이메일 형식이 아닙니다.";
  return null;
}

/* ─── 에러 메시지 컴포넌트 ─── */
function FieldError({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <p className="flex items-center gap-1 text-red-400 text-xs mt-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
      <AlertCircle size={12} className="shrink-0" />
      {error}
    </p>
  );
}

export default function Register() {
  const { user, session, loading, login, refetch } = useAuth();
  console.log('[Register] session:', session, 'loading:', loading);

  // ── 이미 로그인된 유저의 역할을 agency로 업데이트하는 헬퍼 ──
  const updateUserRole = async (role: string) => {
    const token = session?.access_token ?? null;
    if (!token) return;
    try {
      const res = await fetch(`${getAPIBaseURL()}/api/v1/auth/me/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          localStorage.setItem('access_token', data.token);
          if (data.expires_at) localStorage.setItem('token_expires_at', String(data.expires_at));
        }
        await refetch(); // AuthContext → JWT 재파싱 → UI 즉시 반영
      } else {
        console.error('[Register] role 업데이트 HTTP 오류:', res.status, await res.text());
      }
    } catch (err) {
      console.error('[Register] role 업데이트 실패:', err);
    }
  };
  const [step, setStep] = useState<Step>("select");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // 유효성 검사 시도 여부 (제출 버튼 클릭 후 true)
  const [riderTouched, setRiderTouched] = useState(false);
  const [companyTouched, setCompanyTouched] = useState(false);
  const [branchTouched, setBranchTouched] = useState(false);

  // 약관 동의 체크박스 --- 라이더 가입 폼
  const [riderAgreePrivacy, setRiderAgreePrivacy] = useState(false);
  const [riderAgreeThirdParty, setRiderAgreeThirdParty] = useState(false);
  const [riderAgreeTerms, setRiderAgreeTerms] = useState(false);
  const riderAllAgreed = riderAgreePrivacy && riderAgreeThirdParty && riderAgreeTerms;

  // 약관 동의 체크박스 --- 회사/지사 가입 폼
  const [companyAgreePrivacy, setCompanyAgreePrivacy] = useState(false);
  const [companyAgreeThirdParty, setCompanyAgreeThirdParty] = useState(false);
  const [companyAgreeTerms, setCompanyAgreeTerms] = useState(false);
  const companyAllAgreed = companyAgreePrivacy && companyAgreeThirdParty && companyAgreeTerms;

  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "회원가입 - SpeedGang Match",
    description: "배달 라이더 또는 지사로 가입하세요. 2분 안에 간편하게 등록하고 최적의 매칭을 시작하세요.",
    url: "https://speedgangmatch.com/register",
    isPartOf: {
      "@type": "WebSite",
      name: "SpeedGang Match",
      url: "https://speedgangmatch.com",
    },
  }), []);

  useSEO({
    title: "회원가입 - 라이더 또는 지사로 시작하기",
    description: "SpeedGang Match에 배달 라이더 또는 지사로 가입하세요. 2분 안에 간편하게 등록하고 최적의 매칭을 시작하세요.",
    url: "/register",
    jsonLd,
  });

  // Rider form state
  const [riderName, setRiderName] = useState("");
  const [riderPhone, setRiderPhone] = useState("");
  const [riderCity, setRiderCity] = useState("");
  const [riderDistrict, setRiderDistrict] = useState("");
  const [riderExperience, setRiderExperience] = useState("");
  const [riderMotorcycle, setRiderMotorcycle] = useState("");
  const [riderType, setRiderType] = useState("");
  const [riderBirthYear, setRiderBirthYear] = useState("");

  // Company form state
  const [companyName, setCompanyName] = useState("");
  const [businessNumber, setBusinessNumber] = useState("");
  const [representative, setRepresentative] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [savedCompanyId, setSavedCompanyId] = useState<number | null>(null);

  // Branch form state
  const [branchName, setBranchName] = useState("");
  const [branchManager, setBranchManager] = useState("");
  const [branchPhone, setBranchPhone] = useState("");
  const [branchCity, setBranchCity] = useState("");
  const [branchDistrict, setBranchDistrict] = useState("");
  const [branchPlatform, setBranchPlatform] = useState("");
  const [branchPay, setBranchPay] = useState("");
  const [branchPromo, setBranchPromo] = useState("");
  const [branchSettlement, setBranchSettlement] = useState("");
  const [branchMotorcycle, setBranchMotorcycle] = useState("");
  const [branchWorkType, setBranchWorkType] = useState("");

  const riderCityData = cities.find((c) => c.name === riderCity);
  const branchCityData = cities.find((c) => c.name === branchCity);

  const selectClasses =
    "text-white hover:bg-white/10 focus:bg-white/10 focus:text-white";

  /* ─── 라이더 유효성 검사 ─── */
  const riderErrors = useMemo(() => ({
    name: validateRequired(riderName, "이름"),
    phone: validatePhone(riderPhone),
    birthYear: validateBirthYear(riderBirthYear),
    city: validateSelect(riderCity, "시/도"),
    district: validateSelect(riderDistrict, "구/군"),
    experience: validateSelect(riderExperience, "배달 경력"),
    motorcycle: validateSelect(riderMotorcycle, "오토바이 보유 여부"),
    type: validateSelect(riderType, "유형"),
  }), [riderName, riderPhone, riderBirthYear, riderCity, riderDistrict, riderExperience, riderMotorcycle, riderType]);

  const isRiderValid = useMemo(
    () => Object.values(riderErrors).every((e) => e === null),
    [riderErrors]
  );

  /* ─── 회사 유효성 검사 ─── */
  const companyErrors = useMemo(() => ({
    companyName: validateRequired(companyName, "회사명"),
    businessNumber: validateBizNumber(businessNumber),
    representative: validateRequired(representative, "대표자명"),
    phone: validatePhone(companyPhone),
    email: validateEmail(companyEmail),
  }), [companyName, businessNumber, representative, companyPhone, companyEmail]);

  const isCompanyValid = useMemo(
    () => Object.values(companyErrors).every((e) => e === null),
    [companyErrors]
  );

  /* ─── 지사 유효성 검사 ─── */
  const branchErrors = useMemo(() => ({
    name: validateRequired(branchName, "지사명"),
    manager: validateRequired(branchManager, "지사 담당자명"),
    phone: validatePhone(branchPhone),
    platform: validateSelect(branchPlatform, "플랫폼"),
    city: validateSelect(branchCity, "시/도"),
    district: validateSelect(branchDistrict, "구/군"),
    pay: validateRequired(branchPay, "건당 단가"),
    settlement: validateSelect(branchSettlement, "정산 방식"),
  }), [branchName, branchManager, branchPhone, branchPlatform, branchCity, branchDistrict, branchPay, branchSettlement]);

  const isBranchValid = useMemo(
    () => Object.values(branchErrors).every((e) => e === null),
    [branchErrors]
  );

  /* ─── 에러 입력 스타일 ─── */
  const inputErr = (hasError: boolean, touched: boolean) =>
    touched && hasError
      ? "bg-[#111111] border-red-500/50 text-white rounded-xl focus:border-red-500"
      : "bg-[#111111] border-[#2A2A2A] text-white rounded-xl";

  const selectErr = (hasError: boolean, touched: boolean) =>
    touched && hasError
      ? "bg-[#111111] border-red-500/50 text-white rounded-xl"
      : "bg-[#111111] border-[#2A2A2A] text-white rounded-xl";

  /* ─── 유효한 필드 수 계산 (진행률 표시) ─── */
  const getRiderProgress = useCallback(() => {
    const total = Object.keys(riderErrors).length;
    const valid = Object.values(riderErrors).filter((e) => e === null).length;
    return { total, valid };
  }, [riderErrors]);

  const getCompanyProgress = useCallback(() => {
    const total = Object.keys(companyErrors).length;
    const valid = Object.values(companyErrors).filter((e) => e === null).length;
    return { total, valid };
  }, [companyErrors]);

  const getBranchProgress = useCallback(() => {
    const total = Object.keys(branchErrors).length;
    const valid = Object.values(branchErrors).filter((e) => e === null).length;
    return { total, valid };
  }, [branchErrors]);

  const handleRiderSubmit = async () => {
    setRiderTouched(true);
    if (!isRiderValid) return;
    // 약관 전체 동의 여부 확인
    if (!riderAllAgreed) return;

    if (!user) {
      login(); // 라이더 등록 — 역할 미변경
      return;
    }

    setSaving(true);
    setSaveError(null);

    try {
      const token = session?.access_token ?? null;
      const res = await fetch(`${getAPIBaseURL()}/api/v1/entities/rider_profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: riderName,
          phone: riderPhone,
          city: riderCity,
          district: riderDistrict,
          experience: riderExperience,
          has_motorcycle: riderMotorcycle === "yes",
          rider_type: riderType,
          birth_year: riderBirthYear,
          status: "active",
          created_at: new Date().toISOString().replace("T", " ").slice(0, 19),
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStep("done");
    } catch (err) {
      console.error("Failed to save rider profile:", err);
      setSaveError("저장 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  };

  const handleCompanySubmit = async () => {
    setCompanyTouched(true);
    if (!isCompanyValid) return;
    // 약관 전체 동의 여부 확인
    if (!companyAllAgreed) return;

    if (!user) {
      login('agency'); // 비로그인 → OAuth 후 agency 역할 자동 부여
      return;
    }

    // 이미 로그인된 유저 → role이 agency가 아니면 즉시 업데이트
    if (user.role !== 'agency') {
      await updateUserRole('agency');
    }

    setSaving(true);
    setSaveError(null);

    try {
      const token = session?.access_token ?? null;
      const res = await fetch(`${getAPIBaseURL()}/api/v1/entities/companies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          company_name: companyName,
          business_number: businessNumber,
          representative: representative,
          phone: companyPhone,
          email: companyEmail,
          created_at: new Date().toISOString().replace("T", " ").slice(0, 19),
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const responseData = await res.json();
      const newCompanyId = responseData?.id;
      if (newCompanyId) {
        setSavedCompanyId(newCompanyId);
        setStep("branch-form");
      } else {
        setSaveError("회사 등록에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (err) {
      console.error("Failed to save company:", err);
      setSaveError("저장 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  };

  const handleBranchSubmit = async () => {
    setBranchTouched(true);
    if (!isBranchValid) return;

    if (!user) {
      login('agency'); // 지사 지점 등록 — OAuth 후 agency 역할 자동 부여
      return;
    }

    if (!savedCompanyId) {
      setSaveError("회사 정보가 없습니다. 처음부터 다시 시도해주세요.");
      return;
    }

    setSaving(true);
    setSaveError(null);

    try {
      const token = session?.access_token ?? null;
      const res = await fetch(`${getAPIBaseURL()}/api/v1/entities/agency_profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          company_id: savedCompanyId,
          name: branchName,
          manager_name: branchManager,
          phone: branchPhone,
          city: branchCity,
          district: branchDistrict,
          platform: branchPlatform,
          pay_per_delivery: branchPay,
          promotion: branchPromo,
          settlement_type: branchSettlement,
          motorcycle_option: branchMotorcycle,
          work_type: branchWorkType,
          verified: false,
          created_at: new Date().toISOString().replace("T", " ").slice(0, 19),
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStep("done");
    } catch (err) {
      console.error("Failed to save branch:", err);
      setSaveError("저장 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  };

  /* ─── 진행률 바 컴포넌트 ─── */
  const ProgressBar = ({ valid, total }: { valid: number; total: number }) => {
    const pct = total > 0 ? Math.round((valid / total) * 100) : 0;
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[#6B7280]">입력 진행률</span>
          <span className="text-xs font-medium text-[#9CA3AF]">
            {valid}/{total} 완료 ({pct}%)
          </span>
        </div>
        <div className="w-full h-1.5 bg-[#2A2A2A] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${pct}%`,
              background:
                pct === 100
                  ? "linear-gradient(90deg, #10B981, #34D399)"
                  : "linear-gradient(90deg, #E63946, #FF4D5A)",
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <Navbar />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          {/* 가입 유형 선택 */}
          {step === "select" && (
            <div>
              <div className="text-center mb-12">
                <h1 className="text-3xl sm:text-4xl font-bold mb-4">
                  <span className="text-[#E63946]">시작하기</span>
                </h1>
                <p className="text-[#9CA3AF] text-lg">
                  가입 유형을 선택해주세요.
                </p>
                {!user && (
                  <p className="text-amber-400 text-sm mt-3">
                    가입을 완료하려면 로그인이 필요합니다.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* 라이더 가입 */}
                <button
                  onClick={() => setStep("rider-form")}
                  className="bg-[#1A1A1A] border-2 border-[#2A2A2A] rounded-2xl p-8 text-left hover:border-[#E63946]/50 hover:bg-[#E63946]/5 transition-all duration-300 group"
                >
                  <div className="w-16 h-16 bg-[#E63946]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#E63946]/20 transition-colors">
                    <Bike size={32} className="text-[#E63946]" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-[#E63946] transition-colors">
                    라이더 가입
                  </h3>
                  <p className="text-[#9CA3AF] text-sm leading-relaxed">
                    배달 라이더로 가입하고 최적의 지사를 찾아보세요. 단가 비교,
                    프로모션 확인이 가능합니다.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {["지사 비교", "단가 확인", "빠른 지원"].map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-[#E63946]/10 text-[#E63946] px-2.5 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>

                {/* 회사/지사 가입 */}
                <button
                  onClick={() => setStep("company-form")}
                  className="bg-[#1A1A1A] border-2 border-[#2A2A2A] rounded-2xl p-8 text-left hover:border-[#E63946]/50 hover:bg-[#E63946]/5 transition-all duration-300 group"
                >
                  <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-amber-500/20 transition-colors">
                    <Building2 size={32} className="text-amber-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-amber-400 transition-colors">
                    회사 / 지사 가입
                  </h3>
                  <p className="text-[#9CA3AF] text-sm leading-relaxed">
                    회사를 등록하고 여러 지역에 지사를 만들어 라이더를 모집하세요.
                    하나의 회사로 여러 지사 운영이 가능합니다.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {["회사 등록", "다중 지사", "통합 관리"].map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              </div>

              <div className="text-center mt-8">
                <Link
                  to="/"
                  className="text-[#6B7280] text-sm hover:text-white transition-colors"
                >
                  ← 홈으로 돌아가기
                </Link>
              </div>
            </div>
          )}

          {/* 라이더 가입 폼 */}
          {step === "rider-form" && (
            <div>
              <button
                onClick={() => { setStep("select"); setRiderTouched(false); }}
                className="flex items-center gap-2 text-[#9CA3AF] hover:text-white transition-colors mb-8"
              >
                <ArrowLeft size={18} />
                <span className="text-sm font-medium">뒤로가기</span>
              </button>

              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-[#E63946]/10 rounded-xl flex items-center justify-center">
                  <Bike size={24} className="text-[#E63946]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">라이더 가입</h2>
                  <p className="text-[#6B7280] text-sm">
                    인적사항을 입력해주세요.
                  </p>
                </div>
              </div>

              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6 sm:p-8">
                <ProgressBar {...getRiderProgress()} />

                {saveError && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm mb-5 flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0" />
                    {saveError}
                  </div>
                )}

                {!user && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-amber-400 text-sm mb-5">
                    가입 완료 시 로그인 페이지로 이동합니다.
                  </div>
                )}

                {riderTouched && !isRiderValid && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm mb-5 flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0" />
                    필수 항목을 모두 올바르게 입력해주세요.
                  </div>
                )}

                <div className="space-y-5">
                  <div>
                    <label className="text-[#9CA3AF] text-sm mb-1.5 block flex items-center gap-1.5">
                      <User size={14} /> 이름 <span className="text-[#E63946]">*</span>
                    </label>
                    <Input
                      placeholder="홍길동"
                      value={riderName}
                      onChange={(e) => setRiderName(e.target.value)}
                      className={inputErr(!!riderErrors.name, riderTouched)}
                    />
                    {riderTouched && <FieldError error={riderErrors.name} />}
                  </div>

                  <div>
                    <label className="text-[#9CA3AF] text-sm mb-1.5 block flex items-center gap-1.5">
                      <Phone size={14} /> 연락처 <span className="text-[#E63946]">*</span>
                    </label>
                    <Input
                      placeholder="010-1234-5678"
                      value={riderPhone}
                      onChange={(e) => setRiderPhone(e.target.value)}
                      className={inputErr(!!riderErrors.phone, riderTouched)}
                    />
                    {riderTouched && <FieldError error={riderErrors.phone} />}
                  </div>

                  <div>
                    <label className="text-[#9CA3AF] text-sm mb-1.5 block">
                      출생년도 <span className="text-[#E63946]">*</span>
                    </label>
                    <Input
                      placeholder="1990"
                      value={riderBirthYear}
                      onChange={(e) => setRiderBirthYear(e.target.value)}
                      className={inputErr(!!riderErrors.birthYear, riderTouched)}
                    />
                    {riderTouched && <FieldError error={riderErrors.birthYear} />}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[#9CA3AF] text-sm mb-1.5 block flex items-center gap-1.5">
                        <MapPin size={14} /> 시/도 <span className="text-[#E63946]">*</span>
                      </label>
                      <Select
                        value={riderCity}
                        onValueChange={(v) => {
                          setRiderCity(v);
                          setRiderDistrict("");
                        }}
                      >
                        <SelectTrigger className={selectErr(!!riderErrors.city, riderTouched)}>
                          <SelectValue placeholder="시/도 선택" />
                        </SelectTrigger>
                        <SelectContent className="!bg-[#1A1A1A] border-[#2A2A2A] text-white">
                          {cities.map((c) => (
                            <SelectItem key={c.name} value={c.name} className={selectClasses}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {riderTouched && <FieldError error={riderErrors.city} />}
                    </div>
                    <div>
                      <label className="text-[#9CA3AF] text-sm mb-1.5 block">
                        구/군 <span className="text-[#E63946]">*</span>
                      </label>
                      <Select
                        value={riderDistrict}
                        onValueChange={setRiderDistrict}
                        disabled={!riderCity}
                      >
                        <SelectTrigger className={selectErr(!!riderErrors.district, riderTouched)}>
                          <SelectValue placeholder="구/군 선택" />
                        </SelectTrigger>
                        <SelectContent className="!bg-[#1A1A1A] border-[#2A2A2A] text-white">
                          {riderCityData?.regions.map((r) => (
                            <SelectItem key={r.name} value={r.name} className={selectClasses}>
                              {r.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {riderTouched && <FieldError error={riderErrors.district} />}
                    </div>
                  </div>

                  <div>
                    <label className="text-[#9CA3AF] text-sm mb-1.5 block">
                      배달 경력 <span className="text-[#E63946]">*</span>
                    </label>
                    <Select value={riderExperience} onValueChange={setRiderExperience}>
                      <SelectTrigger className={selectErr(!!riderErrors.experience, riderTouched)}>
                        <SelectValue placeholder="경력 선택" />
                      </SelectTrigger>
                      <SelectContent className="!bg-[#1A1A1A] border-[#2A2A2A] text-white">
                        <SelectItem value="none" className={selectClasses}>신입 (경력 없음)</SelectItem>
                        <SelectItem value="6months" className={selectClasses}>6개월 미만</SelectItem>
                        <SelectItem value="1year" className={selectClasses}>6개월 ~ 1년</SelectItem>
                        <SelectItem value="2years" className={selectClasses}>1년 ~ 2년</SelectItem>
                        <SelectItem value="3years" className={selectClasses}>2년 ~ 3년</SelectItem>
                        <SelectItem value="5years" className={selectClasses}>3년 이상</SelectItem>
                      </SelectContent>
                    </Select>
                    {riderTouched && <FieldError error={riderErrors.experience} />}
                  </div>

                  <div>
                    <label className="text-[#9CA3AF] text-sm mb-1.5 block flex items-center gap-1.5">
                      <Bike size={14} /> 오토바이 보유 여부 <span className="text-[#E63946]">*</span>
                    </label>
                    <Select value={riderMotorcycle} onValueChange={setRiderMotorcycle}>
                      <SelectTrigger className={selectErr(!!riderErrors.motorcycle, riderTouched)}>
                        <SelectValue placeholder="선택" />
                      </SelectTrigger>
                      <SelectContent className="!bg-[#1A1A1A] border-[#2A2A2A] text-white">
                        <SelectItem value="yes" className={selectClasses}>보유</SelectItem>
                        <SelectItem value="no" className={selectClasses}>미보유</SelectItem>
                      </SelectContent>
                    </Select>
                    {riderTouched && <FieldError error={riderErrors.motorcycle} />}
                  </div>

                  <div>
                    <label className="text-[#9CA3AF] text-sm mb-1.5 block flex items-center gap-1.5">
                      <Clock size={14} /> 유형 <span className="text-[#E63946]">*</span>
                    </label>
                    <Select value={riderType} onValueChange={setRiderType}>
                      <SelectTrigger className={selectErr(!!riderErrors.type, riderTouched)}>
                        <SelectValue placeholder="유형 선택" />
                      </SelectTrigger>
                      <SelectContent className="!bg-[#1A1A1A] border-[#2A2A2A] text-white">
                        <SelectItem value="freelance" className={selectClasses}>프리</SelectItem>
                        <SelectItem value="fulltime" className={selectClasses}>전업</SelectItem>
                      </SelectContent>
                    </Select>
                    {riderTouched && <FieldError error={riderErrors.type} />}
                  </div>
                </div>

                {/* 약관 동의 체크박스 */}
                <div className="mt-8 space-y-3">
                  <p className="text-sm font-semibold text-[#9CA3AF] mb-3 flex items-center gap-1.5">
                    <FileText size={14} />
                    서비스 이용을 위해 아래 약관에 동의해주세요 <span className="text-[#E63946]">*</span>
                  </p>

                  {/* 개인정보 수집 및 이용 동의 */}
                  <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    riderAgreePrivacy ? 'border-[#E63946]/40 bg-[#E63946]/5' : 'border-[#2A2A2A] hover:border-[#3A3A3A]'
                  }`}>
                    <input
                      type="checkbox"
                      checked={riderAgreePrivacy}
                      onChange={(e) => setRiderAgreePrivacy(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-[#E63946] shrink-0"
                    />
                    <span className="text-sm text-[#D1D5DB] leading-relaxed">
                      <strong className="text-white">[필수]</strong> 개인정보 수집 및 이용 동의 —
                      이름, 전화번호, 지역 등을 구인·구직 매칭 목적으로 수집합니다.{" "}
                      <Link to="/privacy" target="_blank" className="text-[#E63946] hover:underline">
                        전문 보기
                      </Link>
                    </span>
                  </label>

                  {/* 제3자 정보 제공 동의 */}
                  <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    riderAgreeThirdParty ? 'border-[#E63946]/40 bg-[#E63946]/5' : 'border-[#2A2A2A] hover:border-[#3A3A3A]'
                  }`}>
                    <input
                      type="checkbox"
                      checked={riderAgreeThirdParty}
                      onChange={(e) => setRiderAgreeThirdParty(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-[#E63946] shrink-0"
                    />
                    <span className="text-sm text-[#D1D5DB] leading-relaxed">
                      <strong className="text-white">[필수]</strong> 제3자 정보 제공 동의 —
                      매칭 서비스 제공을 위해 지사에 라이더 정보(이름, 연락처 등)를 제공합니다.
                    </span>
                  </label>

                  {/* 서비스 이용약관 동의 */}
                  <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    riderAgreeTerms ? 'border-[#E63946]/40 bg-[#E63946]/5' : 'border-[#2A2A2A] hover:border-[#3A3A3A]'
                  }`}>
                    <input
                      type="checkbox"
                      checked={riderAgreeTerms}
                      onChange={(e) => setRiderAgreeTerms(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-[#E63946] shrink-0"
                    />
                    <span className="text-sm text-[#D1D5DB] leading-relaxed">
                      <strong className="text-white">[필수]</strong> 서비스 이용약관 동의 —
                      목적 외 사용, 정보 2차 판매, 스팸 사용 금지. 위반 시 계정 정지 및 법적 조치.{" "}
                      <Link to="/terms" target="_blank" className="text-[#E63946] hover:underline">
                        전문 보기
                      </Link>
                    </span>
                  </label>

                  {riderTouched && !riderAllAgreed && (
                    <p className="flex items-center gap-1 text-red-400 text-xs animate-in fade-in slide-in-from-top-1 duration-200">
                      <AlertCircle size={12} className="shrink-0" />
                      모든 필수 약관에 동의해야 가입이 가능합니다.
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleRiderSubmit}
                  disabled={saving}
                  className="w-full mt-4 bg-[#E63946] hover:bg-[#FF4D5A] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl py-6 text-base gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> 처리 중...
                    </>
                  ) : !user ? (
                    <>
                      <User size={18} /> 로그인 후 가입 완료
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} /> 라이더 가입 완료
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* 회사 등록 폼 (Step 1) */}
          {step === "company-form" && (
            <div>
              <button
                onClick={() => { setStep("select"); setCompanyTouched(false); }}
                className="flex items-center gap-2 text-[#9CA3AF] hover:text-white transition-colors mb-8"
              >
                <ArrowLeft size={18} />
                <span className="text-sm font-medium">뒤로가기</span>
              </button>

              {/* 단계 표시 */}
              <div className="flex items-center gap-3 mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#E63946] rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <span className="text-sm font-medium text-white">회사 등록</span>
                </div>
                <div className="flex-1 h-px bg-[#2A2A2A]" />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#2A2A2A] rounded-full flex items-center justify-center text-sm font-bold text-[#6B7280]">2</div>
                  <span className="text-sm font-medium text-[#6B7280]">지사 등록</span>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
                  <Briefcase size={24} className="text-amber-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">회사 등록</h2>
                  <p className="text-[#6B7280] text-sm">
                    사업자 정보를 입력해주세요. 하나의 회사로 여러 지사를 운영할 수 있습니다.
                  </p>
                </div>
              </div>

              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6 sm:p-8">
                <ProgressBar {...getCompanyProgress()} />

                {saveError && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm mb-5 flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0" />
                    {saveError}
                  </div>
                )}

                {!user && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-amber-400 text-sm mb-5">
                    가입 완료 시 로그인 페이지로 이동합니다.
                  </div>
                )}

                {companyTouched && !isCompanyValid && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm mb-5 flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0" />
                    필수 항목을 모두 올바르게 입력해주세요.
                  </div>
                )}

                <div className="space-y-5">
                  <div>
                    <label className="text-[#9CA3AF] text-sm mb-1.5 block flex items-center gap-1.5">
                      <Building2 size={14} /> 회사명 <span className="text-[#E63946]">*</span>
                    </label>
                    <Input
                      placeholder="회사명 입력"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className={inputErr(!!companyErrors.companyName, companyTouched)}
                    />
                    <p className="text-[#6B7280] text-xs mt-1">
                      이 회사명으로 여러 지사를 운영할 수 있습니다.
                    </p>
                    {companyTouched && <FieldError error={companyErrors.companyName} />}
                  </div>

                  <div>
                    <label className="text-[#9CA3AF] text-sm mb-1.5 block flex items-center gap-1.5">
                      <FileText size={14} /> 사업자등록번호 <span className="text-[#E63946]">*</span>
                    </label>
                    <Input
                      placeholder="123-45-67890"
                      value={businessNumber}
                      onChange={(e) => setBusinessNumber(e.target.value)}
                      className={inputErr(!!companyErrors.businessNumber, companyTouched)}
                    />
                    {companyTouched && <FieldError error={companyErrors.businessNumber} />}
                  </div>

                  <div>
                    <label className="text-[#9CA3AF] text-sm mb-1.5 block flex items-center gap-1.5">
                      <User size={14} /> 대표자명 <span className="text-[#E63946]">*</span>
                    </label>
                    <Input
                      placeholder="홍길동"
                      value={representative}
                      onChange={(e) => setRepresentative(e.target.value)}
                      className={inputErr(!!companyErrors.representative, companyTouched)}
                    />
                    {companyTouched && <FieldError error={companyErrors.representative} />}
                  </div>

                  <div>
                    <label className="text-[#9CA3AF] text-sm mb-1.5 block flex items-center gap-1.5">
                      <Phone size={14} /> 연락처 <span className="text-[#E63946]">*</span>
                    </label>
                    <Input
                      placeholder="010-1234-5678"
                      value={companyPhone}
                      onChange={(e) => setCompanyPhone(e.target.value)}
                      className={inputErr(!!companyErrors.phone, companyTouched)}
                    />
                    {companyTouched && <FieldError error={companyErrors.phone} />}
                  </div>

                  <div>
                    <label className="text-[#9CA3AF] text-sm mb-1.5 block flex items-center gap-1.5">
                      <Mail size={14} /> 이메일
                    </label>
                    <Input
                      placeholder="company@example.com"
                      value={companyEmail}
                      onChange={(e) => setCompanyEmail(e.target.value)}
                      className={inputErr(!!companyErrors.email, companyTouched)}
                    />
                    {companyTouched && <FieldError error={companyErrors.email} />}
                  </div>
                </div>

                {/* 약관 동의 체크박스 */}
                <div className="mt-8 space-y-3">
                  <p className="text-sm font-semibold text-[#9CA3AF] mb-3 flex items-center gap-1.5">
                    <FileText size={14} />
                    서비스 이용을 위해 아래 약관에 동의해주세요 <span className="text-[#E63946]">*</span>
                  </p>

                  {/* 개인정보 수집 및 이용 동의 */}
                  <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    companyAgreePrivacy ? 'border-[#E63946]/40 bg-[#E63946]/5' : 'border-[#2A2A2A] hover:border-[#3A3A3A]'
                  }`}>
                    <input
                      type="checkbox"
                      checked={companyAgreePrivacy}
                      onChange={(e) => setCompanyAgreePrivacy(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-[#E63946] shrink-0"
                    />
                    <span className="text-sm text-[#D1D5DB] leading-relaxed">
                      <strong className="text-white">[필수]</strong> 개인정보 수집 및 이용 동의 —
                      회사명, 사업자번호, 연락처 등을 구인·구직 매칭 목적으로 수집합니다.{" "}
                      <Link to="/privacy" target="_blank" className="text-[#E63946] hover:underline">
                        전문 보기
                      </Link>
                    </span>
                  </label>

                  {/* 제3자 정보 제공 동의 */}
                  <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    companyAgreeThirdParty ? 'border-[#E63946]/40 bg-[#E63946]/5' : 'border-[#2A2A2A] hover:border-[#3A3A3A]'
                  }`}>
                    <input
                      type="checkbox"
                      checked={companyAgreeThirdParty}
                      onChange={(e) => setCompanyAgreeThirdParty(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-[#E63946] shrink-0"
                    />
                    <span className="text-sm text-[#D1D5DB] leading-relaxed">
                      <strong className="text-white">[필수]</strong> 제3자 정보 제공 동의 —
                      매칭 서비스 제공을 위해 라이더에게 지사 정보(지사명, 단가, 연락처 등)를 제공합니다.
                    </span>
                  </label>

                  {/* 서비스 이용약관 동의 */}
                  <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    companyAgreeTerms ? 'border-[#E63946]/40 bg-[#E63946]/5' : 'border-[#2A2A2A] hover:border-[#3A3A3A]'
                  }`}>
                    <input
                      type="checkbox"
                      checked={companyAgreeTerms}
                      onChange={(e) => setCompanyAgreeTerms(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-[#E63946] shrink-0"
                    />
                    <span className="text-sm text-[#D1D5DB] leading-relaxed">
                      <strong className="text-white">[필수]</strong> 서비스 이용약관 동의 —
                      목적 외 사용, 정보 2차 판매, 스팸 사용 금지. 위반 시 계정 정지 및 법적 조치.{" "}
                      <Link to="/terms" target="_blank" className="text-[#E63946] hover:underline">
                        전문 보기
                      </Link>
                    </span>
                  </label>

                  {companyTouched && !companyAllAgreed && (
                    <p className="flex items-center gap-1 text-red-400 text-xs animate-in fade-in slide-in-from-top-1 duration-200">
                      <AlertCircle size={12} className="shrink-0" />
                      모든 필수 약관에 동의해야 가입이 가능합니다.
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleCompanySubmit}
                  disabled={saving}
                  className="w-full mt-4 bg-[#E63946] hover:bg-[#FF4D5A] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl py-6 text-base gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> 처리 중...
                    </>
                  ) : !user ? (
                    <>
                      <User size={18} /> 로그인 후 다음 단계
                    </>
                  ) : (
                    <>
                      다음: 지사 등록 <ArrowRight size={18} />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* 지사 등록 폼 (Step 2) */}
          {step === "branch-form" && (
            <div>
              <button
                onClick={() => { setStep("company-form"); setBranchTouched(false); }}
                className="flex items-center gap-2 text-[#9CA3AF] hover:text-white transition-colors mb-8"
              >
                <ArrowLeft size={18} />
                <span className="text-sm font-medium">뒤로가기</span>
              </button>

              {/* 단계 표시 */}
              <div className="flex items-center gap-3 mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={16} className="text-white" />
                  </div>
                  <span className="text-sm font-medium text-emerald-400">회사 등록 완료</span>
                </div>
                <div className="flex-1 h-px bg-emerald-500/30" />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#E63946] rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <span className="text-sm font-medium text-white">지사 등록</span>
                </div>
              </div>

              {/* 회사 정보 요약 */}
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                  <Building2 size={20} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-400">{companyName}</p>
                  <p className="text-xs text-[#6B7280]">사업자번호: {businessNumber}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
                  <MapPin size={24} className="text-amber-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">첫 번째 지사 등록</h2>
                  <p className="text-[#6B7280] text-sm">
                    {companyName}의 첫 번째 지사 정보를 입력해주세요. 추가 지사는 대시보드에서 등록할 수 있습니다.
                  </p>
                </div>
              </div>

              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6 sm:p-8">
                <ProgressBar {...getBranchProgress()} />

                {saveError && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm mb-5 flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0" />
                    {saveError}
                  </div>
                )}

                {branchTouched && !isBranchValid && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm mb-5 flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0" />
                    필수 항목을 모두 올바르게 입력해주세요.
                  </div>
                )}

                <div className="space-y-5">
                  <div>
                    <label className="text-[#9CA3AF] text-sm mb-1.5 block flex items-center gap-1.5">
                      <Building2 size={14} /> 지사명 <span className="text-[#E63946]">*</span>
                    </label>
                    <Input
                      placeholder="지사명 입력"
                      value={branchName}
                      onChange={(e) => setBranchName(e.target.value)}
                      className={inputErr(!!branchErrors.name, branchTouched)}
                    />
                    <p className="text-[#6B7280] text-xs mt-1">
                      표시 형식: <span className="text-amber-400">{companyName} · {branchName || "지사명"}</span>
                    </p>
                    {branchTouched && <FieldError error={branchErrors.name} />}
                  </div>

                  <div>
                    <label className="text-[#9CA3AF] text-sm mb-1.5 block flex items-center gap-1.5">
                      <User size={14} /> 지사 담당자명 <span className="text-[#E63946]">*</span>
                    </label>
                    <Input
                      placeholder="김담당"
                      value={branchManager}
                      onChange={(e) => setBranchManager(e.target.value)}
                      className={inputErr(!!branchErrors.manager, branchTouched)}
                    />
                    {branchTouched && <FieldError error={branchErrors.manager} />}
                  </div>

                  <div>
                    <label className="text-[#9CA3AF] text-sm mb-1.5 block flex items-center gap-1.5">
                      <Phone size={14} /> 지사 연락처 <span className="text-[#E63946]">*</span>
                    </label>
                    <Input
                      placeholder="010-1234-5678"
                      value={branchPhone}
                      onChange={(e) => setBranchPhone(e.target.value)}
                      className={inputErr(!!branchErrors.phone, branchTouched)}
                    />
                    {branchTouched && <FieldError error={branchErrors.phone} />}
                  </div>

                  <div>
                    <label className="text-[#9CA3AF] text-sm mb-1.5 block">
                      플랫폼 <span className="text-[#E63946]">*</span>
                    </label>
                    <Select value={branchPlatform} onValueChange={setBranchPlatform}>
                      <SelectTrigger className={selectErr(!!branchErrors.platform, branchTouched)}>
                        <SelectValue placeholder="플랫폼 선택" />
                      </SelectTrigger>
                      <SelectContent className="!bg-[#1A1A1A] border-[#2A2A2A] text-white">
                        <SelectItem value="baemin-plus" className={selectClasses}>배민플러스</SelectItem>
                        <SelectItem value="coupang-eats-plus" className={selectClasses}>쿠팡이츠플러스</SelectItem>
                        <SelectItem value="both" className={selectClasses}>배민플러스 + 쿠팡이츠플러스</SelectItem>
                        <SelectItem value="other" className={selectClasses}>기타</SelectItem>
                      </SelectContent>
                    </Select>
                    {branchTouched && <FieldError error={branchErrors.platform} />}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[#9CA3AF] text-sm mb-1.5 block flex items-center gap-1.5">
                        <MapPin size={14} /> 시/도 <span className="text-[#E63946]">*</span>
                      </label>
                      <Select
                        value={branchCity}
                        onValueChange={(v) => {
                          setBranchCity(v);
                          setBranchDistrict("");
                        }}
                      >
                        <SelectTrigger className={selectErr(!!branchErrors.city, branchTouched)}>
                          <SelectValue placeholder="시/도 선택" />
                        </SelectTrigger>
                        <SelectContent className="!bg-[#1A1A1A] border-[#2A2A2A] text-white">
                          {cities.map((c) => (
                            <SelectItem key={c.name} value={c.name} className={selectClasses}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {branchTouched && <FieldError error={branchErrors.city} />}
                    </div>
                    <div>
                      <label className="text-[#9CA3AF] text-sm mb-1.5 block">
                        구/군 <span className="text-[#E63946]">*</span>
                      </label>
                      <Select
                        value={branchDistrict}
                        onValueChange={setBranchDistrict}
                        disabled={!branchCity}
                      >
                        <SelectTrigger className={selectErr(!!branchErrors.district, branchTouched)}>
                          <SelectValue placeholder="구/군 선택" />
                        </SelectTrigger>
                        <SelectContent className="!bg-[#1A1A1A] border-[#2A2A2A] text-white">
                          {branchCityData?.regions.map((r) => (
                            <SelectItem key={r.name} value={r.name} className={selectClasses}>
                              {r.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {branchTouched && <FieldError error={branchErrors.district} />}
                    </div>
                  </div>

                  <div>
                    <label className="text-[#9CA3AF] text-sm mb-1.5 block flex items-center gap-1.5">
                      <Banknote size={14} /> 건당 단가 <span className="text-[#E63946]">*</span>
                    </label>
                    <Input
                      placeholder="예: 4,200"
                      value={branchPay}
                      onChange={(e) => setBranchPay(e.target.value)}
                      className={inputErr(!!branchErrors.pay, branchTouched)}
                    />
                    {branchTouched && <FieldError error={branchErrors.pay} />}
                  </div>

                  <div>
                    <label className="text-[#9CA3AF] text-sm mb-1.5 block flex items-center gap-1.5">
                      <Gift size={14} /> 프로모션 / 보너스
                    </label>
                    <Input
                      placeholder="예: 가입 보너스 ₩200,000"
                      value={branchPromo}
                      onChange={(e) => setBranchPromo(e.target.value)}
                      className="bg-[#111111] border-[#2A2A2A] text-white rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="text-[#9CA3AF] text-sm mb-1.5 block">
                      정산 방식 <span className="text-[#E63946]">*</span>
                    </label>
                    <Select value={branchSettlement} onValueChange={setBranchSettlement}>
                      <SelectTrigger className={selectErr(!!branchErrors.settlement, branchTouched)}>
                        <SelectValue placeholder="정산 방식 선택" />
                      </SelectTrigger>
                      <SelectContent className="!bg-[#1A1A1A] border-[#2A2A2A] text-white">
                        <SelectItem value="nextday" className={selectClasses}>익일지급</SelectItem>
                        <SelectItem value="weekly" className={selectClasses}>주급</SelectItem>
                        <SelectItem value="nextday-or-weekly" className={selectClasses}>익일지급 or 주급</SelectItem>
                      </SelectContent>
                    </Select>
                    {branchTouched && <FieldError error={branchErrors.settlement} />}
                  </div>

                  <div>
                    <label className="text-[#9CA3AF] text-sm mb-1.5 block flex items-center gap-1.5">
                      <Wrench size={14} /> 오토바이 리스/렌탈
                    </label>
                    <Select value={branchMotorcycle} onValueChange={setBranchMotorcycle}>
                      <SelectTrigger className="bg-[#111111] border-[#2A2A2A] text-white rounded-xl">
                        <SelectValue placeholder="옵션 선택" />
                      </SelectTrigger>
                      <SelectContent className="!bg-[#1A1A1A] border-[#2A2A2A] text-white">
                        <SelectItem value="lease" className={selectClasses}>리스 제공</SelectItem>
                        <SelectItem value="rental" className={selectClasses}>렌탈 제공</SelectItem>
                        <SelectItem value="both" className={selectClasses}>리스 + 렌탈 모두 제공</SelectItem>
                        <SelectItem value="none" className={selectClasses}>미제공</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-[#9CA3AF] text-sm mb-1.5 block flex items-center gap-1.5">
                      <Clock size={14} /> 유형
                    </label>
                    <Input
                      placeholder="예: 프리, 전업, 주간, 야간 등 직접 입력"
                      value={branchWorkType}
                      onChange={(e) => setBranchWorkType(e.target.value)}
                      className="bg-[#111111] border-[#2A2A2A] text-white rounded-xl"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleBranchSubmit}
                  disabled={saving}
                  className="w-full mt-8 bg-[#E63946] hover:bg-[#FF4D5A] text-white font-bold rounded-xl py-6 text-base gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> 처리 중...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} /> 지사 등록 완료
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* 완료 */}
          {step === "done" && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} className="text-emerald-400" />
              </div>
              <h2 className="text-3xl font-bold mb-4">가입이 완료되었습니다!</h2>
              <p className="text-[#9CA3AF] text-lg mb-8 max-w-md mx-auto">
                SpeedGang Match에 오신 것을 환영합니다. 이제 플랫폼의 모든 기능을
                이용하실 수 있습니다.
              </p>
              {savedCompanyId && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-8 max-w-md mx-auto">
                  <p className="text-amber-400 text-sm font-medium">
                    💡 대시보드에서 추가 지사를 등록할 수 있습니다.
                  </p>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {savedCompanyId ? (
                  <Link to="/agency">
                    <Button className="bg-[#E63946] hover:bg-[#FF4D5A] text-white font-bold rounded-xl px-8 py-6 gap-2 w-full sm:w-auto">
                      <Building2 size={18} /> 대시보드로 이동
                    </Button>
                  </Link>
                ) : (
                  <Link to="/rider">
                    <Button className="bg-[#E63946] hover:bg-[#FF4D5A] text-white font-bold rounded-xl px-8 py-6 gap-2 w-full sm:w-auto">
                      <Bike size={18} /> 지사 찾아보기
                    </Button>
                  </Link>
                )}
                <Link to="/">
                  <Button
                    variant="outline"
                    className="!bg-transparent border-[#2A2A2A] text-white hover:border-[#E63946] hover:text-[#E63946] font-bold rounded-xl px-8 py-6 gap-2 w-full sm:w-auto"
                  >
                    홈으로 돌아가기
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}