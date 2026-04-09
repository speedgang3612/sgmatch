import { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Building2,
  Heart,
  FileText,
  User,
  HelpCircle,
  Bike,
  Bookmark,
  Star,
  Menu,
  X,
  MapPin,
  Handshake,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Loader2,
  CheckCircle2,
  Sparkles,
  Bot,
  RefreshCw,
} from "lucide-react";
import RegionSelector from "@/components/RegionSelector";
import NotificationBell from "@/components/NotificationBell";
import MatchStatusView from "@/components/MatchStatusView";
import MatchModal from "@/components/MatchModal";
import Logo from "@/components/Logo";
import ReviewSection from "@/components/ReviewSection";
import { getAgencyStats, reviewTags } from "@/data/reviewData";
import {
  riderNotifications,
  MatchRecord,
} from "@/data/matchData";
import { client } from "@/lib/api";
import { getAPIBaseURL } from "@/lib/config";
import { useAuth } from "@/contexts/AuthContext";
import { useSEO } from "@/hooks/useSEO";

type TabView = "find" | "match-status";

const sidebarItems = [
  { icon: LayoutDashboard, label: "지사 찾기", view: "find" as TabView },
  { icon: Handshake, label: "매칭 현황", view: "match-status" as TabView },
];

const sidebarLinks = [
  { icon: Heart, label: "저장한 지사", href: "/rider/saved" },
  { icon: FileText, label: "지원 내역", href: "/rider/applications" },
  { icon: User, label: "프로필", href: "/rider/profile" },
  { icon: HelpCircle, label: "고객지원", href: "/rider/support" },
];

interface Agency {
  name: string;
  city: string;
  district: string;
  pay: string;
  promo: string;
  settlement: string;
  motorcycle: boolean;
  score: number;
  badges: string[];
}

const badgeColor: Record<string, string> = {
  신규: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  인증됨: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  추천: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "빠른 정산": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "오토바이 리스/렌탈": "bg-rose-500/20 text-rose-400 border-rose-500/30",
};

function AgencyCard({ agency, matchedNames }: { agency: Agency; matchedNames: string[] }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [bookmarked, setBookmarked] = useState(() => {
    return localStorage.getItem(`bookmark_${agency.name}`) === "true";
  });
  const stats = getAgencyStats(agency.name);
  const isMatched = matchedNames.includes(agency.name);

  // #14 — 지원하기 핸들러: 실제 API 연결
  const handleApply = async () => {
    if (!user) {
      navigate("/register");
      return;
    }
    if (applying) return;
    setApplying(true);
    try {
      await client.entities.applications.create({
        rider_name: user.name || user.email || "라이더",
        agency_name: agency.name,
        status: "pending",
        applied_at: new Date().toISOString(),
        city: agency.city,
        district: agency.district,
      });
      // 성공 피드백 (alert 대신 인라인 표시)
      setApplied(true);
    } catch (err) {
      console.error("지원 실패:", err);
      alert("지원 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setApplying(false);
    }
  };

  // 저장하기 핸들러
  const handleBookmark = () => {
    const next = !bookmarked;
    setBookmarked(next);
    localStorage.setItem(`bookmark_${agency.name}`, String(next));
  };

  return (
    <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6 hover:border-[#E63946]/50 transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-bold text-lg">{agency.name}</h4>
          <p className="text-[#6B7280] text-sm flex items-center gap-1 mt-0.5">
            <MapPin size={12} />
            {agency.city} {agency.district}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1 bg-blue-500/10 text-blue-400 text-xs font-bold px-2.5 py-1 rounded-full">
            <Star size={12} /> {agency.score}%
          </div>
          {stats && (
            <div className="flex items-center gap-1 bg-amber-500/10 text-amber-400 text-xs font-bold px-2 py-0.5 rounded-full">
              <Star size={10} className="fill-amber-400" /> {stats.avgRating}
              <span className="text-[#6B7280]">({stats.reviewCount})</span>
            </div>
          )}
        </div>
      </div>

      {/* 리뷰 기반 성향 태그 */}
      {stats && stats.topTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {stats.topTags.map((tagKey) => {
            const tag = reviewTags.find((t) => t.key === tagKey);
            if (!tag) return null;
            return (
              <span
                key={tagKey}
                className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${tag.color}`}
              >
                {tag.label}
              </span>
            );
          })}
        </div>
      )}

      <div className="space-y-2.5 mb-5 text-sm">
        <div className="flex justify-between">
          <span className="text-[#6B7280]">건당 단가</span>
          <span className="font-semibold">{agency.pay}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#6B7280]">프로모션</span>
          <span className="text-[#E63946] font-medium">{agency.promo}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#6B7280]">정산 방식</span>
          <span>{agency.settlement}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#6B7280]">오토바이</span>
          <span className={agency.motorcycle ? "text-emerald-400" : "text-[#6B7280]"}>
            {agency.motorcycle ? "제공" : "미제공"}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {agency.badges.map((b) => (
          <span
            key={b}
            className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
              badgeColor[b] || "bg-gray-500/20 text-gray-400 border-gray-500/30"
            }`}
          >
            {b}
          </span>
        ))}
      </div>

      <div className="flex gap-2 mb-2">
        {applied || isMatched ? (
          <div className="flex-1 flex items-center justify-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold rounded-xl text-sm py-2">
            <CheckCircle2 size={14} />
            {isMatched ? "매칭 완료" : "지원 완료"}
          </div>
        ) : (
          <Button
            className="flex-1 bg-[#E63946] hover:bg-[#FF4D5A] text-white font-bold rounded-xl text-sm"
            onClick={handleApply}
            disabled={applying}
          >
            {applying ? (
              <span className="flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" /> 접수 중...
              </span>
            ) : (
              "지원하기"
            )}
          </Button>
        )}
        <Button
          variant="outline"
          className={`!bg-transparent border-[#2A2A2A] hover:border-[#E63946] rounded-xl px-3 ${
            bookmarked ? "text-[#E63946] border-[#E63946]/50" : "text-white"
          }`}
          onClick={handleBookmark}
        >
          <Bookmark size={16} className={bookmarked ? "fill-[#E63946]" : ""} />
        </Button>
      </div>

      {/* 리뷰 토글 */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-1.5 text-xs text-[#6B7280] hover:text-white py-2 transition-colors"
      >
        <MessageSquare size={12} />
        리뷰 {stats ? `(${stats.reviewCount})` : "(0)"}
        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {expanded && (
        <ReviewSection agencyName={agency.name} canWrite={isMatched} />
      )}
    </div>
  );
}

export default function RiderDashboard() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [activeView, setActiveView] = useState<TabView>("find");

  // #6 — 지사 목록: 백엔드 API 연결
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [agenciesLoading, setAgenciesLoading] = useState(false);

  // #8 — 매칭 데이터: 백엔드 API 연결
  const [matches, setMatches] = useState<MatchRecord[]>([]);

  const [showMatchModal, setShowMatchModal] = useState(false);
  const latestMatch = matches.find((m) => m.status === "matched");

  // #6 — 지사 목록 불러오기
  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        setAgenciesLoading(true);
        const response = await client.entities.agency_profiles.queryAll({
          query: {},
          sort: '-created_at',
          limit: 100,
          skip: 0,
        });
        const items = response?.data?.items;
        if (items && items.length > 0) {
          const mapped: Agency[] = items.map((a: Agency & { pay_per_delivery?: string; promotion?: string; settlement_type?: string; motorcycle_option?: string; verified?: boolean }) => ({
            name: a.name || '',
            city: a.city || '',
            district: a.district || '',
            pay: a.pay_per_delivery || '미정',
            promo: a.promotion || '없음',
            settlement: a.settlement_type || '미정',
            motorcycle: !!(a.motorcycle_option && a.motorcycle_option !== '없음'),
            score: 85,
            badges: a.verified ? ['인증됨'] : [],
          }));
          setAgencies(mapped);
        }
      } catch (err) {
        console.error('지사 목록 불러오기 실패:', err);
      } finally {
        setAgenciesLoading(false);
      }
    };
    fetchAgencies();
  }, []);

  // #8 — 매칭 데이터 불러오기
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await client.entities.applications.queryAll({
          query: {},
          sort: '-created_at',
          limit: 50,
          skip: 0,
        });
        const items = response?.data?.items;
        if (items && items.length > 0) {
          const mapped: MatchRecord[] = items.map((a: { id: number; rider_name?: string; agency_name?: string; status?: string; created_at?: string }) => ({
            id: String(a.id),
            riderName: a.rider_name || '',
            agencyName: a.agency_name || '',
            city: '',
            district: '',
            status: (a.status as MatchRecord['status']) || 'pending',
            appliedAt: a.created_at || '',
            updatedAt: a.created_at || '',
          }));
          setMatches(mapped);
        }
      } catch (err) {
        console.error('매칭 데이터 불러오기 실패:', err);
      }
    };
    fetchMatches();
  }, []);

  // #8 — 매칭된 지사명 목록 (useMemo로 최적화)
  const matchedAgencyNames = useMemo(
    () => matches.filter((m) => m.status === "matched").map((m) => m.agencyName),
    [matches]
  );

  useSEO({
    title: "라이더 대시보드 - 지사 찾기",
    description: "내 지역의 배달 지사를 찾고 단가, 프로모션, 정산 방식을 비교하세요.",
    url: "/rider",
    noindex: true,
  });

  useEffect(() => {
    const dismissed = sessionStorage.getItem("rider-match-modal-dismissed");
    if (latestMatch && !dismissed) {
      const timer = setTimeout(() => setShowMatchModal(true), 800);
      return () => clearTimeout(timer);
    }
  }, [latestMatch]);
  // #19 — AI 매칭 추천 코로 상태
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // #19 — AI 매칭 추천 호출
  const handleAIRecommend = async () => {
    if (!selectedCity || !selectedDistrict) return;
    setAiLoading(true);
    setAiResult(null);
    setAiError(null);
    try {
      const prompt = [
        `라이더 매칭 AI 골대: ${selectedCity} ${selectedDistrict} 지역에서 \ubc30달 라이더를 찾고 있는 사람에게`,
        `편한고 실용적인 지사 선택 팁과 주의사항을 3가지 이내로 안내해주세요.`,
        `톤은 친근하고 말말하게. 한국어로. 200자 이내.`,
      ].join(" ");

      const res = await fetch(`${getAPIBaseURL()}/api/v1/aihub/gentxt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          model: "gpt-5-chat",
          messages: [{ role: "user", content: prompt }],
          stream: false,
        }),
      });

      if (res.status === 503) {
        setAiError("AI 기능을 사용하려면 관리자가 AI API 키를 설정해야 합니다.");
        return;
      }
      if (!res.ok) {
        throw new Error(`AI 응답 오류 (${res.status})`);
      }

      const data = await res.json();
      const content =
        data?.choices?.[0]?.message?.content ||
        data?.content ||
        data?.text ||
        JSON.stringify(data);
      setAiResult(content);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "AI 추천 중 오류가 발생했습니다.";
      setAiError(msg);
    } finally {
      setAiLoading(false);
    }
  };


  const handleCloseModal = () => {
    setShowMatchModal(false);
    sessionStorage.setItem("rider-match-modal-dismissed", "true");
  };

  const filteredAgencies = agencies.filter((a) => {
    if (selectedCity && selectedDistrict) {
      return a.city === selectedCity && a.district === selectedDistrict;
    }
    return false;
  });

  const handleRegionSelect = (city: string, district: string) => {
    setSelectedCity(city);
    setSelectedDistrict(district);
  };

  const handleRegionReset = () => {
    setSelectedCity("");
    setSelectedDistrict("");
  };

  const matchedCount = matches.filter((m) => m.status === "matched").length;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex">
      <button
        className="lg:hidden fixed top-4 left-4 z-50 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-2"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-[#111111] border-r border-[#2A2A2A] flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-6 border-b border-[#2A2A2A]">
          <Logo size="sm" />
          <p className="text-[#6B7280] text-xs mt-2">라이더 대시보드</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.view}
              onClick={() => {
                setActiveView(item.view);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeView === item.view
                  ? "bg-[#E63946]/10 text-[#E63946]"
                  : "text-[#9CA3AF] hover:bg-[#1A1A1A] hover:text-white"
              }`}
            >
              <item.icon size={18} />
              {item.label}
              {item.view === "match-status" && matchedCount > 0 && (
                <span className="ml-auto bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-full">
                  {matchedCount}
                </span>
              )}
            </button>
          ))}
          <div className="border-t border-[#2A2A2A] my-3" />
          {sidebarLinks.map((item) => (
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

      <main className="flex-1 lg:ml-0 overflow-auto">
        <div className="p-6 lg:p-10 max-w-7xl mx-auto">
          <div className="mb-8 pl-10 lg:pl-0 flex items-start justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                {activeView === "find" ? (
                  <>
                    <span className="text-[#E63946]">지사</span> 찾기
                  </>
                ) : (
                  <>
                    <span className="text-[#E63946]">매칭</span> 현황
                  </>
                )}
              </h1>
              <p className="text-[#6B7280] mt-1">
                {activeView === "find"
                  ? "지역을 선택하면 해당 지역의 모든 지사를 확인할 수 있습니다."
                  : "지원한 지사의 매칭 진행 상태를 확인하세요."}
              </p>
            </div>
            <NotificationBell notifications={riderNotifications} />
          </div>

          {activeView === "find" ? (
            <>
              <div className="bg-[#1A1A1A]/60 border border-amber-500/20 rounded-2xl p-5 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Building2 size={20} className="text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-amber-400">서비스 준비 중</p>
                    <p className="text-xs text-[#9CA3AF]">현재 지사 등록을 받고 있습니다. 곧 지사 목록이 업데이트됩니다.</p>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <RegionSelector
                  onSelect={handleRegionSelect}
                  selectedCity={selectedCity}
                  selectedDistrict={selectedDistrict}
                  onReset={handleRegionReset}
                />
              </div>

              {selectedCity && selectedDistrict && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin size={18} className="text-[#E63946]" />
                      <h3 className="text-xl font-bold">{selectedDistrict} 지사 목록</h3>
                      <span className="text-[#6B7280] text-sm ml-2">({filteredAgencies.length}개)</span>
                    </div>
                  </div>

                  {/* #19 — AI 매칭 추천 위젯 */}
                  <div className="mb-6 bg-gradient-to-r from-[#1A1A1A] to-[#111111] border border-purple-500/20 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-500/10 rounded-xl flex items-center justify-center">
                          <Bot size={16} className="text-purple-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-purple-300">AI 매칭 추천</p>
                          <p className="text-[10px] text-[#6B7280]">{selectedCity} {selectedDistrict} 맞춤 조언</p>
                        </div>
                      </div>
                      <Button
                        onClick={handleAIRecommend}
                        disabled={aiLoading}
                        className="bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs px-3 h-8 gap-1.5"
                      >
                        {aiLoading ? (
                          <><Loader2 size={12} className="animate-spin" /> 분석 중...</>
                        ) : (
                          <><Sparkles size={12} /> AI 추천 받기</>
                        )}
                      </Button>
                    </div>

                    {/* AI 결과 */}
                    {aiResult && (
                      <div className="bg-[#0D0D0D] border border-purple-500/10 rounded-xl p-4 text-sm text-[#D1D5DB] leading-relaxed animate-in fade-in duration-300">
                        <div className="flex items-start gap-2">
                          <Sparkles size={14} className="text-purple-400 mt-0.5 shrink-0" />
                          <p>{aiResult}</p>
                        </div>
                        <button
                          onClick={handleAIRecommend}
                          className="mt-3 flex items-center gap-1 text-[10px] text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          <RefreshCw size={10} /> 다시 추천받기
                        </button>
                      </div>
                    )}

                    {/* AI 에러 */}
                    {aiError && (
                      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-400 flex items-start gap-2">
                        <Bot size={14} className="shrink-0 mt-0.5" />
                        <span>{aiError}</span>
                      </div>
                    )}

                    {/* 초기 안내 */}
                    {!aiResult && !aiError && !aiLoading && (
                      <p className="text-xs text-[#4B5563] italic">
                        AI가 {selectedDistrict} 지역의 지사 선택 팁을 알려드립니다.
                      </p>
                    )}
                  </div>

                      {agenciesLoading ? (
                        <div className="flex items-center justify-center py-20">
                          <Loader2 size={32} className="animate-spin text-[#E63946]" />
                          <span className="ml-3 text-[#9CA3AF]">지사 목록을 불러오는 중...</span>
                        </div>
                      ) : filteredAgencies.length === 0 ? (
                    <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-12 text-center">
                      <Building2 size={48} className="text-[#2A2A2A] mx-auto mb-4" />
                      <h4 className="text-lg font-bold mb-2">등록된 지사가 없습니다</h4>
                      <p className="text-[#6B7280] text-sm">해당 지역에 아직 등록된 지사가 없습니다. 다른 지역을 선택해보세요.</p>
                      <Button onClick={handleRegionReset} className="mt-6 bg-[#E63946] hover:bg-[#FF4D5A] text-white font-bold rounded-xl">
                        다른 지역 선택
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                      {filteredAgencies.map((a, i) => (
                        <AgencyCard key={i} agency={a} matchedNames={matchedAgencyNames} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!selectedCity && (
                <div className="bg-[#1A1A1A]/50 border border-[#2A2A2A] rounded-2xl p-12 text-center">
                  <div className="w-16 h-16 bg-[#E63946]/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <Bike size={32} className="text-[#E63946]" />
                  </div>
                  <h4 className="text-xl font-bold mb-2">지사 등록 진행 중</h4>
                  <p className="text-[#6B7280] max-w-md mx-auto">
                    현재 지사 파트너를 모집하고 있습니다. 곧 여러 지역의 지사 목록이 업데이트될 예정입니다.
                    <br />
                    지역을 선택하시면 등록된 지사를 확인할 수 있습니다.
                  </p>
                </div>
              )}
            </>
          ) : (
            <MatchStatusView matches={matches} type="rider" />
          )}
        </div>
      </main>

      {showMatchModal && latestMatch && (
        <MatchModal match={latestMatch} type="rider" onClose={handleCloseModal} />
      )}
    </div>
  );
}