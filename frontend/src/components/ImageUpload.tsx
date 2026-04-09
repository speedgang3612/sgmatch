/**
 * ImageUpload — 프로필/지사 이미지 업로드 컴포넌트
 *
 * 흐름:
 *   1. 사용자가 이미지를 선택
 *   2. POST /api/v1/storage/upload-url 로 Presigned URL 요청
 *   3. Presigned URL로 파일을 직접 PUT
 *   4. 반환된 access_url을 onUpload 콜백으로 전달
 *
 * OSS 미설정 시: 서버 500 → 안전한 에러 메시지 표시
 */
import { useState, useRef } from "react";
import { ImagePlus, X, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { getAPIBaseURL } from "@/lib/config";

interface ImageUploadProps {
  /** 업로드 성공 시 access_url 전달 */
  onUpload: (url: string) => void;
  /** 현재 이미지 URL (기존 이미지 표시) */
  currentUrl?: string;
  /** 버킷 이름 (기본값: "sgmatch") */
  bucket?: string;
  /** 최대 파일 크기 (bytes, 기본값: 5MB) */
  maxSize?: number;
  /** 컴포넌트 라벨 */
  label?: string;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function ImageUpload({
  onUpload,
  currentUrl,
  bucket = "sgmatch",
  maxSize = 5 * 1024 * 1024, // 5MB
  label = "이미지 업로드",
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 유효성 검사
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("JPG, PNG, WebP 이미지만 업로드 가능합니다.");
      return;
    }
    if (file.size > maxSize) {
      setError(`파일 크기는 ${Math.round(maxSize / 1024 / 1024)}MB 이하여야 합니다.`);
      return;
    }

    setError(null);
    setDone(false);

    // 로컬 미리보기
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    setUploading(true);
    try {
      const objectKey = `uploads/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

      // Step 1: Presigned URL 요청
      const presignRes = await fetch(`${getAPIBaseURL()}/api/v1/storage/upload-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ bucket, key: objectKey }),
      });

      if (!presignRes.ok) {
        const status = presignRes.status;
        if (status === 500 || status === 503) {
          throw new Error(
            "이미지 저장소가 설정되지 않았습니다. 관리자에게 OSS 설정을 요청해 주세요."
          );
        }
        throw new Error(`업로드 URL 발급 실패 (${status})`);
      }

      const { upload_url, access_url } = await presignRes.json();

      // Step 2: Presigned URL로 파일 직접 PUT
      const uploadRes = await fetch(upload_url, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error(`파일 업로드 실패 (${uploadRes.status})`);
      }

      setDone(true);
      onUpload(access_url);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "업로드 중 오류가 발생했습니다.";
      setError(msg);
      // 미리보기는 유지 (사용자가 선택한 파일을 볼 수 있도록)
    } finally {
      setUploading(false);
      // input 초기화 (같은 파일 재선택 허용)
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setDone(false);
    setError(null);
    onUpload("");
  };

  return (
    <div className="space-y-2">
      <p className="text-[#9CA3AF] text-sm flex items-center gap-1.5">
        <ImagePlus size={14} />
        {label}
      </p>

      {/* 이미지 미리보기 or 업로드 영역 */}
      <div className="relative">
        {preview ? (
          <div className="relative w-full h-40 rounded-xl overflow-hidden border border-[#2A2A2A] group">
            <img
              src={preview}
              alt="미리보기"
              className="w-full h-full object-cover"
            />
            {/* 오버레이: 업로드 중 */}
            {uploading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Loader2 size={28} className="animate-spin text-white" />
              </div>
            )}
            {/* 완료 배지 */}
            {done && !uploading && (
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-emerald-500/90 text-white text-xs font-bold px-2 py-1 rounded-full">
                <CheckCircle2 size={12} /> 업로드 완료
              </div>
            )}
            {/* 삭제 버튼 */}
            {!uploading && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 left-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center hover:bg-[#E63946] transition-colors opacity-0 group-hover:opacity-100"
              >
                <X size={14} className="text-white" />
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-full h-28 border-2 border-dashed border-[#2A2A2A] hover:border-[#E63946]/50 rounded-xl flex flex-col items-center justify-center gap-2 text-[#6B7280] hover:text-[#9CA3AF] transition-all duration-200 group"
          >
            <ImagePlus size={24} className="group-hover:text-[#E63946] transition-colors" />
            <span className="text-xs">클릭하여 이미지 선택</span>
            <span className="text-[10px] text-[#4B5563]">JPG · PNG · WebP · 최대 5MB</span>
          </button>
        )}

        {/* 이미지 있을 때 교체 버튼 */}
        {preview && !uploading && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-2 w-full text-xs text-[#6B7280] hover:text-white transition-colors text-center"
          >
            이미지 교체
          </button>
        )}
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
          <AlertCircle size={14} className="text-amber-400 mt-0.5 shrink-0" />
          <p className="text-amber-400 text-xs leading-relaxed">{error}</p>
        </div>
      )}

      {/* 숨겨진 파일 입력 */}
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
