/**
 * AgencyListings — 지사 채용 공고 관리 페이지 (/agency/listings)
 *
 * 기능:
 *   - 내 채용 공고 목록 조회 (GET /api/v1/entities/job_listings)
 *   - 공고 등록 폼 (모달)
 *   - 공고 삭제 (confirm 후 DELETE)
 */
import { useState, useEffect } from "react";
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
  Plus,
  ClipboardList,
  MapPin,
  Clock,
  Bike,
  Banknote,
  Trash2,
  X,
  CheckCircle2,
  Loader2,
  Building2,
  ArrowLeft,
  Gift,
} from "lucide-react";
import { client } from "@/lib/api";
import { useSEO } from "@/hooks/useSEO";
import { cities } from "@/data/regions";

interface JobListing {
  id: number;
  agency_name: string;
  region: string;
  sub_region: string;
  title: string;
  conditions: string;
  promotion: string;
  motorcycle: string;
  settlement: string;
  work_time: string;
  status: string;
  created_at: string;
}

const statusBadge: Record<string, string> = {
  // 모집 상태별 배지 스타일 (이모지 포함 키)
  "모집중 ✅": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "긴급 🔥": "bg-[#E63946]/20 text-[#E63946] border-[#E63946]/30",
  "마감 ⛔": "bg-[#2A2A2A] text-[#6B7280] border-[#2A2A2A]",
};

const selectCls = "text-white hover:bg-white/10 focus:bg-white/10 focus:text-white";

// ──────────────────────────────────────────
// 공고 등록 모달
// ──────────────────────────────────────────
interface NewListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function NewListingModal({ isOpen, onClose, onSuccess }: NewListingModalProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [agencyName, setAgencyName] = useState("");
  const [title, setTitle] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [promotion, setPromotion] = useState("");
  const [motorcycle, setMotorcycle] = useState("");
  const [settlement, setSettlement] = useState("");
  const [workTime, setWorkTime] = useState("");
  const [status, setStatus] = useState("모집중 ✅"); // 기본값: 이모지 포함

  const cityData = cities.find((c) => c.name === city);

  const reset = () => {
    setAgencyName(""); setTitle(""); setCity(""); setDistrict("");
    setPromotion(""); setMotorcycle(""); setSettlement(""); setWorkTime("");
    setStatus("모집중 ✅"); setError(null);
  };

  const handleSubmit = async () => {
    if (!agencyName || !title || !city || !district) {
      setError("지사명, 공고 제목, 지역(시/구)은 필수입니다.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await client.entities.job_listings.create({
        data: {
          agency_name: agencyName,
          title,
          region: `${city} ${district}`,
          sub_region: district,
          conditions: "[]",
          promotion,
          motorcycle,
          settlement,
          work_time: workTime,
          status,
          created_at: new Date().toISOString().replace("T", " ").slice(0, 19),
        },
      });
      reset();
      onSuccess();
      onClose();
    } catch (err) {
      console.error("공고 등록 실패:", err);
      setError("공고 등록에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-[#1A1A1A] border-b border-[#2A2A2A] p-5 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h3 className="text-lg font-bold">채용 공고 등록</h3>
            <p className="text-[#6B7280] text-xs mt-0.5">새로운 라이더 채용 공고를 작성하세요</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#2A2A2A] flex items-center justify-center hover:bg-[#3A3A3A] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* 지사명 */}
          <div>
            <label className="text-[#9CA3AF] text-sm mb-1.5 flex items-center gap-1.5 block">
              <Building2 size={14} /> 지사명 <span className="text-[#E63946]">*</span>
            </label>
            <Input
              placeholder="예: 마포 라이더스"
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              className="bg-[#111111] border-[#2A2A2A] text-white rounded-xl"
            />
          </div>

          {/* 공고 제목 */}
          <div>
            <label className="text-[#9CA3AF] text-sm mb-1.5 flex items-center gap-1.5 block">
              <ClipboardList size={14} /> 공고 제목 <span className="text-[#E63946]">*</span>
            </label>
            <Input
              placeholder="예: 마포구 주간 라이더 모집"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-[#111111] border-[#2A2A2A] text-white rounded-xl"
            />
          </div>

          {/* 지역 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[#9CA3AF] text-sm mb-1.5 flex items-center gap-1.5 block">
                <MapPin size={14} /> 시/도 <span className="text-[#E63946]">*</span>
              </label>
              <Select value={city} onValueChange={(v) => { setCity(v); setDistrict(""); }}>
                <SelectTrigger className="bg-[#111111] border-[#2A2A2A] text-white rounded-xl">
                  <SelectValue placeholder="시/도 선택" />
                </SelectTrigger>
                <SelectContent className="!bg-[#1A1A1A] border-[#2A2A2A] text-white">
                  {cities.map((c) => (
                    <SelectItem key={c.name} value={c.name} className={selectCls}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[#9CA3AF] text-sm mb-1.5 block">
                구/군 <span className="text-[#E63946]">*</span>
              </label>
              <Select value={district} onValueChange={setDistrict} disabled={!city}>
                <SelectTrigger className="bg-[#111111] border-[#2A2A2A] text-white rounded-xl">
                  <SelectValue placeholder="구/군 선택" />
                </SelectTrigger>
                <SelectContent className="!bg-[#1A1A1A] border-[#2A2A2A] text-white">
                  {cityData?.regions.map((r) => (
                    <SelectItem key={r.name} value={r.name} className={selectCls}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 프로모션 */}
          <div>
            <label className="text-[#9CA3AF] text-sm mb-1.5 flex items-center gap-1.5 block">
              <Gift size={14} /> 프로모션
            </label>
            <Input
              placeholder="예: 가입 보너스 ₩200,000"
              value={promotion}
              onChange={(e) => setPromotion(e.target.value)}
              className="bg-[#111111] border-[#2A2A2A] text-white rounded-xl"
            />
          </div>

          {/* 오토바이 / 정산 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[#9CA3AF] text-sm mb-1.5 flex items-center gap-1.5 block">
                <Bike size={14} /> 오토바이
              </label>
              <Select value={motorcycle} onValueChange={setMotorcycle}>
                <SelectTrigger className="bg-[#111111] border-[#2A2A2A] text-white rounded-xl">
                  <SelectValue placeholder="선택" />
                </SelectTrigger>
                <SelectContent className="!bg-[#1A1A1A] border-[#2A2A2A] text-white">
                  {/* 오토바이 옵션 수정 */}
                  <SelectItem value="리스 가능" className={selectCls}>리스 가능</SelectItem>
                  <SelectItem value="렌트 가능" className={selectCls}>렌트 가능</SelectItem>
                  <SelectItem value="리스&렌트 둘다 가능" className={selectCls}>리스&amp;렌트 둘다 가능</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[#9CA3AF] text-sm mb-1.5 flex items-center gap-1.5 block">
                <Banknote size={14} /> 정산 방식
              </label>
              <Select value={settlement} onValueChange={setSettlement}>
                <SelectTrigger className="bg-[#111111] border-[#2A2A2A] text-white rounded-xl">
                  <SelectValue placeholder="선택" />
                </SelectTrigger>
                <SelectContent className="!bg-[#1A1A1A] border-[#2A2A2A] text-white">
                  {/* 정산 방식 옵션 수정 */}
                  <SelectItem value="주급" className={selectCls}>주급</SelectItem>
                  <SelectItem value="익일지급" className={selectCls}>익일지급</SelectItem>
                  <SelectItem value="주급&익일지급 둘다 가능" className={selectCls}>주급&amp;익일지급 둘다 가능</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 근무 시간 / 상태 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[#9CA3AF] text-sm mb-1.5 flex items-center gap-1.5 block">
                <Clock size={14} /> 근무 시간
              </label>
              <Select value={workTime} onValueChange={setWorkTime}>
                <SelectTrigger className="bg-[#111111] border-[#2A2A2A] text-white rounded-xl">
                  <SelectValue placeholder="선택" />
                </SelectTrigger>
                <SelectContent className="!bg-[#1A1A1A] border-[#2A2A2A] text-white">
                  <SelectItem value="주간" className={selectCls}>주간</SelectItem>
                  <SelectItem value="야간" className={selectCls}>야간</SelectItem>
                  <SelectItem value="풀타임" className={selectCls}>풀타임</SelectItem>
                  <SelectItem value="자유" className={selectCls}>자유</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[#9CA3AF] text-sm mb-1.5 block">모집 상태</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="bg-[#111111] border-[#2A2A2A] text-white rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="!bg-[#1A1A1A] border-[#2A2A2A] text-white">
                  {/* 모집 상태 옵션 - 이모지 추가 */}
                  <SelectItem value="모집중 ✅" className={selectCls}>모집중 ✅</SelectItem>
                  <SelectItem value="긴급 🔥" className={selectCls}>긴급 🔥</SelectItem>
                  <SelectItem value="마감 ⛔" className={selectCls}>마감 ⛔</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* 저장 버튼 */}
        <div className="sticky bottom-0 bg-[#1A1A1A] border-t border-[#2A2A2A] p-5 rounded-b-2xl">
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full bg-[#E63946] hover:bg-[#FF4D5A] text-white font-bold rounded-xl py-5 gap-2"
          >
            {saving ? (
              <><Loader2 size={18} className="animate-spin" /> 등록 중...</>
            ) : (
              <><CheckCircle2 size={18} /> 공고 등록 완료</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────
// 메인 페이지
// ──────────────────────────────────────────
export default function AgencyListings() {
  useSEO({
    title: "채용 공고 관리 - 지사 대시보드",
    description: "내 지사의 채용 공고를 등록하고 관리합니다.",
    url: "/agency/listings",
    noindex: true,
  });

  const [listings, setListings] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchListings = async () => {
    setLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await (client.entities.job_listings as any).queryAll({
        query: {}, sort: "-created_at", limit: 100, skip: 0,
      });
      const items = res?.data?.items ?? [];
      setListings(items);
    } catch (err) {
      console.error("공고 목록 불러오기 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchListings(); }, []);

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`"${title}" 공고를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) return;
    setDeletingId(id);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (client.entities.job_listings as any).delete({ id });
      setListings((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      console.error("공고 삭제 실패:", err);
      alert("공고 삭제 중 오류가 발생했습니다.");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dt: string) =>
    dt ? dt.split(" ")[0].replace(/-/g, ".") : "-";

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-['Inter',sans-serif]">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 border-b border-[#1A1A1A] bg-[#0A0A0A]/95 backdrop-blur-sm px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/agency"
              className="w-8 h-8 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center hover:border-[#E63946]/50 transition-colors"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <ClipboardList size={20} className="text-[#E63946]" />
                채용 공고 관리
              </h1>
              <p className="text-[#6B7280] text-xs mt-0.5">
                등록된 공고 {listings.length}개
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowModal(true)}
            className="bg-[#E63946] hover:bg-[#FF4D5A] text-white font-bold rounded-xl gap-2"
          >
            <Plus size={16} /> 공고 등록
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 size={36} className="animate-spin text-[#E63946]" />
            <p className="text-[#9CA3AF]">공고 목록을 불러오는 중...</p>
          </div>
        ) : listings.length === 0 ? (
          /* 빈 상태 */
          <div className="bg-[#1A1A1A]/50 border border-dashed border-[#2A2A2A] rounded-2xl p-16 text-center">
            <ClipboardList size={52} className="text-[#2A2A2A] mx-auto mb-5" />
            <h3 className="text-xl font-bold mb-2">등록된 채용 공고가 없습니다</h3>
            <p className="text-[#6B7280] text-sm mb-8 max-w-sm mx-auto">
              첫 번째 공고를 등록하고 라이더를 모집해 보세요.
            </p>
            <Button
              onClick={() => setShowModal(true)}
              className="bg-[#E63946] hover:bg-[#FF4D5A] text-white font-bold rounded-xl px-8 py-5 gap-2"
            >
              <Plus size={16} /> 첫 번째 공고 등록
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6 hover:border-[#E63946]/30 transition-all duration-300 hover:-translate-y-0.5 group"
              >
                {/* 카드 헤더 */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 pr-3">
                    <p className="text-xs text-amber-400 font-medium mb-1">
                      {listing.agency_name}
                    </p>
                    <h3 className="font-bold text-base leading-snug line-clamp-2">
                      {listing.title}
                    </h3>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 ${
                      statusBadge[listing.status] ?? statusBadge["마감"]
                    }`}
                  >
                    {listing.status}
                  </span>
                </div>

                {/* 상세 정보 */}
                <div className="space-y-1.5 text-sm text-[#9CA3AF] mb-4">
                  {listing.region && (
                    <div className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-[#E63946]" />
                      {listing.region}
                      {listing.sub_region && listing.sub_region !== listing.region && (
                        <span className="text-[#6B7280] text-xs">· {listing.sub_region}</span>
                      )}
                    </div>
                  )}
                  {listing.work_time && (
                    <div className="flex items-center gap-1.5">
                      <Clock size={13} className="text-blue-400" />
                      {listing.work_time}
                    </div>
                  )}
                  {listing.motorcycle && (
                    <div className="flex items-center gap-1.5">
                      <Bike size={13} className="text-purple-400" />
                      {listing.motorcycle}
                    </div>
                  )}
                  {listing.settlement && (
                    <div className="flex items-center gap-1.5">
                      <Banknote size={13} className="text-emerald-400" />
                      {listing.settlement}
                    </div>
                  )}
                  {listing.promotion && (
                    <div className="flex items-center gap-1.5">
                      <Gift size={13} className="text-amber-400" />
                      <span className="text-amber-300 text-xs">{listing.promotion}</span>
                    </div>
                  )}
                </div>

                {/* 하단 */}
                <div className="flex items-center justify-between pt-3 border-t border-[#2A2A2A]">
                  <span className="text-[10px] text-[#6B7280]">
                    등록일: {formatDate(listing.created_at)}
                  </span>
                  <button
                    onClick={() => handleDelete(listing.id, listing.title)}
                    disabled={deletingId === listing.id}
                    className="flex items-center gap-1 text-xs text-[#6B7280] hover:text-red-400 transition-colors disabled:opacity-50"
                  >
                    {deletingId === listing.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Trash2 size={12} />
                    )}
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 공고 등록 모달 */}
      <NewListingModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchListings}
      />
    </div>
  );
}
