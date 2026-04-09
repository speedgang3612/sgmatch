import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

export default function NotFound() {
  useSEO({
    title: "404 - 페이지를 찾을 수 없습니다",
    description: "요청하신 페이지가 존재하지 않거나 이동되었습니다.",
    url: "/404",
    noindex: true,
  });

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-[#E63946] mb-4">404</h1>
        <h2 className="text-2xl font-bold mb-4">페이지를 찾을 수 없습니다</h2>
        <p className="text-[#9CA3AF] mb-8">요청하신 페이지가 존재하지 않거나 이동되었습니다.</p>
        <Link to="/">
          <Button className="bg-[#E63946] hover:bg-[#FF4D5A] text-white rounded-xl px-8 py-6 text-lg font-bold gap-2">
            <Home size={20} />
            홈으로 돌아가기
          </Button>
        </Link>
      </div>
    </div>
  );
}