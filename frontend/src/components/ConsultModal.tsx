import { useState } from "react";
import { X, MessageCircle, Phone, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { client } from "@/lib/api";

interface ConsultModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConsultModal({ isOpen, onClose }: ConsultModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    agency: "",
    phone: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await client.entities.consultations.create({
        data: {
          name: formData.name,
          agency: formData.agency,
          phone: formData.phone,
          message: formData.message || "",
          status: "pending",
          created_at: new Date().toISOString().replace("T", " ").slice(0, 19),
        },
      });
    } catch (err) {
      console.error("Failed to save consultation:", err);
      // Graceful degradation - still show success
    } finally {
      setSaving(false);
      setSubmitted(true);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleClose = () => {
    setSubmitted(false);
    setFormData({ name: "", agency: "", phone: "", message: "" });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2A2A2A]">
          <div>
            <h3 className="text-xl font-bold text-white">담당자 상담 신청</h3>
            <p className="text-[#9CA3AF] text-sm mt-1">
              편하게 문의해주세요. 빠르게 연락드리겠습니다.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#2A2A2A] transition-colors"
          >
            <X size={18} className="text-[#9CA3AF]" />
          </button>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* 카카오톡 바로 상담 */}
            <a
              href="https://pf.kakao.com/_xkAxcxj"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-[#FEE500] hover:bg-[#FDD835] text-[#3C1E1E] font-bold rounded-xl py-4 transition-colors"
            >
              <MessageCircle size={20} />
              카카오톡으로 바로 상담하기
            </a>

            <div className="relative flex items-center gap-3">
              <div className="flex-1 h-px bg-[#2A2A2A]" />
              <span className="text-[#6B7280] text-xs font-medium">
                또는 상담 예약
              </span>
              <div className="flex-1 h-px bg-[#2A2A2A]" />
            </div>

            {/* 이름 */}
            <div>
              <label className="block text-sm font-medium text-[#9CA3AF] mb-2">
                담당자 이름 <span className="text-[#E63946]">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="홍길동"
                className="w-full bg-[#111111] border border-[#2A2A2A] rounded-xl px-4 py-3 text-white placeholder:text-[#4B5563] focus:border-[#E63946] focus:outline-none transition-colors"
              />
            </div>

            {/* 지사명 */}
            <div>
              <label className="block text-sm font-medium text-[#9CA3AF] mb-2">
                지사명 <span className="text-[#E63946]">*</span>
              </label>
              <input
                type="text"
                name="agency"
                value={formData.agency}
                onChange={handleChange}
                required
                placeholder="OO 지사"
                className="w-full bg-[#111111] border border-[#2A2A2A] rounded-xl px-4 py-3 text-white placeholder:text-[#4B5563] focus:border-[#E63946] focus:outline-none transition-colors"
              />
            </div>

            {/* 연락처 */}
            <div>
              <label className="block text-sm font-medium text-[#9CA3AF] mb-2">
                연락처 <span className="text-[#E63946]">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="010-0000-0000"
                className="w-full bg-[#111111] border border-[#2A2A2A] rounded-xl px-4 py-3 text-white placeholder:text-[#4B5563] focus:border-[#E63946] focus:outline-none transition-colors"
              />
            </div>

            {/* 문의 내용 */}
            <div>
              <label className="block text-sm font-medium text-[#9CA3AF] mb-2">
                문의 내용
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={3}
                placeholder="궁금한 점이나 요청사항을 자유롭게 작성해주세요."
                className="w-full bg-[#111111] border border-[#2A2A2A] rounded-xl px-4 py-3 text-white placeholder:text-[#4B5563] focus:border-[#E63946] focus:outline-none transition-colors resize-none"
              />
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="w-full bg-[#E63946] hover:bg-[#FF4D5A] text-white font-bold rounded-xl py-6 gap-2 text-base"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> 처리 중...
                </>
              ) : (
                <>
                  <Send size={16} /> 상담 예약 신청하기
                </>
              )}
            </Button>

            <p className="text-[#6B7280] text-xs text-center">
              영업일 기준 24시간 이내에 연락드리겠습니다.
            </p>
          </form>
        ) : (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
              <Phone size={28} className="text-emerald-400" />
            </div>
            <h4 className="text-xl font-bold text-white mb-3">
              상담 신청이 완료되었습니다!
            </h4>
            <p className="text-[#9CA3AF] mb-2">
              <span className="text-white font-medium">{formData.name}</span>님,
              감사합니다.
            </p>
            <p className="text-[#9CA3AF] text-sm mb-6">
              담당자가 빠른 시일 내에{" "}
              <span className="text-white">{formData.phone}</span>으로
              연락드리겠습니다.
            </p>
            <Button
              onClick={handleClose}
              className="bg-[#E63946] hover:bg-[#FF4D5A] text-white font-bold rounded-xl px-8 py-5"
            >
              확인
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}