import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HelpCircle, ArrowLeft } from "lucide-react";

/** 고객지원 페이지 (준비 중) */
export default function RiderSupport() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <div className="w-20 h-20 bg-[#E63946]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <HelpCircle size={40} className="text-[#E63946]" />
        </div>
        <h1 className="text-2xl font-bold mb-3">고객지원</h1>
        <p className="text-[#6B7280] mb-2">문의사항이 있으시면 아래로 연락해주세요.</p>
        <p className="text-sm text-[#9CA3AF] mb-1">📧 support@sgmatch.co.kr</p>
        <p className="text-sm text-[#9CA3AF] mb-8">⏰ 평일 09:00 ~ 18:00</p>
        <Button
          onClick={() => navigate("/rider")}
          className="bg-[#E63946] hover:bg-[#FF4D5A] text-white font-bold rounded-xl px-6"
        >
          <ArrowLeft size={16} className="mr-2" />
          대시보드로 돌아가기
        </Button>
      </div>
    </div>
  );
}
