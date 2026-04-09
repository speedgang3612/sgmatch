import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, MessageCircle, Phone, Mail } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Contact() {
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
            <h2 className="text-3xl font-bold mb-3">문의 접수 완료!</h2>
            <p className="text-[#9CA3AF] text-lg mb-2">빠른 시일 내에 답변드리겠습니다.</p>
            <p className="text-[#9CA3AF]">평일 기준 24시간 이내 회신됩니다.</p>
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
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="text-[#E63946]">문의</span>하기
            </h1>
            <p className="text-[#9CA3AF] text-lg">
              궁금한 점이 있으시면 언제든 문의해주세요
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="space-y-4">
              <div className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-2xl p-6">
                <div className="w-12 h-12 bg-[#E63946]/10 rounded-xl flex items-center justify-center mb-4">
                  <Phone className="text-[#E63946]" size={24} />
                </div>
                <h3 className="font-bold mb-2">전화 문의</h3>
                <p className="text-[#9CA3AF] text-sm">02-1234-5678</p>
                <p className="text-[#9CA3AF] text-xs mt-1">평일 09:00 ~ 18:00</p>
              </div>

              <div className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-2xl p-6">
                <div className="w-12 h-12 bg-[#E63946]/10 rounded-xl flex items-center justify-center mb-4">
                  <Mail className="text-[#E63946]" size={24} />
                </div>
                <h3 className="font-bold mb-2">이메일</h3>
                <p className="text-[#9CA3AF] text-sm">contact@yongbyung.kr</p>
                <p className="text-[#9CA3AF] text-xs mt-1">24시간 접수 가능</p>
              </div>

              <div className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-2xl p-6">
                <div className="w-12 h-12 bg-[#E63946]/10 rounded-xl flex items-center justify-center mb-4">
                  <MessageCircle className="text-[#E63946]" size={24} />
                </div>
                <h3 className="font-bold mb-2">카카오톡</h3>
                <p className="text-[#9CA3AF] text-sm">@용병플랫폼</p>
                <p className="text-[#9CA3AF] text-xs mt-1">실시간 상담 가능</p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-2xl p-6 sm:p-10 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-white font-medium">이름</Label>
                    <Input
                      required
                      placeholder="이름을 입력하세요"
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
                  <Label className="text-white font-medium">문의 유형</Label>
                  <Select>
                    <SelectTrigger className="bg-[#141414] border-[#2A2A2A] text-white focus:border-[#E63946] focus:ring-[#E63946]/20 rounded-xl h-12">
                      <SelectValue placeholder="유형을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1C1C1C] border-[#2A2A2A]">
                      <SelectItem value="rider" className="text-white hover:bg-white/10">라이더 관련</SelectItem>
                      <SelectItem value="branch" className="text-white hover:bg-white/10">지사 관련</SelectItem>
                      <SelectItem value="matching" className="text-white hover:bg-white/10">매칭 관련</SelectItem>
                      <SelectItem value="partnership" className="text-white hover:bg-white/10">제휴/협력</SelectItem>
                      <SelectItem value="other" className="text-white hover:bg-white/10">기타</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white font-medium">문의 내용</Label>
                  <Textarea
                    required
                    placeholder="문의 내용을 자세히 적어주세요"
                    className="bg-[#141414] border-[#2A2A2A] text-white placeholder:text-[#555] focus:border-[#E63946] focus:ring-[#E63946]/20 rounded-xl min-h-[160px]"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#E63946] hover:bg-[#FF4D5A] text-white rounded-xl py-6 text-lg font-bold"
                >
                  문의 보내기
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}