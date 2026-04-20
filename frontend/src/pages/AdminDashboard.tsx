import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { client } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Zap,
  LayoutDashboard,
  Users,
  Building2,
  ShieldCheck,
  BarChart3,
  Settings,
  Menu,
  X,
  CheckCircle,
  XCircle,
  Bike,
  RefreshCw,
  Loader2,
} from "lucide-react";

// ---------- Types ----------
interface RiderProfile {
  id: number;
  user_id: string;
  name: string;
  phone: string;
  city?: string;
  district?: string;
  experience?: string;
  has_motorcycle?: boolean;
  rider_type?: string;
  birth_year?: string;
  status?: string;
  created_at?: string;
}

interface AgencyProfile {
  id: number;
  user_id: string;
  name: string;
  manager_name?: string;
  phone?: string;
  city?: string;
  district?: string;
  platform?: string;
  pay_per_delivery?: string;
  promotion?: string;
  settlement_type?: string;
  motorcycle_option?: string;
  work_type?: string;
  verified?: string;        // "pending" | "approved" | "rejected"
  biz_license_url?: string; // 사업자등록증 URL
  created_at?: string;
}

interface PlatformStats {
  total_riders: number;
  total_agencies: number;
  pending_riders: number;
  pending_agencies: number;
}

// ---------- Sidebar ----------
const sidebarItems = [
  { icon: LayoutDashboard, label: "대시보드", tab: "dashboard" as const },
  { icon: Users, label: "라이더 관리", tab: "riders" as const },
  { icon: Building2, label: "지사 관리", tab: "agencies" as const },
  { icon: ShieldCheck, label: "인증 관리", tab: "verification" as const },
  { icon: BarChart3, label: "리포트", tab: "reports" as const },
  { icon: Settings, label: "설정", tab: "settings" as const },
];

type TabKey =
  | "dashboard"
  | "riders"
  | "agencies"
  | "verification"
  | "reports"
  | "settings";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");

  // Data states
  const [stats, setStats] = useState<PlatformStats>({
    total_riders: 0,
    total_agencies: 0,
    pending_riders: 0,
    pending_agencies: 0,
  });
  const [riders, setRiders] = useState<RiderProfile[]>([]);
  const [agencies, setAgencies] = useState<AgencyProfile[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingRiders, setLoadingRiders] = useState(false);
  const [loadingAgencies, setLoadingAgencies] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // 필터 상태 — 라이더: all / active / inactive / rejected
  const [riderFilter, setRiderFilter] = useState<"all" | "active" | "inactive" | "rejected">("all");
  // 필터 상태 — 지사: all / pending / approved / rejected
  const [agencyFilter, setAgencyFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  // Fetch platform stats via admin API
  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const response = await client.apiCall.invoke({
        url: "/api/v1/admin/stats",
        method: "GET",
      });
      if (response?.data) {
        setStats(response.data as PlatformStats);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Fetch all riders via admin API
  const fetchRiders = useCallback(async () => {
    try {
      setLoadingRiders(true);
      const response = await client.apiCall.invoke({
        url: "/api/v1/admin/riders",
        method: "GET",
        data: { limit: 200, skip: 0 },
      });
      if (response?.data?.items) {
        setRiders(response.data.items as RiderProfile[]);
      }
    } catch (err) {
      console.error("Failed to fetch riders:", err);
    } finally {
      setLoadingRiders(false);
    }
  }, []);

  // Fetch all agencies via admin API
  const fetchAgencies = useCallback(async () => {
    try {
      setLoadingAgencies(true);
      const response = await client.apiCall.invoke({
        url: "/api/v1/admin/agencies",
        method: "GET",
        data: { limit: 200, skip: 0 },
      });
      if (response?.data?.items) {
        setAgencies(response.data.items as AgencyProfile[]);
      }
    } catch (err) {
      console.error("Failed to fetch agencies:", err);
    } finally {
      setLoadingAgencies(false);
    }
  }, []);

  // Update rider status via admin API
  const updateRiderStatus = async (riderId: number, newStatus: string) => {
    try {
      setUpdatingId(riderId);
      await client.apiCall.invoke({
        url: `/api/v1/admin/riders/${riderId}/status`,
        method: "PUT",
        data: { status: newStatus },
      });
      toast({
        title: "상태 변경 완료",
        description: `라이더 상태가 "${newStatus}"(으)로 변경되었습니다.`,
      });
      await fetchRiders();
      await fetchStats();
    } catch (err) {
      console.error("Failed to update rider status:", err);
      toast({
        title: "오류",
        description: "라이더 상태 변경에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  // Update agency verified status via admin API
  const updateAgencyVerified = async (agencyId: number, verified: "pending" | "approved" | "rejected") => {
    try {
      setUpdatingId(agencyId);
      await client.apiCall.invoke({
        url: `/api/v1/admin/agencies/${agencyId}/status`,
        method: "PUT",
        data: { verified },
      });
      const labelMap = { pending: "대기중", approved: "승인", rejected: "거절" };
      toast({
        title: "인증 상태 변경 완료",
        description: `지사 상태가 "${labelMap[verified]}"으로 변경되었습니다.`,
      });
      await fetchAgencies();
      await fetchStats();
    } catch (err) {
      console.error("Failed to update agency status:", err);
      toast({
        title: "오류",
        description: "지사 인증 상태 변경에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  // Refresh all data
  const refreshAll = useCallback(() => {
    fetchStats();
    fetchRiders();
    fetchAgencies();
  }, [fetchStats, fetchRiders, fetchAgencies]);

  // Initial load
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // 라이더 필터링
  const activeRiders = riders.filter((r) => r.status === "active");
  const inactiveRiders = riders.filter((r) => !r.status || r.status === "inactive");
  const rejectedRiders = riders.filter((r) => r.status === "rejected");
  const filteredRiders =
    riderFilter === "active" ? activeRiders :
    riderFilter === "inactive" ? inactiveRiders :
    riderFilter === "rejected" ? rejectedRiders :
    riders;

  // 지사 필터링 (문자열 3상태)
  const pendingAgencies  = agencies.filter((a) => !a.verified || a.verified === "pending");
  const approvedAgencies = agencies.filter((a) => a.verified === "approved");
  const rejectedAgencies = agencies.filter((a) => a.verified === "rejected");
  const filteredAgencies =
    agencyFilter === "pending"  ? pendingAgencies  :
    agencyFilter === "approved" ? approvedAgencies :
    agencyFilter === "rejected" ? rejectedAgencies :
    agencies;

  // 지사 상태 변환 헬퍼
  const verifiedLabel = (v?: string) =>
    v === "approved" ? "승인" : v === "rejected" ? "거절" : "대기중";
  const verifiedStyle = (v?: string) =>
    v === "approved"
      ? "bg-emerald-500/20 text-emerald-400"
      : v === "rejected"
      ? "bg-red-500/20 text-red-400"
      : "bg-amber-500/20 text-amber-400";
  const verifiedIconStyle = (v?: string) =>
    v === "approved" ? "bg-emerald-500/10" : v === "rejected" ? "bg-red-500/10" : "bg-amber-500/10";
  const verifiedIconColor = (v?: string) =>
    v === "approved" ? "text-emerald-400" : v === "rejected" ? "text-red-400" : "text-amber-400";

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
          <p className="text-[#6B7280] text-xs mt-2">관리자 대시보드</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.tab}
              onClick={() => {
                setActiveTab(item.tab);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left ${
                activeTab === item.tab
                  ? "bg-[#E63946]/10 text-[#E63946]"
                  : "text-[#9CA3AF] hover:bg-[#1A1A1A] hover:text-white"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 lg:ml-0 overflow-auto">
        <div className="p-6 lg:p-10 max-w-7xl mx-auto">
          {/* 헤더 */}
          <div className="mb-8 pl-10 lg:pl-0 flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                관리자 <span className="text-[#E63946]">대시보드</span>
              </h1>
              <p className="text-[#6B7280] mt-1">
                플랫폼 전체 현황 및 관리
              </p>
            </div>
            <Button
              variant="outline"
              className="!bg-transparent border-[#2A2A2A] text-[#9CA3AF] hover:text-white"
              onClick={refreshAll}
            >
              <RefreshCw size={14} className="mr-2" />
              새로고침
            </Button>
          </div>

          {/* 요약 카드 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {[
              {
                label: "전체 라이더",
                value: loadingStats ? "..." : String(stats.total_riders),
                color: "text-[#E63946]",
              },
              {
                label: "전체 지사",
                value: loadingStats ? "..." : String(stats.total_agencies),
                color: "text-blue-400",
              },
              {
                label: "비활성 라이더",
                value: loadingStats ? "..." : String(stats.pending_riders),
                color: "text-amber-400",
              },
              {
                label: "승인 대기 지사",
                value: loadingStats ? "..." : String(stats.pending_agencies),
                color: "text-amber-400",
              },
            ].map((card, i) => (
              <div
                key={i}
                className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-5"
              >
                <p className={`text-3xl font-bold ${card.color}`}>
                  {card.value}
                </p>
                <p className="text-[#6B7280] text-sm mt-1">{card.label}</p>
              </div>
            ))}
          </div>

          {/* 탭 네비게이션 */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {(
              [
                { key: "dashboard", label: "대시보드", icon: LayoutDashboard },
                { key: "riders", label: "라이더", icon: Users },
                { key: "agencies", label: "지사", icon: Building2 },
                { key: "verification", label: "인증 관리", icon: ShieldCheck },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? "bg-[#E63946] text-white"
                    : "bg-[#1A1A1A] text-[#9CA3AF] hover:text-white border border-[#2A2A2A]"
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* ===== 대시보드 탭 ===== */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* 전체 사용자 요약 */}
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Users size={18} className="text-[#E63946]" />
                  전체 사용자
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-400">{activeRiders.length}</p>
                    <p className="text-[#6B7280] text-xs mt-1">활성 라이더</p>
                  </div>
                  <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-amber-400">{inactiveRiders.length}</p>
                    <p className="text-[#6B7280] text-xs mt-1">비활성 라이더</p>
                  </div>
                  <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-red-400">{rejectedRiders.length}</p>
                    <p className="text-[#6B7280] text-xs mt-1">거절된 라이더</p>
                  </div>
                </div>
              </div>

              {/* 지사 요약 */}
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Building2 size={18} className="text-blue-400" />
                  전체 지사
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-400">{activeAgencies.length}</p>
                    <p className="text-[#6B7280] text-xs mt-1">활성 지사</p>
                  </div>
                  <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-red-400">{blockedAgencies.length}</p>
                    <p className="text-[#6B7280] text-xs mt-1">차단된 지사</p>
                  </div>
                </div>
              </div>

              {/* 최근 차단된 사용자 */}
              {inactiveRiders.length > 0 && (
                <div className="bg-[#1A1A1A] border border-red-500/20 rounded-2xl p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <XCircle size={18} className="text-red-400" />
                    비활성 라이더 ({inactiveRiders.length})
                  </h3>
                  <div className="space-y-3">
                    {inactiveRiders.slice(0, 5).map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between bg-[#111111] border border-[#2A2A2A] rounded-xl p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-red-500/10 rounded-lg flex items-center justify-center">
                            <Users size={16} className="text-red-400" />
                          </div>
                          <div>
                            <p className="font-medium">{r.name}</p>
                            <p className="text-[#6B7280] text-xs">{r.phone} · {r.city} {r.district}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg"
                          disabled={updatingId === r.id}
                          onClick={() => updateRiderStatus(r.id, "active")}
                        >
                          {updatingId === r.id ? <Loader2 size={12} className="animate-spin mr-1" /> : <CheckCircle size={12} className="mr-1" />}
                          활성화
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===== 라이더 관리 탭 ===== */}
          {activeTab === "riders" && (
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">전체 사용자 ({riders.length}명)</h3>
                {loadingRiders && <Loader2 size={18} className="animate-spin text-[#6B7280]" />}
              </div>

              {/* 필터 탭 */}
              <div className="flex gap-2 mb-5 flex-wrap">
                {([
                  { key: "all", label: `전체 (${riders.length})` },
                  { key: "active", label: `활성 (${activeRiders.length})` },
                  { key: "inactive", label: `비활성 (${inactiveRiders.length})` },
                  { key: "rejected", label: `거절됨 (${rejectedRiders.length})` },
                ] as const).map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setRiderFilter(f.key)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                      riderFilter === f.key
                        ? "bg-[#E63946] text-white"
                        : "bg-[#111111] border border-[#2A2A2A] text-[#9CA3AF] hover:text-white"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {loadingRiders && riders.length === 0 ? (
                <div className="flex justify-center py-10">
                  <Loader2 size={24} className="animate-spin text-[#6B7280]" />
                </div>
              ) : filteredRiders.length === 0 ? (
                <p className="text-[#6B7280] text-center py-10">해당 사용자가 없습니다.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#2A2A2A]">
                        <th className="text-left text-[#6B7280] font-medium pb-4">이름</th>
                        <th className="text-left text-[#6B7280] font-medium pb-4 hidden sm:table-cell">지역</th>
                        <th className="text-left text-[#6B7280] font-medium pb-4 hidden md:table-cell">경력</th>
                        <th className="text-left text-[#6B7280] font-medium pb-4 hidden lg:table-cell">오토바이</th>
                        <th className="text-left text-[#6B7280] font-medium pb-4 hidden lg:table-cell">근무 유형</th>
                        <th className="text-left text-[#6B7280] font-medium pb-4">상태</th>
                        <th className="text-right text-[#6B7280] font-medium pb-4">관리</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRiders.map((r) => {
                        const status = r.status || "inactive";
                        const isActive = status === "active";
                        const isRejected = status === "rejected";
                        const isInactive = !isActive && !isRejected;
                        return (
                          <tr key={r.id} className="border-b border-[#2A2A2A]/50 hover:bg-[#111111] transition-colors">
                            <td className="py-4">
                              <div>
                                <span className="font-medium">{r.name}</span>
                                <p className="text-[#6B7280] text-xs">{r.phone}</p>
                              </div>
                            </td>
                            <td className="py-4 text-[#9CA3AF] hidden sm:table-cell">{r.city} {r.district}</td>
                            <td className="py-4 text-[#9CA3AF] hidden md:table-cell">{r.experience || "-"}</td>
                            <td className="py-4 hidden lg:table-cell">
                              {r.has_motorcycle ? <Bike size={16} className="text-emerald-400" /> : <span className="text-[#6B7280]">—</span>}
                            </td>
                            <td className="py-4 text-[#9CA3AF] hidden lg:table-cell">{r.rider_type || "-"}</td>
                            <td className="py-4">
                              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                                isActive ? "bg-emerald-500/20 text-emerald-400" :
                                isRejected ? "bg-red-500/20 text-red-400" :
                                "bg-[#2A2A2A] text-[#9CA3AF]"
                              }`}>
                                {isActive ? "활성" : isRejected ? "거절됨" : "비활성"}
                              </span>
                            </td>
                            <td className="py-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                {isActive && (
                                  <Button
                                    size="sm"
                                    className="bg-red-600 hover:bg-red-500 text-white text-xs rounded-lg h-7 px-2.5 gap-1"
                                    disabled={updatingId === r.id}
                                    onClick={() => updateRiderStatus(r.id, "inactive")}
                                  >
                                    {updatingId === r.id ? <Loader2 size={11} className="animate-spin" /> : <XCircle size={11} />}
                                    차단하기
                                  </Button>
                                )}
                                {(isInactive || isRejected) && (
                                  <Button
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded-lg h-7 px-2.5 gap-1"
                                    disabled={updatingId === r.id}
                                    onClick={() => updateRiderStatus(r.id, "active")}
                                  >
                                    {updatingId === r.id ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle size={11} />}
                                    활성화
                                  </Button>
                                )}
                                {isActive && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="!bg-transparent border-[#2A2A2A] text-[#9CA3AF] hover:text-red-400 hover:border-red-500/50 text-xs rounded-lg h-7 px-2"
                                    disabled={updatingId === r.id}
                                    onClick={() => updateRiderStatus(r.id, "rejected")}
                                    title="영구 거절"
                                  >
                                    <XCircle size={12} />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ===== 지사 관리 탭 ===== */}
          {activeTab === "agencies" && (
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">전체 지사 ({agencies.length}개)</h3>
                {loadingAgencies && <Loader2 size={18} className="animate-spin text-[#6B7280]" />}
              </div>

              {/* 필터 탭 */}
              <div className="flex gap-2 mb-5 flex-wrap">
                {([
                  { key: "all",      label: `전체 (${agencies.length})` },
                  { key: "pending",  label: `대기중 (${pendingAgencies.length})` },
                  { key: "approved", label: `승인 (${approvedAgencies.length})` },
                  { key: "rejected", label: `거절 (${rejectedAgencies.length})` },
                ] as const).map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setAgencyFilter(f.key)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                      agencyFilter === f.key
                        ? "bg-[#E63946] text-white"
                        : "bg-[#111111] border border-[#2A2A2A] text-[#9CA3AF] hover:text-white"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {loadingAgencies && agencies.length === 0 ? (
                <div className="flex justify-center py-10">
                  <Loader2 size={24} className="animate-spin text-[#6B7280]" />
                </div>
              ) : filteredAgencies.length === 0 ? (
                <p className="text-[#6B7280] text-center py-10">해당 지사가 없습니다.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#2A2A2A]">
                        <th className="text-left text-[#6B7280] font-medium pb-4">지사명</th>
                        <th className="text-left text-[#6B7280] font-medium pb-4 hidden sm:table-cell">지역</th>
                        <th className="text-left text-[#6B7280] font-medium pb-4 hidden md:table-cell">플랫폼</th>
                        <th className="text-left text-[#6B7280] font-medium pb-4 hidden lg:table-cell">담당자</th>
                        <th className="text-left text-[#6B7280] font-medium pb-4">상태</th>
                        <th className="text-right text-[#6B7280] font-medium pb-4">관리</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAgencies.map((a) => (
                        <tr key={a.id} className="border-b border-[#2A2A2A]/50 hover:bg-[#111111] transition-colors">
                          <td className="py-4">
                            <div>
                              <span className="font-medium">{a.name}</span>
                              <p className="text-[#6B7280] text-xs">{a.phone || "-"}</p>
                            </div>
                          </td>
                          <td className="py-4 text-[#9CA3AF] hidden sm:table-cell">{a.city} {a.district}</td>
                          <td className="py-4 text-[#9CA3AF] hidden md:table-cell">{a.platform || "-"}</td>
                          <td className="py-4 text-[#9CA3AF] hidden lg:table-cell">{a.manager_name || "-"}</td>
                          <td className="py-4">
                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${verifiedStyle(a.verified)}`}>
                              {verifiedLabel(a.verified)}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {a.verified !== "approved" && (
                                <Button
                                  size="sm"
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded-lg h-7 px-2.5 gap-1"
                                  disabled={updatingId === a.id}
                                  onClick={() => updateAgencyVerified(a.id, "approved")}
                                >
                                  {updatingId === a.id ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle size={11} />}
                                  승인
                                </Button>
                              )}
                              {a.verified !== "rejected" && (
                                <Button
                                  size="sm"
                                  className="bg-red-600 hover:bg-red-500 text-white text-xs rounded-lg h-7 px-2.5 gap-1"
                                  disabled={updatingId === a.id}
                                  onClick={() => updateAgencyVerified(a.id, "rejected")}
                                >
                                  {updatingId === a.id ? <Loader2 size={11} className="animate-spin" /> : <XCircle size={11} />}
                                  거절
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ===== 인증 관리 탭 ===== */}
          {activeTab === "verification" && (
            <div className="space-y-6">
              {/* 인증 등급 설명 */}
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-2">지사 인증 관리</h3>
                <p className="text-[#6B7280] mb-6">지사 사업자등록증을 확인하고 승인 또는 거절하세요.</p>
                <div className="flex flex-wrap gap-3 mb-4">
                  {[
                    { label: "대기중",  style: "bg-amber-500/20 text-amber-400 border-amber-500/30",   desc: `가입 완료, 관리자 검토 대기 (${pendingAgencies.length}개)` },
                    { label: "승인됨",  style: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", desc: `승인 완료 — 공고 등록 가능 (${approvedAgencies.length}개)` },
                    { label: "거절됨",  style: "bg-red-500/20 text-red-400 border-red-500/30",         desc: `승인 거절 — 콘텐츠 비활성 (${rejectedAgencies.length}개)` },
                  ].map((badge, i) => (
                    <div key={i} className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-4 flex-1 min-w-[200px]">
                      <span className={`inline-block text-xs font-medium px-3 py-1 rounded-full border mb-3 ${badge.style}`}>
                        {badge.label}
                      </span>
                      <p className="text-[#9CA3AF] text-sm">{badge.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 지사 목록 */}
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold">전체 지사 ({agencies.length})</h3>
                  {loadingAgencies && <Loader2 size={18} className="animate-spin text-[#6B7280]" />}
                </div>
                {agencies.length === 0 ? (
                  <p className="text-[#6B7280] text-sm py-4">등록된 지사가 없습니다.</p>
                ) : (
                  <div className="space-y-4">
                    {agencies.map((agency) => (
                      <div key={agency.id} className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-5">
                        {/* 헤더: 지사 정보 + 상태 등급 */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${verifiedIconStyle(agency.verified)}`}>
                              <Building2 size={22} className={verifiedIconColor(agency.verified)} />
                            </div>
                            <div>
                              <p className="font-bold text-base">{agency.name}</p>
                              <p className="text-[#6B7280] text-sm">{agency.city} {agency.district} · {agency.phone || "-"}</p>
                            </div>
                          </div>
                          <span className={`text-xs font-medium px-3 py-1.5 rounded-full border ${
                            agency.verified === "approved"
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                              : agency.verified === "rejected"
                              ? "bg-red-500/20 text-red-400 border-red-500/30"
                              : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                          }`}>
                            {agency.verified === "approved" ? "승인됨" : agency.verified === "rejected" ? "거절됨" : "대기중"}
                          </span>
                        </div>

                        {/* 세부 정보 */}
                        <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="bg-[#0A0A0A] rounded-lg p-3">
                            <p className="text-[#6B7280] text-xs mb-1">플랫폼</p>
                            <p className="text-sm font-medium">{agency.platform || "-"}</p>
                          </div>
                          <div className="bg-[#0A0A0A] rounded-lg p-3">
                            <p className="text-[#6B7280] text-xs mb-1">건당 단가</p>
                            <p className="text-sm font-medium">{agency.pay_per_delivery || "-"}</p>
                          </div>
                          <div className="bg-[#0A0A0A] rounded-lg p-3">
                            <p className="text-[#6B7280] text-xs mb-1">정산 방식</p>
                            <p className="text-sm font-medium">{agency.settlement_type || "-"}</p>
                          </div>
                          <div className="bg-[#0A0A0A] rounded-lg p-3">
                            <p className="text-[#6B7280] text-xs mb-1">담당자</p>
                            <p className="text-sm font-medium">{agency.manager_name || "-"}</p>
                          </div>
                        </div>

                        {/* 액션 버튼 */}
                        <div className="flex flex-wrap gap-2">
                          {/* 서류 확인 버튼 */}
                          {agency.biz_license_url && (
                            <a
                              href={agency.biz_license_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-sm font-bold rounded-xl px-5 py-2 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-[#9CA3AF] hover:text-white transition-colors"
                            >
                              <CheckCircle size={14} />
                              서류 확인
                            </a>
                          )}

                          {/* 승인 버튼: 대기중/거절된 경우 표시 */}
                          {agency.verified !== "approved" && (
                            <Button
                              className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl px-5 gap-1.5"
                              disabled={updatingId === agency.id}
                              onClick={() => updateAgencyVerified(agency.id, "approved")}
                            >
                              {updatingId === agency.id
                                ? <Loader2 size={14} className="animate-spin" />
                                : <CheckCircle size={14} />}
                              승인하기
                            </Button>
                          )}

                          {/* 거절 버튼: 대기중/승인된 경우 표시 */}
                          {agency.verified !== "rejected" && (
                            <Button
                              className="bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-xl px-5 gap-1.5"
                              disabled={updatingId === agency.id}
                              onClick={() => updateAgencyVerified(agency.id, "rejected")}
                            >
                              {updatingId === agency.id
                                ? <Loader2 size={14} className="animate-spin" />
                                : <XCircle size={14} />}
                              거절하기
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===== 리포트 탭 ===== */}
          {activeTab === "reports" && (
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-6">리포트</h3>
              <p className="text-[#6B7280] text-center py-10">
                리포트 기능은 준비 중입니다.
              </p>
            </div>
          )}

          {/* ===== 설정 탭 ===== */}
          {activeTab === "settings" && (
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-6">설정</h3>
              <p className="text-[#6B7280] text-center py-10">
                설정 기능은 준비 중입니다.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}