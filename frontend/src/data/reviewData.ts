export interface Review {
  id: string;
  riderName: string;
  agencyName: string;
  rating: number;
  comment: string;
  tags: string[];
  createdAt: string;
  verified: boolean;
}

export const reviewTags = [
  { key: "fast-settlement", label: "빠른 정산 💰", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  { key: "good-communication", label: "소통 원활 💬", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { key: "kind-management", label: "친절한 관리 😊", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  { key: "fair-pay", label: "공정한 단가 ⚖️", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  { key: "good-environment", label: "좋은 근무환경 🏢", color: "bg-teal-500/20 text-teal-400 border-teal-500/30" },
  { key: "flexible-schedule", label: "유연한 스케줄 🕐", color: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" },
];

// 리뷰 데이터 (실제 리뷰는 백엔드에서 불러옴)
export const existingReviews: Review[] = [];

// 지사별 평균 별점 및 태그 계산
export function getAgencyStats(agencyName: string) {
  const reviews = existingReviews.filter((r) => r.agencyName === agencyName);
  if (reviews.length === 0) return null;

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  // 태그 빈도 계산
  const tagCounts: Record<string, number> = {};
  reviews.forEach((r) => {
    r.tags.forEach((t) => {
      tagCounts[t] = (tagCounts[t] || 0) + 1;
    });
  });

  // 가장 많이 언급된 태그 상위 3개
  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([key]) => key);

  return {
    avgRating: Math.round(avgRating * 10) / 10,
    reviewCount: reviews.length,
    topTags,
    reviews,
  };
}