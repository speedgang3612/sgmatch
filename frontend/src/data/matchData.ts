// 매칭 상태 타입
export type MatchStatus = "pending" | "reviewing" | "matched" | "rejected";

export interface MatchRecord {
  id: string;
  riderName: string;
  agencyName: string;
  city: string;
  district: string;
  status: MatchStatus;
  appliedAt: string;
  updatedAt: string;
  pay?: string;
  settlement?: string;
  phone?: string;
  experience?: string;
  motorcycle?: boolean;
}

export interface Notification {
  id: string;
  type: "match" | "review" | "info" | "welcome";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

// 라이더 관점 매칭 데이터 (실제 매칭 시 백엔드에서 불러옴)
export const riderMatches: MatchRecord[] = [];

// 지사 관점 매칭 데이터 (실제 매칭 시 백엔드에서 불러옴)
export const agencyMatches: MatchRecord[] = [];

// 라이더 알림 (실제 알림은 백엔드에서 불러옴)
export const riderNotifications: Notification[] = [
  {
    id: "n1",
    type: "welcome",
    title: "환영합니다! 🎉",
    message: "SpeedGang Match에 가입해주셔서 감사합니다. 지역을 선택하고 지사를 찾아보세요.",
    time: "",
    read: false,
  },
];

// 지사 알림 (실제 알림은 백엔드에서 불러옴)
export const agencyNotifications: Notification[] = [
  {
    id: "an1",
    type: "welcome",
    title: "환영합니다! 🎉",
    message: "SpeedGang Match에 가입해주셔서 감사합니다. 채용 공고를 등록하고 라이더를 모집하세요.",
    time: "",
    read: false,
  },
];

export const statusConfig: Record<
  MatchStatus,
  { label: string; color: string; bgColor: string; step: number }
> = {
  pending: {
    label: "지원 완료",
    color: "text-blue-400",
    bgColor: "bg-blue-500/20 border-blue-500/30",
    step: 1,
  },
  reviewing: {
    label: "검토 중",
    color: "text-amber-400",
    bgColor: "bg-amber-500/20 border-amber-500/30",
    step: 2,
  },
  matched: {
    label: "매칭 완료",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/20 border-emerald-500/30",
    step: 3,
  },
  rejected: {
    label: "미선택",
    color: "text-red-400",
    bgColor: "bg-red-500/20 border-red-500/30",
    step: 0,
  },
};