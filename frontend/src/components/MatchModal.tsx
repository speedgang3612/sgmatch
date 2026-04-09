import { useEffect, useState } from "react";
import { X, PartyPopper, MapPin, Phone, Banknote, Clock, User, Bike } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MatchRecord } from "@/data/matchData";

interface MatchModalProps {
  match: MatchRecord | null;
  type: "rider" | "agency";
  onClose: () => void;
}

export default function MatchModal({ match, type, onClose }: MatchModalProps) {
  const [show, setShow] = useState(false);
  const [confetti, setConfetti] = useState(true);

  useEffect(() => {
    if (match) {
      setShow(true);
      setConfetti(true);
      const timer = setTimeout(() => setConfetti(false), 3000);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [match]);

  if (!match || !show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Confetti particles */}
      {confetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: [
                  "#E63946",
                  "#FFD700",
                  "#00FF88",
                  "#4DA6FF",
                  "#FF6B9D",
                  "#A855F7",
                ][i % 6],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`,
                opacity: 0.8,
              }}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <div className="relative bg-[#1A1A1A] border border-[#2A2A2A] rounded-3xl w-full max-w-md p-8 animate-in zoom-in-95 duration-300 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#6B7280] hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <PartyPopper size={40} className="text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">매칭 완료! 🎉</h2>
          <p className="text-[#9CA3AF] text-sm">
            {type === "rider"
              ? `${match.agencyName} 지사와 매칭되었습니다!`
              : `${match.riderName} 라이더와 매칭되었습니다!`}
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-5 mb-6 space-y-3">
          {type === "rider" ? (
            <>
              <div className="flex items-center gap-3">
                <User size={16} className="text-[#E63946]" />
                <span className="text-[#6B7280] text-sm">지사명</span>
                <span className="ml-auto font-semibold">{match.agencyName}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-[#E63946]" />
                <span className="text-[#6B7280] text-sm">지역</span>
                <span className="ml-auto font-semibold">
                  {match.city} {match.district}
                </span>
              </div>
              {match.pay && (
                <div className="flex items-center gap-3">
                  <Banknote size={16} className="text-[#E63946]" />
                  <span className="text-[#6B7280] text-sm">건당 단가</span>
                  <span className="ml-auto font-semibold text-emerald-400">
                    {match.pay}
                  </span>
                </div>
              )}
              {match.settlement && (
                <div className="flex items-center gap-3">
                  <Clock size={16} className="text-[#E63946]" />
                  <span className="text-[#6B7280] text-sm">정산 방식</span>
                  <span className="ml-auto font-semibold">{match.settlement}</span>
                </div>
              )}
              {match.phone && (
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-[#E63946]" />
                  <span className="text-[#6B7280] text-sm">연락처</span>
                  <span className="ml-auto font-semibold text-[#E63946]">
                    {match.phone}
                  </span>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <User size={16} className="text-[#E63946]" />
                <span className="text-[#6B7280] text-sm">라이더</span>
                <span className="ml-auto font-semibold">{match.riderName}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-[#E63946]" />
                <span className="text-[#6B7280] text-sm">지역</span>
                <span className="ml-auto font-semibold">
                  {match.city} {match.district}
                </span>
              </div>
              {match.experience && (
                <div className="flex items-center gap-3">
                  <Clock size={16} className="text-[#E63946]" />
                  <span className="text-[#6B7280] text-sm">경력</span>
                  <span className="ml-auto font-semibold">{match.experience}</span>
                </div>
              )}
              {match.motorcycle !== undefined && (
                <div className="flex items-center gap-3">
                  <Bike size={16} className="text-[#E63946]" />
                  <span className="text-[#6B7280] text-sm">오토바이</span>
                  <span
                    className={`ml-auto font-semibold ${
                      match.motorcycle ? "text-emerald-400" : "text-[#6B7280]"
                    }`}
                  >
                    {match.motorcycle ? "보유" : "미보유"}
                  </span>
                </div>
              )}
              {match.phone && (
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-[#E63946]" />
                  <span className="text-[#6B7280] text-sm">연락처</span>
                  <span className="ml-auto font-semibold text-[#E63946]">
                    {match.phone}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Dates */}
        <div className="flex justify-between text-xs text-[#6B7280] mb-6">
          <span>지원일: {match.appliedAt}</span>
          <span>매칭일: {match.updatedAt}</span>
        </div>

        <Button
          onClick={onClose}
          className="w-full bg-[#E63946] hover:bg-[#FF4D5A] text-white font-bold rounded-xl h-12 text-base"
        >
          확인
        </Button>
      </div>
    </div>
  );
}