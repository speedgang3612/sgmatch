import { useState } from "react";
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
  X,
  Building2,
  User,
  Phone,
  MapPin,
  Banknote,
  Gift,
  Wrench,
  Clock,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { cities } from "@/data/regions";
import { client } from "@/lib/api";
import ImageUpload from "@/components/ImageUpload";

interface BranchData {
  id?: number;
  name?: string;
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
  verified?: boolean;
  logo_url?: string; // #18 — 이미지 URL
}

interface AddBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: number;
  companyName: string;
  onSuccess: () => void;
  existingBranch?: BranchData; // #17 — 수정 모드: 기존 지사 데이터
}

export default function AddBranchModal({
  isOpen,
  onClose,
  companyId,
  companyName,
  onSuccess,
  existingBranch,
}: AddBranchModalProps) {
  const isEditMode = !!existingBranch?.id;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // #17 — 수정 모드: 기존 데이터로 초기값 세팅
  const [name, setName] = useState(existingBranch?.name ?? "");
  const [manager, setManager] = useState(existingBranch?.manager_name ?? "");
  const [phone, setPhone] = useState(existingBranch?.phone ?? "");
  const [city, setCity] = useState(existingBranch?.city ?? "");
  const [district, setDistrict] = useState(existingBranch?.district ?? "");
  const [platform, setPlatform] = useState(existingBranch?.platform ?? "");
  const [pay, setPay] = useState(existingBranch?.pay_per_delivery ?? "");
  const [promo, setPromo] = useState(existingBranch?.promotion ?? "");
  const [settlement, setSettlement] = useState(existingBranch?.settlement_type ?? "");
  const [motorcycle, setMotorcycle] = useState(existingBranch?.motorcycle_option ?? "");
  const [workType, setWorkType] = useState(existingBranch?.work_type ?? "");
  const [logoUrl, setLogoUrl] = useState(existingBranch?.logo_url ?? "");

  const cityData = cities.find((c) => c.name === city);
  const selectClasses = "text-white hover:bg-white/10 focus:bg-white/10 focus:text-white";

  const resetForm = () => {
    setName("");
    setManager("");
    setPhone("");
    setCity("");
    setDistrict("");
    setPlatform("");
    setPay("");
    setPromo("");
    setSettlement("");
    setMotorcycle("");
    setWorkType("");
    setError(null);
  };

  const handleSubmit = async () => {
    if (!name || !city || !district) {
      setError("지사명, 시/도, 구/군은 필수입니다.");
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      company_id: companyId,
      name,
      manager_name: manager,
      phone,
      city,
      district,
      platform,
      pay_per_delivery: pay,
      promotion: promo,
      settlement_type: settlement,
      motorcycle_option: motorcycle,
      work_type: workType,
      logo_url: logoUrl,
      verified: existingBranch?.verified ?? false,
    };

    try {
      if (isEditMode && existingBranch?.id) {
        // #17 — 수정 모드: update API 호출
        await client.entities.agency_profiles.update({
          id: String(existingBranch.id),
          data: payload,
        });
      } else {
        // 신규 등록
        await client.entities.agency_profiles.create({
          data: {
            ...payload,
            created_at: new Date().toISOString().replace("T", " ").slice(0, 19),
          },
        });
      }
      resetForm();
      onSuccess();
      onClose();
    } catch (err) {
      console.error("지사 저장 실패:", err);
      setError(isEditMode ? "지사 수정에 실패했습니다. 다시 시도해주세요." : "지사 등록에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#1A1A1A] border-b border-[#2A2A2A] p-5 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h3 className="text-lg font-bold">
              {isEditMode ? "지사 정보 수정" : "새 지사 추가"}
            </h3>
            <p className="text-[#6B7280] text-xs mt-0.5">
              {isEditMode
                ? `${companyName} · ${existingBranch?.name ?? ""}를 수정합니다`
                : `${companyName}에 새 지사를 추가합니다`}
            </p>
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

          {/* #18 — 지사 로고 이미지 업로드 */}
          <ImageUpload
            label="지사 로고/이미지 (선택)"
            currentUrl={existingBranch?.logo_url}
            onUpload={(url) => setLogoUrl(url)}
            bucket="sgmatch"
          />


          <div>
            <label className="text-[#9CA3AF] text-sm mb-1.5 block flex items-center gap-1.5">
              <Building2 size={14} /> 지사명 <span className="text-[#E63946]">*</span>
            </label>
            <Input
              placeholder="지사명 입력"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-[#111111] border-[#2A2A2A] text-white rounded-xl"
            />
            <p className="text-[#6B7280] text-xs mt-1">
              표시: <span className="text-amber-400">{companyName} · {name || "지사명"}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[#9CA3AF] text-sm mb-1.5 block flex items-center gap-1.5">
                <User size={14} /> 담당자명
              </label>
              <Input
                placeholder="김담당"
                value={manager}
                onChange={(e) => setManager(e.target.value)}
                className="bg-[#111111] border-[#2A2A2A] text-white rounded-xl"
              />
            </div>
            <div>
              <label className="text-[#9CA3AF] text-sm mb-1.5 block flex items-center gap-1.5">
                <Phone size={14} /> 연락처
              </label>
              <Input
                placeholder="010-1234-5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-[#111111] border-[#2A2A2A] text-white rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="text-[#9CA3AF] text-sm mb-1.5 block">플랫폼</label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="bg-[#111111] border-[#2A2A2A] text-white rounded-xl">
                <SelectValue placeholder="플랫폼 선택" />
              </SelectTrigger>
              <SelectContent className="!bg-[#1A1A1A] border-[#2A2A2A] text-white">
                <SelectItem value="baemin-plus" className={selectClasses}>배민플러스</SelectItem>
                <SelectItem value="coupang-eats-plus" className={selectClasses}>쿠팡이츠플러스</SelectItem>
                <SelectItem value="both" className={selectClasses}>배민플러스 + 쿠팡이츠플러스</SelectItem>
                <SelectItem value="other" className={selectClasses}>기타</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[#9CA3AF] text-sm mb-1.5 block flex items-center gap-1.5">
                <MapPin size={14} /> 시/도 <span className="text-[#E63946]">*</span>
              </label>
              <Select
                value={city}
                onValueChange={(v) => {
                  setCity(v);
                  setDistrict("");
                }}
              >
                <SelectTrigger className="bg-[#111111] border-[#2A2A2A] text-white rounded-xl">
                  <SelectValue placeholder="시/도" />
                </SelectTrigger>
                <SelectContent className="!bg-[#1A1A1A] border-[#2A2A2A] text-white">
                  {cities.map((c) => (
                    <SelectItem key={c.name} value={c.name} className={selectClasses}>
                      {c.name}
                    </SelectItem>
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
                  <SelectValue placeholder="구/군" />
                </SelectTrigger>
                <SelectContent className="!bg-[#1A1A1A] border-[#2A2A2A] text-white">
                  {cityData?.regions.map((r) => (
                    <SelectItem key={r.name} value={r.name} className={selectClasses}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-[#9CA3AF] text-sm mb-1.5 block flex items-center gap-1.5">
              <Banknote size={14} /> 건당 단가
            </label>
            <Input
              placeholder="예: 4,200"
              value={pay}
              onChange={(e) => setPay(e.target.value)}
              className="bg-[#111111] border-[#2A2A2A] text-white rounded-xl"
            />
          </div>

          <div>
            <label className="text-[#9CA3AF] text-sm mb-1.5 block flex items-center gap-1.5">
              <Gift size={14} /> 프로모션
            </label>
            <Input
              placeholder="예: 가입 보너스 ₩200,000"
              value={promo}
              onChange={(e) => setPromo(e.target.value)}
              className="bg-[#111111] border-[#2A2A2A] text-white rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[#9CA3AF] text-sm mb-1.5 block">정산 방식</label>
              <Select value={settlement} onValueChange={setSettlement}>
                <SelectTrigger className="bg-[#111111] border-[#2A2A2A] text-white rounded-xl">
                  <SelectValue placeholder="선택" />
                </SelectTrigger>
                <SelectContent className="!bg-[#1A1A1A] border-[#2A2A2A] text-white">
                  <SelectItem value="nextday" className={selectClasses}>익일지급</SelectItem>
                  <SelectItem value="weekly" className={selectClasses}>주급</SelectItem>
                  <SelectItem value="nextday-or-weekly" className={selectClasses}>익일/주급</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[#9CA3AF] text-sm mb-1.5 block flex items-center gap-1.5">
                <Wrench size={14} /> 오토바이
              </label>
              <Select value={motorcycle} onValueChange={setMotorcycle}>
                <SelectTrigger className="bg-[#111111] border-[#2A2A2A] text-white rounded-xl">
                  <SelectValue placeholder="선택" />
                </SelectTrigger>
                <SelectContent className="!bg-[#1A1A1A] border-[#2A2A2A] text-white">
                  <SelectItem value="lease" className={selectClasses}>리스</SelectItem>
                  <SelectItem value="rental" className={selectClasses}>렌탈</SelectItem>
                  <SelectItem value="both" className={selectClasses}>리스+렌탈</SelectItem>
                  <SelectItem value="none" className={selectClasses}>미제공</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-[#9CA3AF] text-sm mb-1.5 block flex items-center gap-1.5">
              <Clock size={14} /> 유형
            </label>
            <Input
              placeholder="예: 프리, 전업, 주간, 야간"
              value={workType}
              onChange={(e) => setWorkType(e.target.value)}
              className="bg-[#111111] border-[#2A2A2A] text-white rounded-xl"
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-[#1A1A1A] border-t border-[#2A2A2A] p-5 rounded-b-2xl">
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full bg-[#E63946] hover:bg-[#FF4D5A] text-white font-bold rounded-xl py-5 gap-2"
          >
            {saving ? (
              <>
                <Loader2 size={18} className="animate-spin" /> 저장 중...
              </>
            ) : (
              <>
                <CheckCircle2 size={18} /> {isEditMode ? "수정 완료" : "지사 등록"}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}