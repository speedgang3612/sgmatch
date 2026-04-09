import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function BranchRegister() {
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
            <p className="text-[#9CA3AF] text-lg mb-2">지사 등록이 완료되었습니다.</p>
            <p className="text-[#9CA3AF]">검증 후 라이더 매칭을 시작합니다.</p>
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
              <span className="text-[#E63946] text-sm font-medium">🏢 지사 등록</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              지사로 <span className="text-[#E63946]">라이더 모집</span>하기
            </h1>
            <p className="text-[#9CA3AF] text-lg">
              필요한 라이더를 빠르게 모집하세요. 검증된 지원자를 연결해드립니다.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-2xl p-6 sm:p-10 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-white font-medium">지사명</Label>
                <Input
                  required
                  placeholder="OO플러스 은평지사"
                  className="bg-[#141414] border-[#2A2A2A] text-white placeholder:text-[#555] focus:border-[#E63946] focus:ring-[#E63946]/20 rounded-xl h-12"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white font-medium">담당자 이름</Label>
                <Input
                  required
                  placeholder="김담당"
                  className="bg-[#141414] border-[#2A2A2A] text-white placeholder:text-[#555] focus:border-[#E63946] focus:ring-[#E63946]/20 rounded-xl h-12"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-white font-medium">연락처</Label>
                <Input
                  required
                  type="tel"
                  placeholder="010-1234-5678"
                  className="bg-[#141414] border-[#2A2A2A] text-white placeholder:text-[#555] focus:border-[#E63946] focus:ring-[#E63946]/20 rounded-xl h-12"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white font-medium">모집 인원</Label>
                <Select>
                  <SelectTrigger className="bg-[#141414] border-[#2A2A2A] text-white focus:border-[#E63946] focus:ring-[#E63946]/20 rounded-xl h-12">
                    <SelectValue placeholder="인원 선택" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1C1C1C] border-[#2A2A2A]">
                    <SelectItem value="1-3" className="text-white hover:bg-white/10">1~3명</SelectItem>
                    <SelectItem value="4-10" className="text-white hover:bg-white/10">4~10명</SelectItem>
                    <SelectItem value="11-20" className="text-white hover:bg-white/10">11~20명</SelectItem>
                    <SelectItem value="20+" className="text-white hover:bg-white/10">20명 이상</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white font-medium">모집 지역</Label>
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
                <Label className="text-white font-medium">프로모션 여부</Label>
                <Select>
                  <SelectTrigger className="bg-[#141414] border-[#2A2A2A] text-white focus:border-[#E63946] focus:ring-[#E63946]/20 rounded-xl h-12">
                    <SelectValue placeholder="프로모션 선택" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1C1C1C] border-[#2A2A2A]">
                    <SelectItem value="yes" className="text-white hover:bg-white/10">있음</SelectItem>
                    <SelectItem value="no" className="text-white hover:bg-white/10">없음</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-white font-medium">오토바이 제공</Label>
                <Select>
                  <SelectTrigger className="bg-[#141414] border-[#2A2A2A] text-white focus:border-[#E63946] focus:ring-[#E63946]/20 rounded-xl h-12">
                    <SelectValue placeholder="제공 여부" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1C1C1C] border-[#2A2A2A]">
                    <SelectItem value="lease" className="text-white hover:bg-white/10">리스 가능</SelectItem>
                    <SelectItem value="rent" className="text-white hover:bg-white/10">렌트 가능</SelectItem>
                    <SelectItem value="none" className="text-white hover:bg-white/10">제공 없음</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white font-medium">정산 주기</Label>
              <Select>
                <SelectTrigger className="bg-[#141414] border-[#2A2A2A] text-white focus:border-[#E63946] focus:ring-[#E63946]/20 rounded-xl h-12">
                  <SelectValue placeholder="정산 주기 선택" />
                </SelectTrigger>
                <SelectContent className="bg-[#1C1C1C] border-[#2A2A2A]">
                  <SelectItem value="daily" className="text-white hover:bg-white/10">익일 정산</SelectItem>
                  <SelectItem value="weekly" className="text-white hover:bg-white/10">주급</SelectItem>
                  <SelectItem value="biweekly" className="text-white hover:bg-white/10">격주</SelectItem>
                  <SelectItem value="monthly" className="text-white hover:bg-white/10">월급</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white font-medium">우대 조건 / 추가 안내</Label>
              <Textarea
                placeholder="예: 초보 환영, 경력자 우대, 건당 추가 수당 등"
                className="bg-[#141414] border-[#2A2A2A] text-white placeholder:text-[#555] focus:border-[#E63946] focus:ring-[#E63946]/20 rounded-xl min-h-[100px]"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#E63946] hover:bg-[#FF4D5A] text-white rounded-xl py-6 text-lg font-bold mt-4"
            >
              지사 등록하기
            </Button>

            <p className="text-center text-[#9CA3AF] text-xs">
              등록 후 검증을 거쳐 라이더 매칭이 시작됩니다. 무료 서비스입니다.
            </p>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}