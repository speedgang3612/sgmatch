import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function RiderRegister() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-20 h-20 bg-[#22C55E]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="text-[#22C55E]" size={40} />
            </div>
            <h2 className="text-3xl font-bold mb-3">등록 완료!</h2>
            <p className="text-[#9CA3AF] text-lg mb-2">라이더 등록이 완료되었습니다.</p>
            <p className="text-[#9CA3AF]">조건에 맞는 지사에서 곧 연락드립니다.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <Navbar />

      <div className="pt-24 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#E63946]/10 border border-[#E63946]/30 rounded-full px-4 py-2 mb-6">
              <span className="text-[#E63946] text-sm font-medium">🏍️ 라이더 등록</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              라이더로 <span className="text-[#E63946]">시작하기</span>
            </h1>
            <p className="text-[#9CA3AF] text-lg">
              간단한 정보만 입력하면 조건에 맞는 지사를 연결해드립니다
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-2xl p-6 sm:p-10 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-white font-medium">이름</Label>
                <Input
                  required
                  placeholder="홍길동"
                  className="bg-[#141414] border-[#2A2A2A] text-white placeholder:text-[#555] focus:border-[#E63946] focus:ring-[#E63946]/20 rounded-xl h-12"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white font-medium">연락처</Label>
                <Input
                  required
                  type="tel"
                  placeholder="010-1234-5678"
                  className="bg-[#141414] border-[#2A2A2A] text-white placeholder:text-[#555] focus:border-[#E63946] focus:ring-[#E63946]/20 rounded-xl h-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white font-medium">활동 지역</Label>
              <Select required>
                <SelectTrigger className="bg-[#141414] border-[#2A2A2A] text-white focus:border-[#E63946] focus:ring-[#E63946]/20 rounded-xl h-12">
                  <SelectValue placeholder="지역을 선택하세요" />
                </SelectTrigger>
                <SelectContent className="bg-[#1C1C1C] border-[#2A2A2A]">
                  {["서울 은평구", "서울 마포구", "서울 서대문구", "서울 용산구", "서울 강서구", "서울 영등포구", "경기 고양시", "경기 파주시", "인천"].map((r) => (
                    <SelectItem key={r} value={r} className="text-white hover:bg-white/10">{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-white font-medium">배달 경력</Label>
                <Select>
                  <SelectTrigger className="bg-[#141414] border-[#2A2A2A] text-white focus:border-[#E63946] focus:ring-[#E63946]/20 rounded-xl h-12">
                    <SelectValue placeholder="경력 선택" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1C1C1C] border-[#2A2A2A]">
                    <SelectItem value="beginner" className="text-white hover:bg-white/10">초보 (경험 없음)</SelectItem>
                    <SelectItem value="6months" className="text-white hover:bg-white/10">6개월 미만</SelectItem>
                    <SelectItem value="1year" className="text-white hover:bg-white/10">6개월 ~ 1년</SelectItem>
                    <SelectItem value="over1year" className="text-white hover:bg-white/10">1년 이상</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-white font-medium">오토바이 보유</Label>
                <Select>
                  <SelectTrigger className="bg-[#141414] border-[#2A2A2A] text-white focus:border-[#E63946] focus:ring-[#E63946]/20 rounded-xl h-12">
                    <SelectValue placeholder="보유 여부" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1C1C1C] border-[#2A2A2A]">
                    <SelectItem value="yes" className="text-white hover:bg-white/10">보유</SelectItem>
                    <SelectItem value="no" className="text-white hover:bg-white/10">없음 (리스/렌트 희망)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-white font-medium">희망 근무 형태</Label>
                <Select>
                  <SelectTrigger className="bg-[#141414] border-[#2A2A2A] text-white focus:border-[#E63946] focus:ring-[#E63946]/20 rounded-xl h-12">
                    <SelectValue placeholder="근무 형태" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1C1C1C] border-[#2A2A2A]">
                    <SelectItem value="day" className="text-white hover:bg-white/10">주간</SelectItem>
                    <SelectItem value="night" className="text-white hover:bg-white/10">야간</SelectItem>
                    <SelectItem value="full" className="text-white hover:bg-white/10">풀타임</SelectItem>
                    <SelectItem value="flexible" className="text-white hover:bg-white/10">유동적</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-white font-medium">즉시 근무 가능</Label>
                <Select>
                  <SelectTrigger className="bg-[#141414] border-[#2A2A2A] text-white focus:border-[#E63946] focus:ring-[#E63946]/20 rounded-xl h-12">
                    <SelectValue placeholder="가능 여부" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1C1C1C] border-[#2A2A2A]">
                    <SelectItem value="yes" className="text-white hover:bg-white/10">즉시 가능</SelectItem>
                    <SelectItem value="negotiate" className="text-white hover:bg-white/10">협의 필요</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#E63946] hover:bg-[#FF4D5A] text-white rounded-xl py-6 text-lg font-bold mt-4"
            >
              라이더 등록하기
            </Button>

            <p className="text-center text-[#9CA3AF] text-xs">
              등록 후 조건에 맞는 지사에서 연락드립니다. 무료 서비스입니다.
            </p>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}