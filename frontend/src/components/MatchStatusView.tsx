import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  Search,
  Eye,
  XCircle,
  MapPin,
  Banknote,
  User,
  Bike,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MatchRecord, MatchStatus } from "@/data/matchData";
import { statusConfig } from "@/data/matchData";
import MatchModal from "./MatchModal";
import { client } from "@/lib/api";

interface MatchStatusViewProps {
  matches: MatchRecord[];
  type: "rider" | "agency";
  onStatusChange?: () => void; // 상태 변경 후 부모 컴포넌트 갱신
}

const stepIcons = [Search, Eye, CheckCircle2];
const stepLabels = ["지원 완료", "검토 중", "매칭 완료"];

function ProgressBar({ status }: { status: MatchStatus }) {
  const config = statusConfig[status];
  if (status === "rejected") {
    return (
      <div className="flex items-center gap-2 mt-3">
        <XCircle size={16} className="text-red-400" />
        <span className="text-red-400 text-xs font-medium">미선택</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 mt-4">
      {stepIcons.map((Icon, i) => {
        const active = i < config.step;
        const current = i === config.step - 1;
        return (
          <div key={i} className="flex items-center">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                active
                  ? current
                    ? `${config.bgColor} ${config.color} border`
                    : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-[#2A2A2A]/50 text-[#6B7280] border border-[#2A2A2A]"
              }`}
            >
              <Icon size={12} />
              {stepLabels[i]}
            </div>
            {i < stepIcons.length - 1 && (
              <ChevronRight size={14} className="text-[#3A3A3A] mx-0.5" />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function MatchStatusView({
  matches,
  type,
  onStatusChange,
}: MatchStatusViewProps) {
  const [selectedMatch, setSelectedMatch] = useState<MatchRecord | null>(null);
  const [filter, setFilter] = useState<MatchStatus | "all">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filtered =
    filter === "all" ? matches : matches.filter((m) => m.status === filter);

  const counts = {
    all: matches.length,
    pending: matches.filter((m) => m.status === "pending").length,
    reviewing: matches.filter((m) => m.status === "reviewing").length,
    matched: matches.filter((m) => m.status === "matched").length,
    rejected: matches.filter((m) => m.status === "rejected").length,
  };

  // #14 — 지사 관점: 수락/거절 처리
  const handleAccept = async (matchId: string) => {
    if (!confirm("이 라이더를 수락하시겠습니까?")) return;
    setUpdatingId(matchId);
    try {
      await client.entities.applications.update({
        id: matchId,
        data: {
          status: "matched",
          updated_at: new Date().toISOString(),
        },
      });
      onStatusChange?.();
    } catch (err) {
      console.error("수락 처리 실패:", err);
      alert("수락 처리 중 오류가 발생했습니다.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReject = async (matchId: string) => {
    if (!confirm("이 라이더를 거절하시겠습니까?")) return;
    setUpdatingId(matchId);
    try {
      await client.entities.applications.update({
        id: matchId,
        data: {
          status: "rejected",
          updated_at: new Date().toISOString(),
        },
      });
      onStatusChange?.();
    } catch (err) {
      console.error("거절 처리 실패:", err);
      alert("거절 처리 중 오류가 발생했습니다.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      {/* 필터 탭 */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(
          [
            { key: "all", label: "전체" },
            { key: "pending", label: "지원 완료" },
            { key: "reviewing", label: "검토 중" },
            { key: "matched", label: "매칭 완료" },
            { key: "rejected", label: "미선택" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === tab.key
                ? "bg-[#E63946] text-white"
                : "bg-[#1A1A1A] text-[#9CA3AF] border border-[#2A2A2A] hover:border-[#E63946]/50"
            }`}
          >
            {tab.label} ({counts[tab.key]})
          </button>
        ))}
      </div>

      {/* 매칭 카드 목록 */}
      {filtered.length === 0 ? (
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-12 text-center">
          <Clock size={48} className="text-[#2A2A2A] mx-auto mb-4" />
          <h4 className="text-lg font-bold mb-2">해당 상태의 매칭이 없습니다</h4>
          <p className="text-[#6B7280] text-sm">다른 필터를 선택해보세요.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((m) => {
            const config = statusConfig[m.status];
            const isUpdating = updatingId === m.id;
            const canAct =
              type === "agency" &&
              (m.status === "pending" || m.status === "reviewing");
            return (
              <div
                key={m.id}
                className={`bg-[#1A1A1A] border rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 ${
                  m.status === "matched"
                    ? "border-emerald-500/30 hover:border-emerald-500/50"
                    : "border-[#2A2A2A] hover:border-[#E63946]/30"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-bold text-lg">
                        {type === "rider" ? m.agencyName : m.riderName}
                      </h4>
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full border ${config.bgColor} ${config.color}`}
                      >
                        {config.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-[#9CA3AF]">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {m.city} {m.district}
                      </span>
                      {type === "rider" && m.pay && (
                        <span className="flex items-center gap-1">
                          <Banknote size={12} />
                          {m.pay}
                        </span>
                      )}
                      {type === "agency" && m.experience && (
                        <span className="flex items-center gap-1">
                          <User size={12} />
                          경력 {m.experience}
                        </span>
                      )}
                      {type === "agency" && m.motorcycle !== undefined && (
                        <span className="flex items-center gap-1">
                          <Bike size={12} />
                          오토바이 {m.motorcycle ? "보유" : "미보유"}
                        </span>
                      )}
                    </div>

                    <ProgressBar status={m.status} />
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <p className="text-[10px] text-[#6B7280]">
                      지원일: {m.appliedAt}
                    </p>

                    {/* 라이더 관점: 상세 보기 */}
                    {m.status === "matched" && type === "rider" && (
                      <Button
                        onClick={() => setSelectedMatch(m)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm px-4"
                      >
                        상세 보기
                      </Button>
                    )}

                    {/* #14 — 지사 관점: 수락 / 거절 버튼 */}
                    {canAct && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleAccept(m.id)}
                          disabled={isUpdating}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs px-3 h-8 gap-1"
                        >
                          {isUpdating ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <ThumbsUp size={12} />
                          )}
                          수락
                        </Button>
                        <Button
                          onClick={() => handleReject(m.id)}
                          disabled={isUpdating}
                          variant="outline"
                          className="!bg-transparent border-red-500/40 text-red-400 hover:border-red-400 hover:text-red-300 font-bold rounded-xl text-xs px-3 h-8 gap-1"
                        >
                          {isUpdating ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <ThumbsDown size={12} />
                          )}
                          거절
                        </Button>
                      </div>
                    )}

                    {m.status === "matched" && type === "agency" && (
                      <Button
                        onClick={() => setSelectedMatch(m)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm px-4"
                      >
                        상세 보기
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 매칭 완료 모달 */}
      <MatchModal
        match={selectedMatch}
        type={type}
        onClose={() => setSelectedMatch(null)}
      />
    </div>
  );
}