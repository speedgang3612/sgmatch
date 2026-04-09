import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, ArrowLeft } from "lucide-react";

/** 지원 내역 페이지 (준비 중) */
export default function RiderApplications() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <div className="w-20 h-20 bg-[#E63946]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <FileText size={40} className="text-[#E63946]" />
        </div>
        <h1 className="text-2xl font-bold mb-3">지원 내역</h1>
        <p className="text-[#6B7280] mb-2">지원한 지사의 상태를 확인할 수 있습니다.</p>
        <p className="text-[#E63946] text-sm font-medium mb-8">🚧 기능 준비 중</p>
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
