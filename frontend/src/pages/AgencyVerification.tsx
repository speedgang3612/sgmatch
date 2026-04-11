import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
  Zap,
  LayoutDashboard,
  ClipboardList,
  Users,
  Building2,
  Megaphone,
  BarChart3,
  ShieldCheck,
  Menu,
  X,
  Upload,
  FileText,
  CheckCircle,
  Circle,
  Star,
  AlertCircle,
  TrendingUp,
  Clock,
  Award,
  File,
  Trash2,
} from "lucide-react";

const sidebarItems = [
  { icon: LayoutDashboard, label: "대시보드", href: "/agency" },
  { icon: ClipboardList, label: "채용 공고", href: "/agency/listings" },
  { icon: Users, label: "라이더 지원", href: "/agency/applications" },
  { icon: Building2, label: "지사 프로필", href: "/agency/profile" },
  { icon: ShieldCheck, label: "인증 관리", href: "/agency/verification" },
  { icon: Megaphone, label: "프로모션", href: "/agency/promotions" },
  { icon: BarChart3, label: "분석", href: "/agency/analytics" },
];

interface UploadedFile {
  name: string;
  size: string;
  status: "uploaded" | "pending" | "approved" | "rejected";
}

const sampleReviews = [
  { rider: "김○○", rating: 5, comment: "정산이 정확하고 빠릅니다. 추천합니다!", date: "2026-03-10" },
  { rider: "이○○", rating: 4, comment: "오토바이 리스/렌탈 조건이 좋고 담당자가 친절합니다.", date: "2026-03-08" },
  { rider: "박○○", rating: 5, comment: "프로모션 약속을 잘 지켜줍니다.", date: "2026-03-05" },
  { rider: "최○○", rating: 4, comment: "전반적으로 만족스러운 지사입니다.", date: "2026-03-01" },
  { rider: "정○○", rating: 3, comment: "정산은 좋은데 배차가 가끔 늦습니다.", date: "2026-02-25" },
];

export default function AgencyVerification() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // 1단계 상태
  const [bizLicense, setBizLicense] = useState<UploadedFile | null>(null);
  const [idCard, setIdCard] = useState<UploadedFile | null>(null);
  const [bizAddress, setBizAddress] = useState("");

  // 2단계 상태
  const [platformContract, setPlatformContract] = useState<UploadedFile | null>(null);
  const [insuranceDoc, setInsuranceDoc] = useState<UploadedFile | null>(null);
  const [leaseContract, setLeaseContract] = useState<UploadedFile | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [hasMotorcycleSupport, setHasMotorcycleSupport] = useState("");

  // 인증 상태 — localStorage에 영구 저장하여 새로고침해도 유지
  const [step1Submitted, setStep1Submitted] = useState(
    () => localStorage.getItem('agency_step1_submitted') === 'true'
  );
  const [step2Submitted, setStep2Submitted] = useState(
    () => localStorage.getItem('agency_step2_submitted') === 'true'
  );

  const submitStep1 = () => {
    setStep1Submitted(true);
    localStorage.setItem('agency_step1_submitted', 'true');
  };
  const submitStep2 = () => {
    setStep2Submitted(true);
    localStorage.setItem('agency_step2_submitted', 'true');
  };

  const simulateUpload = (
    setter: React.Dispatch<React.SetStateAction<UploadedFile | null>>,
    fileName: string
  ) => {
    setter({
      name: fileName,
      size: `${(Math.random() * 5 + 0.5).toFixed(1)}MB`,
      status: "uploaded",
    });
  };

  const steps = [
    { num: 1, label: "기본 서류 인증", icon: FileText },
    { num: 2, label: "운영 실태 확인", icon: Building2 },
    { num: 3, label: "라이더 평가", icon: Star },
  ];

  const getStepStatus = (stepNum: number) => {
    if (stepNum === 1 && step1Submitted) return "completed";
    if (stepNum === 2 && step2Submitted) return "completed";
    if (stepNum === 3 && step1Submitted && step2Submitted) return "active";
    if (stepNum === currentStep) return "active";
    if (stepNum < currentStep) return "completed";
    return "pending";
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex">
      {/* 모바일 사이드바 토글 */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-2"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* 사이드바 */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-[#111111] border-r border-[#2A2A2A] flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-6 border-b border-[#2A2A2A]">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#E63946] rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold">
              SpeedGang<span className="text-[#E63946]"> Match</span>
            </span>
          </Link>
          <p className="text-[#6B7280] text-xs mt-2">지사 대시보드</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                location.pathname === item.href
                  ? "bg-[#E63946]/10 text-[#E63946]"
                  : "text-[#9CA3AF] hover:bg-[#1A1A1A] hover:text-white"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 lg:ml-0 overflow-auto">
        <div className="p-6 lg:p-10 max-w-5xl mx-auto">
          {/* 헤더 */}
          <div className="mb-8 pl-10 lg:pl-0">
            <h1 className="text-2xl sm:text-3xl font-bold">
              지사 <span className="text-[#E63946]">인증</span>
            </h1>
            <p className="text-[#6B7280] mt-1">
              3단계 인증을 완료하면 라이더에게 신뢰할 수 있는 지사로 표시됩니다.
            </p>
          </div>

          {/* 인증 등급 배지 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {[
              {
                label: "신규",
                color: "amber",
                condition: "가입 완료",
                achieved: true,
                icon: Circle,
              },
              {
                label: "인증됨",
                color: "emerald",
                condition: "1단계 + 2단계 완료",
                achieved: step1Submitted && step2Submitted,
                icon: CheckCircle,
              },
              {
                label: "추천",
                color: "blue",
                condition: "인증 + 평점 4.0↑ + 정산 이행률 95%↑",
                achieved: false,
                icon: Award,
              },
            ].map((badge, i) => (
              <div
                key={i}
                className={`bg-[#1A1A1A] border rounded-2xl p-5 transition-all ${
                  badge.achieved
                    ? `border-${badge.color}-500/50`
                    : "border-[#2A2A2A]"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      badge.achieved
                        ? `bg-${badge.color}-500/20`
                        : "bg-[#2A2A2A]"
                    }`}
                  >
                    <badge.icon
                      size={20}
                      className={
                        badge.achieved
                          ? badge.color === "amber"
                            ? "text-amber-400"
                            : badge.color === "emerald"
                            ? "text-emerald-400"
                            : "text-blue-400"
                          : "text-[#6B7280]"
                      }
                    />
                  </div>
                  <div>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                        badge.achieved
                          ? badge.color === "amber"
                            ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                            : badge.color === "emerald"
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                          : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                      }`}
                    >
                      {badge.label}
                    </span>
                  </div>
                </div>
                <p className="text-[#6B7280] text-xs">{badge.condition}</p>
                {badge.achieved && (
                  <p className="text-emerald-400 text-xs mt-2 flex items-center gap-1">
                    <CheckCircle size={12} /> 달성 완료
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* 스텝 인디케이터 */}
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-2">
              {steps.map((step, i) => {
                const status = getStepStatus(step.num);
                return (
                  <div key={step.num} className="flex items-center flex-1">
                    <button
                      onClick={() => setCurrentStep(step.num)}
                      className="flex flex-col items-center gap-2 flex-1 group"
                    >
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                          status === "completed"
                            ? "bg-emerald-500/20"
                            : status === "active"
                            ? "bg-[#E63946]/20"
                            : "bg-[#2A2A2A]"
                        }`}
                      >
                        {status === "completed" ? (
                          <CheckCircle size={24} className="text-emerald-400" />
                        ) : (
                          <step.icon
                            size={24}
                            className={
                              status === "active"
                                ? "text-[#E63946]"
                                : "text-[#6B7280]"
                            }
                          />
                        )}
                      </div>
                      <div className="text-center">
                        <p
                          className={`text-xs font-medium ${
                            status === "active"
                              ? "text-[#E63946]"
                              : status === "completed"
                              ? "text-emerald-400"
                              : "text-[#6B7280]"
                          }`}
                        >
                          {step.num}단계
                        </p>
                        <p
                          className={`text-xs mt-0.5 hidden sm:block ${
                            status === "active"
                              ? "text-white"
                              : "text-[#6B7280]"
                          }`}
                        >
                          {step.label}
                        </p>
                      </div>
                    </button>
                    {i < steps.length - 1 && (
                      <div
                        className={`h-0.5 flex-1 mx-2 rounded ${
                          getStepStatus(step.num) === "completed"
                            ? "bg-emerald-500/50"
                            : "bg-[#2A2A2A]"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 1단계: 기본 서류 인증 */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#E63946]/10 rounded-xl flex items-center justify-center">
                    <FileText size={20} className="text-[#E63946]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">1단계: 기본 서류 인증</h3>
                    <p className="text-[#6B7280] text-xs">
                      사업자등록증, 대표자 신분증, 사업장 주소를 확인합니다
                    </p>
                  </div>
                </div>

                {step1Submitted ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 text-center">
                    <CheckCircle size={40} className="text-emerald-400 mx-auto mb-3" />
                    <h4 className="font-bold text-emerald-400 mb-1">1단계 제출 완료</h4>
                    <p className="text-[#9CA3AF] text-sm">
                      관리자 검토 중입니다. 영업일 기준 1~2일 내에 결과를 안내드립니다.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* 사업자등록증 */}
                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">
                        사업자등록증 <span className="text-[#E63946]">*</span>
                      </label>
                      {bizLicense ? (
                        <div className="flex items-center justify-between bg-[#111111] border border-[#2A2A2A] rounded-xl p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                              <File size={18} className="text-emerald-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{bizLicense.name}</p>
                              <p className="text-[#6B7280] text-xs">{bizLicense.size}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setBizLicense(null)}
                            className="text-[#6B7280] hover:text-red-400 p-1.5 rounded-lg hover:bg-[#2A2A2A] transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            simulateUpload(setBizLicense, "사업자등록증_은평지사.pdf")
                          }
                          className="w-full border-2 border-dashed border-[#2A2A2A] hover:border-[#E63946]/50 rounded-xl p-8 text-center transition-colors group"
                        >
                          <Upload
                            size={32}
                            className="mx-auto mb-3 text-[#6B7280] group-hover:text-[#E63946]"
                          />
                          <p className="text-[#9CA3AF] text-sm mb-1">
                            클릭하여 파일을 업로드하세요
                          </p>
                          <p className="text-[#6B7280] text-xs">
                            PDF, JPG, PNG (최대 10MB)
                          </p>
                        </button>
                      )}
                    </div>

                    {/* 대표자 신분증 */}
                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">
                        대표자 신분증 <span className="text-[#E63946]">*</span>
                      </label>
                      {idCard ? (
                        <div className="flex items-center justify-between bg-[#111111] border border-[#2A2A2A] rounded-xl p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                              <File size={18} className="text-emerald-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{idCard.name}</p>
                              <p className="text-[#6B7280] text-xs">{idCard.size}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setIdCard(null)}
                            className="text-[#6B7280] hover:text-red-400 p-1.5 rounded-lg hover:bg-[#2A2A2A] transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            simulateUpload(setIdCard, "대표자_신분증.jpg")
                          }
                          className="w-full border-2 border-dashed border-[#2A2A2A] hover:border-[#E63946]/50 rounded-xl p-8 text-center transition-colors group"
                        >
                          <Upload
                            size={32}
                            className="mx-auto mb-3 text-[#6B7280] group-hover:text-[#E63946]"
                          />
                          <p className="text-[#9CA3AF] text-sm mb-1">
                            클릭하여 파일을 업로드하세요
                          </p>
                          <p className="text-[#6B7280] text-xs">
                            PDF, JPG, PNG (최대 10MB)
                          </p>
                        </button>
                      )}
                    </div>

                    {/* 사업장 주소 */}
                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">
                        사업장 주소 <span className="text-[#E63946]">*</span>
                      </label>
                      <Input
                        value={bizAddress}
                        onChange={(e) => setBizAddress(e.target.value)}
                        placeholder="예: 서울특별시 은평구 진관동 123-45"
                        className="bg-[#111111] border-[#2A2A2A] text-white rounded-xl h-12"
                      />
                      <p className="text-[#6B7280] text-xs mt-2">
                        실제 운영 중인 사업장 주소를 입력해주세요. 현장 확인이 진행될 수 있습니다.
                      </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button
                        onClick={() => {
                          submitStep1();
                        }}
                        disabled={!bizLicense || !idCard || !bizAddress}
                        className="bg-[#E63946] hover:bg-[#FF4D5A] text-white font-bold rounded-xl px-8 py-6 text-base disabled:opacity-50"
                      >
                        1단계 제출하기
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {!step1Submitted && (
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={18} className="text-amber-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-amber-400 text-sm font-medium mb-1">안내사항</p>
                      <ul className="text-[#9CA3AF] text-xs space-y-1">
                        <li>• 모든 서류는 최근 3개월 이내 발급본이어야 합니다</li>
                        <li>• 신분증의 주민등록번호 뒷자리는 가려서 제출해주세요</li>
                        <li>• 제출 후 영업일 기준 1~2일 내에 검토 결과를 안내드립니다</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2단계: 운영 실태 확인 */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#E63946]/10 rounded-xl flex items-center justify-center">
                    <Building2 size={20} className="text-[#E63946]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">2단계: 운영 실태 확인</h3>
                    <p className="text-[#6B7280] text-xs">
                      배달 플랫폼 계약서, 보험 증빙, 오토바이 계약서를 확인합니다
                    </p>
                  </div>
                </div>

                {!step1Submitted ? (
                  <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-8 text-center">
                    <Clock size={40} className="text-[#6B7280] mx-auto mb-3" />
                    <h4 className="font-bold text-[#9CA3AF] mb-1">1단계를 먼저 완료해주세요</h4>
                    <p className="text-[#6B7280] text-sm">
                      기본 서류 인증이 승인된 후 2단계를 진행할 수 있습니다.
                    </p>
                    <Button
                      onClick={() => setCurrentStep(1)}
                      className="mt-4 bg-[#E63946] hover:bg-[#FF4D5A] text-white font-bold rounded-xl"
                    >
                      1단계로 이동
                    </Button>
                  </div>
                ) : step2Submitted ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 text-center">
                    <CheckCircle size={40} className="text-emerald-400 mx-auto mb-3" />
                    <h4 className="font-bold text-emerald-400 mb-1">2단계 제출 완료</h4>
                    <p className="text-[#9CA3AF] text-sm">
                      관리자 검토 중입니다. 승인 시 &quot;인증됨&quot; 배지가 부여됩니다.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* 배달 플랫폼 계약서 */}
                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">
                        배달 플랫폼 계약서 <span className="text-[#E63946]">*</span>
                      </label>
                      <div className="mb-3">
                        <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                          <SelectTrigger className="bg-[#111111] border-[#2A2A2A] text-white rounded-xl h-12">
                            <SelectValue placeholder="플랫폼 선택" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                            <SelectItem value="baemin">배달의민족</SelectItem>
                            <SelectItem value="coupang">쿠팡이츠</SelectItem>
                            <SelectItem value="yogiyo">요기요</SelectItem>
                            <SelectItem value="barogo">바로고</SelectItem>
                            <SelectItem value="other">기타</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {platformContract ? (
                        <div className="flex items-center justify-between bg-[#111111] border border-[#2A2A2A] rounded-xl p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                              <File size={18} className="text-emerald-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{platformContract.name}</p>
                              <p className="text-[#6B7280] text-xs">{platformContract.size}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setPlatformContract(null)}
                            className="text-[#6B7280] hover:text-red-400 p-1.5 rounded-lg hover:bg-[#2A2A2A] transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            simulateUpload(setPlatformContract, "배달플랫폼_계약서.pdf")
                          }
                          className="w-full border-2 border-dashed border-[#2A2A2A] hover:border-[#E63946]/50 rounded-xl p-8 text-center transition-colors group"
                        >
                          <Upload
                            size={32}
                            className="mx-auto mb-3 text-[#6B7280] group-hover:text-[#E63946]"
                          />
                          <p className="text-[#9CA3AF] text-sm mb-1">
                            클릭하여 계약서를 업로드하세요
                          </p>
                          <p className="text-[#6B7280] text-xs">
                            PDF, JPG, PNG (최대 10MB)
                          </p>
                        </button>
                      )}
                    </div>

                    {/* 라이더 보험 가입 증빙 */}
                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">
                        라이더 보험 가입 증빙 <span className="text-[#E63946]">*</span>
                      </label>
                      <p className="text-[#6B7280] text-xs mb-3">
                        산재보험, 고용보험 등 라이더 보호를 위한 보험 가입 증빙서류
                      </p>
                      {insuranceDoc ? (
                        <div className="flex items-center justify-between bg-[#111111] border border-[#2A2A2A] rounded-xl p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                              <File size={18} className="text-emerald-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{insuranceDoc.name}</p>
                              <p className="text-[#6B7280] text-xs">{insuranceDoc.size}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setInsuranceDoc(null)}
                            className="text-[#6B7280] hover:text-red-400 p-1.5 rounded-lg hover:bg-[#2A2A2A] transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            simulateUpload(setInsuranceDoc, "보험가입_증빙서류.pdf")
                          }
                          className="w-full border-2 border-dashed border-[#2A2A2A] hover:border-[#E63946]/50 rounded-xl p-8 text-center transition-colors group"
                        >
                          <Upload
                            size={32}
                            className="mx-auto mb-3 text-[#6B7280] group-hover:text-[#E63946]"
                          />
                          <p className="text-[#9CA3AF] text-sm mb-1">
                            클릭하여 보험 증빙을 업로드하세요
                          </p>
                          <p className="text-[#6B7280] text-xs">
                            PDF, JPG, PNG (최대 10MB)
                          </p>
                        </button>
                      )}
                    </div>

                    {/* 오토바이 리스/렌트 계약서 */}
                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">
                        오토바이 리스/렌트 계약서
                      </label>
                      <div className="mb-3">
                        <Select value={hasMotorcycleSupport} onValueChange={setHasMotorcycleSupport}>
                          <SelectTrigger className="bg-[#111111] border-[#2A2A2A] text-white rounded-xl h-12">
                            <SelectValue placeholder="오토바이 리스/렌탈 여부" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                            <SelectItem value="lease">리스</SelectItem>
                            <SelectItem value="rental">렌탈</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {(hasMotorcycleSupport === "lease" || hasMotorcycleSupport === "rental") && (
                        <>
                          {leaseContract ? (
                            <div className="flex items-center justify-between bg-[#111111] border border-[#2A2A2A] rounded-xl p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                                  <File size={18} className="text-emerald-400" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{leaseContract.name}</p>
                                  <p className="text-[#6B7280] text-xs">{leaseContract.size}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => setLeaseContract(null)}
                                className="text-[#6B7280] hover:text-red-400 p-1.5 rounded-lg hover:bg-[#2A2A2A] transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() =>
                                simulateUpload(setLeaseContract, "오토바이_리스계약서.pdf")
                              }
                              className="w-full border-2 border-dashed border-[#2A2A2A] hover:border-[#E63946]/50 rounded-xl p-8 text-center transition-colors group"
                            >
                              <Upload
                                size={32}
                                className="mx-auto mb-3 text-[#6B7280] group-hover:text-[#E63946]"
                              />
                              <p className="text-[#9CA3AF] text-sm mb-1">
                                클릭하여 리스/렌트 계약서를 업로드하세요
                              </p>
                              <p className="text-[#6B7280] text-xs">
                                PDF, JPG, PNG (최대 10MB)
                              </p>
                            </button>
                          )}
                        </>
                      )}
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button
                        onClick={() => submitStep2()}
                        disabled={!platformContract || !insuranceDoc || !selectedPlatform}
                        className="bg-[#E63946] hover:bg-[#FF4D5A] text-white font-bold rounded-xl px-8 py-6 text-base disabled:opacity-50"
                      >
                        2단계 제출하기
                      </Button>
                      <Button
                        onClick={() => setCurrentStep(1)}
                        variant="outline"
                        className="!bg-transparent border-[#2A2A2A] text-[#9CA3AF] hover:text-white rounded-xl px-6 py-6"
                      >
                        이전 단계
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3단계: 라이더 평가 기반 인증 */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#E63946]/10 rounded-xl flex items-center justify-center">
                    <Star size={20} className="text-[#E63946]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">3단계: 라이더 평가 기반 인증</h3>
                    <p className="text-[#6B7280] text-xs">
                      라이더 리뷰, 정산 이행률, 프로모션 이행률을 기반으로 &quot;추천&quot; 등급이 부여됩니다
                    </p>
                  </div>
                </div>

                {!(step1Submitted && step2Submitted) ? (
                  <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-8 text-center">
                    <Clock size={40} className="text-[#6B7280] mx-auto mb-3" />
                    <h4 className="font-bold text-[#9CA3AF] mb-1">
                      1단계와 2단계를 먼저 완료해주세요
                    </h4>
                    <p className="text-[#6B7280] text-sm">
                      기본 인증이 완료된 후 라이더 평가 데이터가 수집됩니다.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* 종합 점수 */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-5 text-center">
                        <div className="flex items-center justify-center gap-1 mb-2">
                          {[1, 2, 3, 4].map((s) => (
                            <Star
                              key={s}
                              size={18}
                              className="text-amber-400 fill-amber-400"
                            />
                          ))}
                          <Star size={18} className="text-amber-400/30" />
                        </div>
                        <p className="text-3xl font-bold text-amber-400">4.2</p>
                        <p className="text-[#6B7280] text-xs mt-1">
                          평균 평점 (5명 리뷰)
                        </p>
                      </div>
                      <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-5 text-center">
                        <TrendingUp size={24} className="text-emerald-400 mx-auto mb-2" />
                        <p className="text-3xl font-bold text-emerald-400">97%</p>
                        <p className="text-[#6B7280] text-xs mt-1">정산 이행률</p>
                      </div>
                      <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-5 text-center">
                        <Award size={24} className="text-blue-400 mx-auto mb-2" />
                        <p className="text-3xl font-bold text-blue-400">95%</p>
                        <p className="text-[#6B7280] text-xs mt-1">프로모션 이행률</p>
                      </div>
                    </div>

                    {/* 정산 이행률 상세 */}
                    <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-5">
                      <h4 className="font-bold mb-4">정산 이행률 상세</h4>
                      <div className="space-y-3">
                        {[
                          { month: "2026년 3월", rate: 100, total: 45, onTime: 45 },
                          { month: "2026년 2월", rate: 96, total: 52, onTime: 50 },
                          { month: "2026년 1월", rate: 94, total: 48, onTime: 45 },
                        ].map((item, i) => (
                          <div key={i}>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-sm text-[#9CA3AF]">{item.month}</span>
                              <span className="text-sm font-medium">
                                {item.onTime}/{item.total}건 ({item.rate}%)
                              </span>
                            </div>
                            <div className="w-full h-2.5 bg-[#2A2A2A] rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  item.rate >= 95
                                    ? "bg-emerald-500"
                                    : item.rate >= 80
                                    ? "bg-amber-500"
                                    : "bg-red-500"
                                }`}
                                style={{ width: `${item.rate}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 프로모션 이행률 상세 */}
                    <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-5">
                      <h4 className="font-bold mb-4">프로모션 이행률 상세</h4>
                      <div className="space-y-3">
                        {[
                          {
                            promo: "가입 보너스 ₩200,000",
                            promised: 10,
                            fulfilled: 10,
                            rate: 100,
                          },
                          {
                            promo: "첫 달 인센티브 ₩150,000",
                            promised: 8,
                            fulfilled: 7,
                            rate: 88,
                          },
                          {
                            promo: "건당 추가 수당 ₩500",
                            promised: 45,
                            fulfilled: 44,
                            rate: 98,
                          },
                        ].map((item, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between bg-[#0A0A0A] rounded-lg p-3"
                          >
                            <div>
                              <p className="text-sm font-medium">{item.promo}</p>
                              <p className="text-[#6B7280] text-xs">
                                약속 {item.promised}건 중 {item.fulfilled}건 이행
                              </p>
                            </div>
                            <span
                              className={`text-sm font-bold ${
                                item.rate >= 95
                                  ? "text-emerald-400"
                                  : item.rate >= 80
                                  ? "text-amber-400"
                                  : "text-red-400"
                              }`}
                            >
                              {item.rate}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 라이더 리뷰 */}
                    <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-5">
                      <h4 className="font-bold mb-4">라이더 리뷰</h4>
                      <div className="space-y-4">
                        {sampleReviews.map((review, i) => (
                          <div
                            key={i}
                            className="bg-[#0A0A0A] rounded-xl p-4 border border-[#2A2A2A]/50"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-[#E63946]/10 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-bold text-[#E63946]">
                                    {review.rider.charAt(0)}
                                  </span>
                                </div>
                                <span className="text-sm font-medium">{review.rider}</span>
                              </div>
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }).map((_, s) => (
                                  <Star
                                    key={s}
                                    size={12}
                                    className={
                                      s < review.rating
                                        ? "text-amber-400 fill-amber-400"
                                        : "text-[#2A2A2A]"
                                    }
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-[#9CA3AF] text-sm">{review.comment}</p>
                            <p className="text-[#6B7280] text-xs mt-2">{review.date}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 추천 등급 달성 조건 */}
                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-5">
                      <div className="flex items-start gap-3">
                        <Award size={20} className="text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-blue-400 font-bold mb-2">
                            &quot;추천&quot; 등급 달성 조건
                          </p>
                          <div className="space-y-2">
                            {[
                              {
                                label: "평균 평점 4.0 이상",
                                current: "4.2",
                                met: true,
                              },
                              {
                                label: "정산 이행률 95% 이상",
                                current: "97%",
                                met: true,
                              },
                              {
                                label: "프로모션 이행률 90% 이상",
                                current: "95%",
                                met: true,
                              },
                              {
                                label: "최소 5건 이상 리뷰",
                                current: "5건",
                                met: true,
                              },
                            ].map((cond, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <CheckCircle
                                  size={14}
                                  className={
                                    cond.met ? "text-emerald-400" : "text-[#6B7280]"
                                  }
                                />
                                <span className="text-sm text-[#9CA3AF]">
                                  {cond.label}:{" "}
                                  <span
                                    className={
                                      cond.met
                                        ? "text-emerald-400 font-medium"
                                        : "text-[#6B7280]"
                                    }
                                  >
                                    현재 {cond.current}
                                  </span>
                                </span>
                              </div>
                            ))}
                          </div>
                          <p className="text-emerald-400 text-sm font-bold mt-3">
                            ✅ 모든 조건 충족! &quot;추천&quot; 등급이 부여되었습니다.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setCurrentStep(2)}
                  variant="outline"
                  className="!bg-transparent border-[#2A2A2A] text-[#9CA3AF] hover:text-white rounded-xl px-6 py-6"
                >
                  이전 단계
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}