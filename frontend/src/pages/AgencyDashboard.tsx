import { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Building2,
  Megaphone,
  BarChart3,
  ShieldCheck,
  Menu,
  X,
  MapPin,
  Star,
  Phone,
  Clock,
  Bike,
  User,
  MessageSquare,
  Handshake,
  Calculator,
  ExternalLink,
  Plus,
  Briefcase,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import RegionSelector from "@/components/RegionSelector";
import NotificationBell from "@/components/NotificationBell";
import MatchStatusView from "@/components/MatchStatusView";
import MatchModal from "@/components/MatchModal";
import Logo from "@/components/Logo";
import AddBranchModal from "@/components/AddBranchModal";
import { client } from "@/lib/api";
import { getAPIBaseURL } from "@/lib/config";
import { useAuth } from "@/contexts/AuthContext";

// 인증 헤더가 포함된 API 호출 헬퍼
const authFetch = async (path: string) => {
  const token = localStorage.getItem('access_token');
  const res = await fetch(`${getAPIBaseURL()}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};
import {
  agencyNotifications,
  MatchRecord,
} from "@/data/matchData";
import { useSEO } from "@/hooks/useSEO";

type TabView = "find" | "match-status" | "branches";

interface Company {
  id: number;
  company_name: string;
  business_number: string;
  representative: string;
  phone: string;
  email: string;
}

interface Branch {
  id: number;
  company_id: number;
  name: string;
  manager_name: string;
  phone: string;
  city: string;
  district: string;
  platform: string;
  pay_per_delivery: string;
  promotion: string;
  settlement_type: string;
  motorcycle_option: string;
  work_type: string;
  verified: boolean;
}

const sidebarItems = [
  { icon: LayoutDashboard, label: "라이더 찾기", view: "find" as TabView },
  { icon: Handshake, label: "매칭 현황", view: "match-status" as TabView },
  { icon: Building2, label: "내 지사 관리", view: "branches" as TabView },
];

const sidebarLinks = [
  { icon: ClipboardList, label: "채용 공고", href: "/agency/listings" },
  { icon: ShieldCheck, label: "인증 관리", href: "/agency/verification" },
  { icon: Megaphone, label: "프로모션", href: "/agency/promotions" },
  { icon: BarChart3, label: "분석", href: "/agency/analytics" },
];

const SETTLEMENT_URL = "https://sgnext.co.kr";

interface Rider {
  name: string;
  city: string;
  district: string;
  experience: string;
  motorcycle: boolean;
  availableTime: string;
  rating: number;
  deliveries: number;
  status: string;
}


export default function AgencyDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [activeView, setActiveView] = useState<TabView>("find");

  const [showMatchModal, setShowMatchModal] = useState(false);

  // #7 — 라이더 목록: 백엔드 API 연결
  const [riders, setRiders] = useState<Rider[]>([]);
  const [ridersLoading, setRidersLoading] = useState(false);

  // #8 — 매칭 데이터: 백엔드 API 연결
  const [matches, setMatches] = useState<MatchRecord[]>([]);

  const latestMatch = matches.find((m) => m.status === "matched");

  useSEO({
    title: "지사 대시보드 - 라이더 찾기",
    description: "내 지역의 구직 중인 배달 라이더를 찾고 매칭하세요.",
    url: "/agency",
    noindex: true,
  });

  // Company & branches state
  const [company, setCompany] = useState<Company | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showAddBranch, setShowAddBranch] = useState(false);
  const [editBranch, setEditBranch] = useState<Branch | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDeleteBranch = async (branchId: number, branchName: string) => {
    if (!confirm(`"${branchName}" 지사를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) return;
    setDeletingId(branchId);
    try {
      await client.entities.agency_profiles.delete({ id: branchId });
      await refreshBranches();
    } catch (err) {
      console.error('지사 삭제 실패:', err);
      alert('지사 삭제 중 오류가 발생했습니다.');
    } finally {
      setDeletingId(null);
    }
  };

  // #7 — 라이더 목록 불러오기
  useEffect(() => {
    const fetchRiders = async () => {
      try {
        setRidersLoading(true);
        const response = await client.entities.rider_profiles.queryAll({
          query: {},
          sort: '-created_at',
          limit: 100,
          skip: 0,
        });
        const items = response?.data?.items;
        if (items && items.length > 0) {
          const mapped: Rider[] = items.map((r: { name?: string; city?: string; district?: string; experience?: string; has_motorcycle?: boolean; rider_type?: string; status?: string }) => ({
            name: r.name || '',
            city: r.city || '',
            district: r.district || '',
            experience: r.experience || '미입력',
            motorcycle: !!r.has_motorcycle,
            availableTime: r.rider_type || '언제든지',
            rating: 4.5,
            deliveries: 0,
            status: r.status || '구직중',
          }));
          setRiders(mapped);
        }
      } catch (err) {
        console.error('라이더 목록 불러오기 실패:', err);
      } finally {
        setRidersLoading(false);
      }
    };
    fetchRiders();
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

  useEffect(() => {
    const dismissed = sessionStorage.getItem("agency-match-modal-dismissed");
    if (latestMatch && !dismissed) {
      const timer = setTimeout(() => setShowMatchModal(true), 800);
      return () => clearTimeout(timer);
    }
  }, [latestMatch]);

  // Fetch company and branches (fetch API 사용 — SDK는 Authorization 헤더 누락 문제)
  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoadingData(false);
        return;
      }
      try {
        setLoadingData(true);
        // 현재 유저의 회사 조회
        const companyData = await authFetch(
          `/api/v1/entities/companies?sort=-created_at&limit=1`
        );
        const companyItems = companyData?.items;
        if (companyItems && companyItems.length > 0) {
          const comp = companyItems[0] as Company;
          setCompany(comp);

          // 해당 회사의 지사 목록 조회
          const branchData = await authFetch(
            `/api/v1/entities/agency_profiles?query=${encodeURIComponent(JSON.stringify({ company_id: comp.id }))}&sort=-created_at&limit=50`
          );
          const branchItems = branchData?.items;
          if (branchItems) {
            setBranches(branchItems as Branch[]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch company data:", err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [user]);

  const handleCloseModal = () => {
    setShowMatchModal(false);
    sessionStorage.setItem("agency-match-modal-dismissed", "true");
  };

  const filteredRiders = riders.filter((r) => {
    if (selectedCity && selectedDistrict) {
      return r.city === selectedCity && r.district === selectedDistrict;
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

  const refreshBranches = async () => {
    if (!company) return;
    try {
      const branchData = await authFetch(
        `/api/v1/entities/agency_profiles?query=${encodeURIComponent(JSON.stringify({ company_id: company.id }))}&sort=-created_at&limit=50`
      );
      const branchItems = branchData?.items;
      if (branchItems) {
        setBranches(branchItems as Branch[]);
      }
    } catch (err) {
      console.error("Failed to refresh branches:", err);
    }
  };

  const matchedCount = useMemo(
    () => matches.filter((m) => m.status === "matched").length,
    [matches]
  );

  const settlementLabel = (type: string) => {
    const map: Record<string, string> = {
      nextday: "익일지급",
      weekly: "주급",
      "nextday-or-weekly": "익일/주급",
    };
    return map[type] || type || "-";
  };

  const motorcycleLabel = (opt: string) => {
    const map: Record<string, string> = {
      lease: "리스",
      rental: "렌탈",
      both: "리스+렌탈",
      none: "미제공",
    };
    return map[opt] || opt || "-";
  };

  const platformLabel = (p: string) => {
    const map: Record<string, string> = {
      "baemin-plus": "배민플러스",
      "coupang-eats-plus": "쿠팡이츠플러스",
      both: "배민+쿠팡",
      other: "기타",
    };
    return map[p] || p || "-";
  };

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
          <p className="text-[#6B7280] text-xs mt-2">
            {company ? (
              <span className="flex items-center gap-1">
                <Briefcase size={12} className="text-amber-400" />
                {company.company_name}
              </span>
            ) : (
              "지사 대시보드"
            )}
          </p>
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
              {item.view === "branches" && branches.length > 0 && (
                <span className="ml-auto bg-amber-500/20 text-amber-400 text-xs font-bold px-2 py-0.5 rounded-full">
                  {branches.length}
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

          <div className="border-t border-[#2A2A2A] my-3" />

          <a
            href="https://sgnext.co.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors bg-gradient-to-r from-[#E63946]/10 to-amber-500/10 text-amber-400 hover:from-[#E63946]/20 hover:to-amber-500/20 hover:text-amber-300 border border-amber-500/20 group relative"
          >
            <Calculator size={18} />
            <span className="flex-1">정산프로그램</span>
            <span className="relative flex items-center">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#E63946] opacity-75 animate-ping" />
              <span className="relative inline-flex items-center bg-[#E63946] text-white text-[9px] font-extrabold tracking-wider px-1.5 py-0.5 rounded-full shadow-lg shadow-[#E63946]/40">
                NEW
              </span>
            </span>
          </a>

          <a
            href={SETTLEMENT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-[#9CA3AF] hover:bg-[#1A1A1A] hover:text-white"
          >
            <ExternalLink size={18} />
            <span className="flex-1">정산 관리 (바로가기)</span>
          </a>
          <p className="px-4 text-[10px] text-[#6B7280] mt-1">
            라이더별 정산 · 리포트 · 급여 관리
          </p>
        </nav>
      </aside>

      <main className="flex-1 lg:ml-0 overflow-auto">
        <div className="p-6 lg:p-10 max-w-7xl mx-auto">
          <div className="mb-8 pl-10 lg:pl-0 flex items-start justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                {activeView === "find" ? (
                  <>
                    <span className="text-[#E63946]">라이더</span> 찾기
                  </>
                ) : activeView === "match-status" ? (
                  <>
                    <span className="text-[#E63946]">매칭</span> 현황
                  </>
                ) : (
                  <>
                    <span className="text-[#E63946]">내 지사</span> 관리
                  </>
                )}
              </h1>
              <p className="text-[#6B7280] mt-1">
                {activeView === "find"
                  ? "지역을 선택하면 해당 지역의 구직 중인 라이더를 확인할 수 있습니다."
                  : activeView === "match-status"
                  ? "지원한 라이더의 매칭 진행 상태를 관리하세요."
                  : "회사 소속 지사를 관리하고 새 지사를 추가하세요."}
              </p>
            </div>
            <NotificationBell notifications={agencyNotifications} />
          </div>

          {/* 라이더 찾기 */}
          {activeView === "find" && (
            <>
              <div className="bg-[#1A1A1A]/60 border border-amber-500/20 rounded-2xl p-5 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Users size={20} className="text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-amber-400">서비스 준비 중</p>
                    <p className="text-xs text-[#9CA3AF]">현재 라이더 등록을 받고 있습니다. 곧 라이더 목록이 업데이트됩니다.</p>
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
                      <Users size={18} className="text-[#E63946]" />
                      <h3 className="text-xl font-bold">{selectedDistrict} 라이더 목록</h3>
                      <span className="text-[#6B7280] text-sm ml-2">({filteredRiders.length}명)</span>
                    </div>
                  </div>

                  {filteredRiders.length === 0 ? (
                    <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-12 text-center">
                      <User size={48} className="text-[#2A2A2A] mx-auto mb-4" />
                      <h4 className="text-lg font-bold mb-2">등록된 라이더가 없습니다</h4>
                      <p className="text-[#6B7280] text-sm">해당 지역에 아직 구직 중인 라이더가 없습니다. 다른 지역을 선택해보세요.</p>
                      <Button onClick={handleRegionReset} className="mt-6 bg-[#E63946] hover:bg-[#FF4D5A] text-white font-bold rounded-xl">
                        다른 지역 선택
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                      {filteredRiders.map((r, i) => (
                        <div key={i} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6 hover:border-[#E63946]/50 transition-all duration-300 hover:-translate-y-1">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-[#E63946]/10 rounded-xl flex items-center justify-center">
                                <User size={22} className="text-[#E63946]" />
                              </div>
                              <div>
                                <h4 className="font-bold text-lg">{r.name}</h4>
                                <p className="text-[#6B7280] text-sm flex items-center gap-1 mt-0.5">
                                  <MapPin size={12} />
                                  {r.city} {r.district}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 bg-amber-500/10 text-amber-400 text-xs font-bold px-2.5 py-1 rounded-full">
                              <Star size={12} /> {r.rating}
                            </div>
                          </div>

                          <div className="space-y-2.5 mb-5 text-sm">
                            <div className="flex justify-between">
                              <span className="text-[#6B7280]">경력</span>
                              <span className="font-semibold">{r.experience}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#6B7280]">총 배달 건수</span>
                              <span className="font-semibold">{r.deliveries.toLocaleString()}건</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[#6B7280]">오토바이</span>
                              <span className={r.motorcycle ? "text-emerald-400" : "text-[#6B7280]"}>
                                {r.motorcycle ? "보유" : "미보유"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[#6B7280] flex items-center gap-1">
                                <Clock size={12} /> 가능 시간
                              </span>
                              <span className="text-sm">{r.availableTime}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-5">
                            <span className="text-xs font-medium px-2.5 py-1 rounded-full border bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                              {r.status}
                            </span>
                            {r.motorcycle && (
                              <span className="text-xs font-medium px-2.5 py-1 rounded-full border bg-blue-500/20 text-blue-400 border-blue-500/30 flex items-center gap-1">
                                <Bike size={10} /> 오토바이
                              </span>
                            )}
                            {r.deliveries >= 3000 && (
                              <span className="text-xs font-medium px-2.5 py-1 rounded-full border bg-purple-500/20 text-purple-400 border-purple-500/30">
                                베테랑
                              </span>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Button className="flex-1 bg-[#E63946] hover:bg-[#FF4D5A] text-white font-bold rounded-xl text-sm gap-1.5">
                              <MessageSquare size={14} /> 연락하기
                            </Button>
                            <Button variant="outline" className="!bg-transparent border-[#2A2A2A] text-white hover:border-[#E63946] rounded-xl px-3">
                              <Phone size={16} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!selectedCity && (
                <div className="bg-[#1A1A1A]/50 border border-[#2A2A2A] rounded-2xl p-12 text-center">
                  <div className="w-16 h-16 bg-[#E63946]/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <Users size={32} className="text-[#E63946]" />
                  </div>
                  <h4 className="text-xl font-bold mb-2">라이더 등록 진행 중</h4>
                  <p className="text-[#6B7280] max-w-md mx-auto">
                    현재 라이더 회원을 모집하고 있습니다. 곧 여러 지역의 라이더 목록이 업데이트될 예정입니다.
                    <br />
                    지역을 선택하시면 등록된 라이더를 확인할 수 있습니다.
                  </p>
                </div>
              )}
            </>
          )}

          {/* 매칭 현황 */}
          {activeView === "match-status" && (
            <MatchStatusView
              matches={matches}
              type="agency"
              onStatusChange={() => {
                // #14 — 수락/거절 후 매칭 데이터 재조회
                client.entities.applications.queryAll({
                  query: {}, sort: '-created_at', limit: 50, skip: 0,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                }).then((res: any) => {
                  const items = res?.data?.items;
                  if (items && items.length > 0) {
                    setMatches(items.map((a: { id: number; rider_name?: string; agency_name?: string; status?: string; created_at?: string }) => ({
                      id: String(a.id),
                      riderName: a.rider_name || '',
                      agencyName: a.agency_name || '',
                      city: '', district: '',
                      status: (a.status || 'pending') as import('@/data/matchData').MatchStatus,
                      appliedAt: a.created_at || '',
                      updatedAt: a.created_at || '',
                    })));
                  }
                }).catch((err: unknown) => console.error('매칭 재조회 실패:', err));
              }}
            />
          )}

          {/* 내 지사 관리 */}
          {activeView === "branches" && (
            <>
              {loadingData ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 size={32} className="animate-spin text-[#E63946]" />
                  <span className="ml-3 text-[#9CA3AF]">데이터를 불러오는 중...</span>
                </div>
              ) : !company ? (
                <div className="bg-[#1A1A1A]/50 border border-[#2A2A2A] rounded-2xl p-12 text-center">
                  <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <Briefcase size={32} className="text-amber-400" />
                  </div>
                  <h4 className="text-xl font-bold mb-2">등록된 회사가 없습니다</h4>
                  <p className="text-[#6B7280] max-w-md mx-auto mb-6">
                    먼저 회사를 등록해주세요. 하나의 회사로 여러 지사를 운영할 수 있습니다.
                  </p>
                  <Link to="/register">
                    <Button className="bg-[#E63946] hover:bg-[#FF4D5A] text-white font-bold rounded-xl px-8 py-5 gap-2">
                      <Building2 size={18} /> 회사 등록하기
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  {/* 회사 정보 카드 */}
                  <div className="bg-gradient-to-r from-[#1A1A1A] to-[#111111] border border-[#2A2A2A] rounded-2xl p-6 mb-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-amber-500/10 rounded-xl flex items-center justify-center">
                          <Briefcase size={28} className="text-amber-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{company.company_name}</h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-[#6B7280]">
                            <span>사업자번호: {company.business_number || "-"}</span>
                            <span>대표: {company.representative || "-"}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-[#E63946]">{branches.length}</p>
                        <p className="text-[#6B7280] text-sm">등록 지사</p>
                      </div>
                    </div>
                  </div>

                  {/* 지사 추가 버튼 */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Building2 size={18} className="text-[#E63946]" />
                      소속 지사 목록
                    </h3>
                    <Button
                      onClick={() => setShowAddBranch(true)}
                      className="bg-[#E63946] hover:bg-[#FF4D5A] text-white font-bold rounded-xl gap-2"
                    >
                      <Plus size={16} /> 지사 추가
                    </Button>
                  </div>

                  {/* 지사 목록 */}
                  {branches.length === 0 ? (
                    <div className="bg-[#1A1A1A]/50 border border-dashed border-[#2A2A2A] rounded-2xl p-12 text-center">
                      <Building2 size={48} className="text-[#2A2A2A] mx-auto mb-4" />
                      <h4 className="text-lg font-bold mb-2">아직 등록된 지사가 없습니다</h4>
                      <p className="text-[#6B7280] text-sm mb-6">
                        첫 번째 지사를 추가하여 라이더 모집을 시작하세요.
                      </p>
                      <Button
                        onClick={() => setShowAddBranch(true)}
                        className="bg-[#E63946] hover:bg-[#FF4D5A] text-white font-bold rounded-xl gap-2"
                      >
                        <Plus size={16} /> 첫 번째 지사 추가
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                      {branches.map((branch) => (
                        <div
                          key={branch.id}
                          className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6 hover:border-[#E63946]/50 transition-all duration-300"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <p className="text-xs text-amber-400 font-medium mb-1">
                                {company.company_name}
                              </p>
                              <h4 className="text-lg font-bold">{branch.name}</h4>
                              <p className="text-[#6B7280] text-sm flex items-center gap-1 mt-0.5">
                                <MapPin size={12} />
                                {branch.city} {branch.district}
                              </p>
                            </div>
                            {branch.verified ? (
                              <span className="text-xs font-medium px-2.5 py-1 rounded-full border bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                인증됨
                              </span>
                            ) : (
                              <span className="text-xs font-medium px-2.5 py-1 rounded-full border bg-amber-500/20 text-amber-400 border-amber-500/30">
                                검증 대기
                              </span>
                            )}
                          </div>

                          <div className="space-y-2 text-sm mb-4">
                            <div className="flex justify-between">
                              <span className="text-[#6B7280]">담당자</span>
                              <span>{branch.manager_name || "-"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#6B7280]">플랫폼</span>
                              <span>{platformLabel(branch.platform)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#6B7280]">건당 단가</span>
                              <span className="text-[#E63946] font-semibold">
                                {branch.pay_per_delivery ? `₩${branch.pay_per_delivery}` : "-"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#6B7280]">정산</span>
                              <span>{settlementLabel(branch.settlement_type)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#6B7280]">오토바이</span>
                              <span>{motorcycleLabel(branch.motorcycle_option)}</span>
                            </div>
                            {branch.promotion && (
                              <div className="flex justify-between">
                                <span className="text-[#6B7280]">프로모션</span>
                                <span className="text-amber-400 text-xs">{branch.promotion}</span>
                              </div>
                            )}
                          </div>

                          {/* #17 — 지사 작업 버튼 */}
                          <div className="flex gap-2 mt-4">
                            <Button
                              variant="outline"
                              className="flex-1 !bg-transparent border-[#2A2A2A] text-white hover:border-[#E63946] hover:text-[#E63946] rounded-xl text-sm gap-1.5"
                              onClick={() => navigate("/agency/listings")}
                            >
                              공고 등록
                            </Button>
                            <Button
                              variant="outline"
                              className="!bg-transparent border-[#2A2A2A] text-[#9CA3AF] hover:border-blue-400 hover:text-blue-400 rounded-xl px-3 gap-1"
                              onClick={() => setEditBranch(branch)}
                            >
                              <Pencil size={14} /> 수정
                            </Button>
                            <Button
                              variant="outline"
                              className="!bg-transparent border-[#2A2A2A] text-[#9CA3AF] hover:border-red-400 hover:text-red-400 rounded-xl px-3 gap-1"
                              onClick={() => handleDeleteBranch(branch.id, branch.name)}
                              disabled={deletingId === branch.id}
                            >
                              {deletingId === branch.id ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Trash2 size={14} />
                              )}
                              삭제
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </main>

      {showMatchModal && latestMatch && (
        <MatchModal match={latestMatch} type="agency" onClose={handleCloseModal} />
      )}

      {company && (
        <AddBranchModal
          isOpen={showAddBranch}
          onClose={() => setShowAddBranch(false)}
          companyId={company.id}
          companyName={company.company_name}
          onSuccess={refreshBranches}
        />
      )}

      {/* #17 — 지사 수정 모달 */}
      {company && editBranch && (
        <AddBranchModal
          isOpen={!!editBranch}
          onClose={() => setEditBranch(null)}
          companyId={company.id}
          companyName={company.company_name}
          onSuccess={() => { setEditBranch(null); refreshBranches(); }}
          existingBranch={editBranch}
        />
      )}
    </div>
  );
}