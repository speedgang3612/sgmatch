import { Link } from "react-router-dom";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0A] border-t border-[#2A2A2A] py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="mb-4">
              <Logo size="sm" />
            </div>
            <p className="text-[#6B7280] text-sm leading-relaxed">
              배달 라이더와 지사를 가장 빠르게 연결하는 플랫폼.
              라이더가 선택합니다. 지사가 경쟁합니다.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              플랫폼
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-[#9CA3AF] hover:text-white text-sm transition-colors">
                  홈
                </Link>
              </li>
              <li>
                <Link to="/rider" className="text-[#9CA3AF] hover:text-white text-sm transition-colors">
                  라이더 대시보드
                </Link>
              </li>
              <li>
                <Link to="/agency" className="text-[#9CA3AF] hover:text-white text-sm transition-colors">
                  지사 대시보드
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              서비스
            </h4>
            <ul className="space-y-3">
              <li>
                <span className="text-[#9CA3AF] text-sm">라이더 등록</span>
              </li>
              <li>
                <span className="text-[#9CA3AF] text-sm">지사 채용</span>
              </li>
              <li>
                <span className="text-[#9CA3AF] text-sm">선정산팩토링</span>
              </li>
              <li>
                <span className="text-[#9CA3AF] text-sm">오토바이 보험</span>
              </li>
              <li>
                <span className="text-[#9CA3AF] text-sm">세무 회계 서비스</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              연락처
            </h4>
            <ul className="space-y-3">
              <li className="text-[#9CA3AF] text-sm">에스지 넥스트(SG NEXT)</li>
              <li className="text-[#9CA3AF] text-sm">대표: 김범준</li>
              <li className="text-[#9CA3AF] text-sm">사업자등록번호: 263-67-00924</li>
              <li className="text-[#9CA3AF] text-sm">서울특별시 은평구 응암로 373, 2층</li>
              <li className="text-[#9CA3AF] text-sm">sgnext33@gmail.com</li>
              <li className="text-[#9CA3AF] text-sm">월 - 금, 오전 9시 - 오후 6시</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#2A2A2A] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#6B7280] text-sm">
            © 2026 SpeedGang Match. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-[#6B7280] hover:text-white text-sm transition-colors">
              개인정보처리방침
            </Link>
            <Link to="/terms" className="text-[#6B7280] hover:text-white text-sm transition-colors">
              이용약관
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}