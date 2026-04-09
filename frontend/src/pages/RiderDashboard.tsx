import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
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
} from "lucide-react";
import RegionSelector from "@/components/RegionSelector";
import NotificationBell from "@/components/NotificationBell";
import MatchStatusView from "@/components/MatchStatusView";
import MatchModal from "@/components/MatchModal";
import Logo from "@/components/Logo";
import ReviewSection from "@/components/ReviewSection";
import { getAgencyStats, reviewTags } from "@/data/reviewData";
import {
  riderMatches,
  riderNotifications,
} from "@/data/matchData";
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

// 지사 목록 (실제 데이터는 백엔드에서 불러옴 - 현재 등록된 지사가 없으면 빈 배열)
const allAgencies: Agency[] = [];

const badgeColor: Record<string, string> = {
  신규: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  인증됨: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  추천: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "빠른 정산": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "오토바이 리스/렌탈": "bg-rose-500/20 text-rose-400 border-rose-500/30",
};

// 매칭된 지사 이름 목록
const matchedAgencyNames = riderMatches
  .filter((m) => m.status === "matched")
  .map((m) => m.agencyName);

function AgencyCard({ agency }: { agency: Agency }) {
  const [expanded, setExpanded] = useState(false);
  const stats = getAgencyStats(agency.name);
  const isMatched = matchedAgencyNames.includes(agency.name);

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
        <Button className="flex-1 bg-[#E63946] hover:bg-[#FF4D5A] text-white font-bold rounded-xl text-sm">
          지원하기
        </Button>
        <Button variant="outline" className="!bg-transparent border-[#2A2A2A] text-white hover:border-[#E63946] rounded-xl px-3">
          <Bookmark size={16} />
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

  const [showMatchModal, setShowMatchModal] = useState(false);
  const latestMatch = riderMatches.find((m) => m.status === "matched");

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

  const handleCloseModal = () => {
    setShowMatchModal(false);
    sessionStorage.setItem("rider-match-modal-dismissed", "true");
  };

  const filteredAgencies = allAgencies.filter((a) => {
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

  const matchedCount = riderMatches.filter((m) => m.status === "matched").length;

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
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <MapPin size={18} className="text-[#E63946]" />
                      <h3 className="text-xl font-bold">{selectedDistrict} 지사 목록</h3>
                      <span className="text-[#6B7280] text-sm ml-2">({filteredAgencies.length}개)</span>
                    </div>
                  </div>

                  {filteredAgencies.length === 0 ? (
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
                        <AgencyCard key={i} agency={a} />
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
            <MatchStatusView matches={riderMatches} type="rider" />
          )}
        </div>
      </main>

      {showMatchModal && latestMatch && (
        <MatchModal match={latestMatch} type="rider" onClose={handleCloseModal} />
      )}
    </div>
  );
}