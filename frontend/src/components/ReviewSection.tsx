import { useState } from "react";
import { Star, ShieldCheck, MessageSquare, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { reviewTags, existingReviews, type Review } from "@/data/reviewData";

interface ReviewSectionProps {
  agencyName: string;
  canWrite: boolean; // 매칭된 지사인 경우만 true
}

function StarRating({
  rating,
  interactive = false,
  onChange,
  size = 16,
}: {
  rating: number;
  interactive?: boolean;
  onChange?: (r: number) => void;
  size?: number;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(i)}
          onMouseEnter={() => interactive && setHover(i)}
          onMouseLeave={() => interactive && setHover(0)}
          className={interactive ? "cursor-pointer" : "cursor-default"}
        >
          <Star
            size={size}
            className={`transition-colors ${
              i <= (hover || rating)
                ? "text-amber-400 fill-amber-400"
                : "text-[#3A3A3A]"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function ReviewSection({ agencyName, canWrite }: ReviewSectionProps) {
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [localReviews, setLocalReviews] = useState<Review[]>(
    existingReviews.filter((r) => r.agencyName === agencyName)
  );
  const [submitted, setSubmitted] = useState(false);

  const avgRating =
    localReviews.length > 0
      ? Math.round(
          (localReviews.reduce((sum, r) => sum + r.rating, 0) /
            localReviews.length) *
            10
        ) / 10
      : 0;

  const toggleTag = (key: string) => {
    setSelectedTags((prev) =>
      prev.includes(key) ? prev.filter((t) => t !== key) : [...prev, key]
    );
  };

  const handleSubmit = () => {
    if (newRating === 0) return;
    const review: Review = {
      id: `new-${Date.now()}`,
      riderName: "나",
      agencyName,
      rating: newRating,
      comment: newComment,
      tags: selectedTags,
      createdAt: new Date().toISOString().split("T")[0],
      verified: true,
    };
    setLocalReviews((prev) => [review, ...prev]);
    setShowWriteForm(false);
    setNewRating(0);
    setNewComment("");
    setSelectedTags([]);
    setSubmitted(true);
  };

  return (
    <div className="mt-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <MessageSquare size={18} className="text-[#E63946]" />
          <h4 className="font-bold">라이더 리뷰</h4>
          {localReviews.length > 0 && (
            <div className="flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-1 rounded-full">
              <Star size={12} className="text-amber-400 fill-amber-400" />
              <span className="text-amber-400 text-xs font-bold">{avgRating}</span>
              <span className="text-[#6B7280] text-xs">({localReviews.length})</span>
            </div>
          )}
        </div>
        {canWrite && !submitted && (
          <Button
            onClick={() => setShowWriteForm(!showWriteForm)}
            className="bg-[#E63946] hover:bg-[#FF4D5A] text-white font-bold rounded-xl text-xs px-3 py-1.5 h-auto"
          >
            {showWriteForm ? "취소" : "리뷰 쓰기"}
          </Button>
        )}
        {submitted && (
          <span className="text-emerald-400 text-xs font-medium">✅ 리뷰 등록 완료</span>
        )}
      </div>

      {/* 리뷰 작성 폼 */}
      {showWriteForm && (
        <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-5 mb-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-4">
            <h5 className="font-semibold text-sm">리뷰 작성</h5>
            <button onClick={() => setShowWriteForm(false)}>
              <X size={16} className="text-[#6B7280] hover:text-white" />
            </button>
          </div>

          {/* 별점 */}
          <div className="mb-4">
            <p className="text-xs text-[#6B7280] mb-2">별점을 선택하세요</p>
            <StarRating rating={newRating} interactive onChange={setNewRating} size={24} />
          </div>

          {/* 카테고리 태그 */}
          <div className="mb-4">
            <p className="text-xs text-[#6B7280] mb-2">해당하는 항목을 선택하세요 (선택사항)</p>
            <div className="flex flex-wrap gap-2">
              {reviewTags.map((tag) => (
                <button
                  key={tag.key}
                  onClick={() => toggleTag(tag.key)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                    selectedTags.includes(tag.key)
                      ? tag.color
                      : "bg-[#1A1A1A] text-[#6B7280] border-[#2A2A2A] hover:border-[#3A3A3A]"
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          {/* 코멘트 */}
          <div className="mb-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="간단한 리뷰를 작성해주세요 (선택사항)"
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-3 text-sm text-white placeholder-[#4B5563] resize-none h-20 focus:outline-none focus:border-[#E63946]/50"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={newRating === 0}
            className="w-full bg-[#E63946] hover:bg-[#FF4D5A] text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed gap-2"
          >
            <Send size={14} /> 리뷰 등록
          </Button>
        </div>
      )}

      {/* 리뷰 목록 */}
      {localReviews.length === 0 ? (
        <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-6 text-center">
          <p className="text-[#6B7280] text-sm">아직 리뷰가 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
          {localReviews.map((review) => (
            <div
              key={review.id}
              className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{review.riderName}</span>
                  {review.verified && (
                    <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                      <ShieldCheck size={10} /> 인증됨
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <StarRating rating={review.rating} size={12} />
                  <span className="text-[10px] text-[#6B7280]">{review.createdAt}</span>
                </div>
              </div>
              {review.comment && (
                <p className="text-sm text-[#9CA3AF] mb-2">{review.comment}</p>
              )}
              {review.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {review.tags.map((tagKey) => {
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}