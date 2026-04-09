import { Link } from "react-router-dom";
import { useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";

export default function Terms() {
  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "이용약관 - SpeedGang Match",
    description: "SpeedGang Match 서비스 이용약관",
    url: "https://speedgangmatch.com/terms",
  }), []);

  useSEO({
    title: "이용약관 - SpeedGang Match",
    description: "SpeedGang Match 서비스 이용약관입니다. 서비스 이용 전 반드시 확인해주세요.",
    url: "/terms",
    jsonLd,
  });

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <Navbar />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[#9CA3AF] hover:text-white transition-colors mb-8"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">홈으로</span>
          </Link>

          <h1 className="text-3xl sm:text-4xl font-bold mb-2">이용약관</h1>
          <p className="text-[#6B7280] text-sm mb-10">최종 수정일: 2026년 4월 5일</p>

          <div className="space-y-8 text-[#D1D5DB] text-sm leading-relaxed">
            {/* 제1조 */}
            <section>
              <h2 className="text-white text-lg font-bold mb-3">제1조 (목적)</h2>
              <p>
                이 약관은 SpeedGang Match(이하 "회사")가 제공하는 배달 라이더-지사 매칭 플랫폼 서비스(이하 "서비스")의
                이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            {/* 제2조 */}
            <section>
              <h2 className="text-white text-lg font-bold mb-3">제2조 (정의)</h2>
              <ol className="list-decimal list-inside space-y-2 pl-2">
                <li>"서비스"란 회사가 제공하는 배달 라이더와 지사 간의 매칭, 정보 제공, 비교 등 일체의 서비스를 의미합니다.</li>
                <li>"이용자"란 이 약관에 따라 회사가 제공하는 서비스를 이용하는 라이더, 지사(업체) 및 기타 회원을 말합니다.</li>
                <li>"라이더"란 배달 업무를 수행하거나 수행하고자 하는 개인 이용자를 말합니다.</li>
                <li>"지사"란 배달 라이더를 모집하고 관리하는 업체 또는 그 소속 지점을 말합니다.</li>
                <li>"회사"란 SpeedGang Match 서비스를 운영하는 사업자를 말합니다.</li>
              </ol>
            </section>

            {/* 제3조 */}
            <section>
              <h2 className="text-white text-lg font-bold mb-3">제3조 (약관의 효력 및 변경)</h2>
              <ol className="list-decimal list-inside space-y-2 pl-2">
                <li>이 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다.</li>
                <li>회사는 관련 법령을 위배하지 않는 범위에서 이 약관을 개정할 수 있으며, 변경 시 적용일자 7일 전부터 공지합니다.</li>
                <li>이용자가 변경된 약관에 동의하지 않는 경우, 서비스 이용을 중단하고 탈퇴할 수 있습니다.</li>
              </ol>
            </section>

            {/* 제4조 */}
            <section>
              <h2 className="text-white text-lg font-bold mb-3">제4조 (서비스의 제공 및 변경)</h2>
              <ol className="list-decimal list-inside space-y-2 pl-2">
                <li>회사는 다음과 같은 서비스를 제공합니다:
                  <ul className="list-disc list-inside pl-4 mt-2 space-y-1">
                    <li>배달 라이더와 지사 간 매칭 서비스</li>
                    <li>지사 정보(단가, 프로모션, 정산 방식 등) 비교 서비스</li>
                    <li>라이더 및 지사 프로필 관리</li>
                    <li>기타 회사가 정하는 서비스</li>
                  </ul>
                </li>
                <li>회사는 서비스의 내용을 변경할 수 있으며, 변경 시 사전에 공지합니다.</li>
              </ol>
            </section>

            {/* 제5조 */}
            <section>
              <h2 className="text-white text-lg font-bold mb-3">제5조 (회원가입)</h2>
              <ol className="list-decimal list-inside space-y-2 pl-2">
                <li>이용자는 회사가 정한 양식에 따라 회원정보를 기입한 후 이 약관에 동의함으로써 회원가입을 신청합니다.</li>
                <li>회사는 다음 각 호에 해당하는 경우 회원가입을 거부할 수 있습니다:
                  <ul className="list-disc list-inside pl-4 mt-2 space-y-1">
                    <li>실명이 아니거나 타인의 명의를 이용한 경우</li>
                    <li>허위의 정보를 기재하거나 필수 정보를 제공하지 않은 경우</li>
                    <li>기타 회원으로 등록하는 것이 부적절하다고 판단되는 경우</li>
                  </ul>
                </li>
              </ol>
            </section>

            {/* 제6조 */}
            <section>
              <h2 className="text-white text-lg font-bold mb-3">제6조 (이용자의 의무)</h2>
              <p className="mb-2">이용자는 다음 행위를 하여서는 안 됩니다:</p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>가입 신청 또는 변경 시 허위 내용을 등록하는 행위</li>
                <li>타인의 정보를 도용하는 행위</li>
                <li>회사가 게시한 정보를 변경하는 행위</li>
                <li>회사 및 제3자의 지식재산권을 침해하는 행위</li>
                <li>회사 및 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
                <li>외설 또는 폭력적인 정보를 게시하는 행위</li>
                <li>기타 불법적이거나 부당한 행위</li>
              </ul>
            </section>

            {/* 제7조 */}
            <section>
              <h2 className="text-white text-lg font-bold mb-3">제7조 (회사의 의무)</h2>
              <ol className="list-decimal list-inside space-y-2 pl-2">
                <li>회사는 관련 법령과 이 약관이 금지하거나 미풍양속에 반하는 행위를 하지 않으며, 지속적이고 안정적으로 서비스를 제공하기 위해 최선을 다합니다.</li>
                <li>회사는 이용자의 개인정보를 보호하기 위해 보안 시스템을 갖추며, 개인정보처리방침을 공시하고 준수합니다.</li>
              </ol>
            </section>

            {/* 제8조 */}
            <section>
              <h2 className="text-white text-lg font-bold mb-3">제8조 (서비스 이용의 제한 및 중지)</h2>
              <ol className="list-decimal list-inside space-y-2 pl-2">
                <li>회사는 다음 각 호에 해당하는 경우 서비스 이용을 제한하거나 중지할 수 있습니다:
                  <ul className="list-disc list-inside pl-4 mt-2 space-y-1">
                    <li>서비스용 설비의 보수 등 공사로 인한 부득이한 경우</li>
                    <li>이용자가 본 약관의 의무를 위반한 경우</li>
                    <li>기타 불가항력적 사유가 있는 경우</li>
                  </ul>
                </li>
              </ol>
            </section>

            {/* 제9조 */}
            <section>
              <h2 className="text-white text-lg font-bold mb-3">제9조 (면책조항)</h2>
              <ol className="list-decimal list-inside space-y-2 pl-2">
                <li>회사는 라이더와 지사 간의 실제 계약, 근로 조건, 급여 지급 등에 대해 직접적인 책임을 지지 않습니다.</li>
                <li>회사는 이용자가 서비스에 게재한 정보의 정확성, 신뢰성에 대해 보증하지 않습니다.</li>
                <li>회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우 책임이 면제됩니다.</li>
              </ol>
            </section>

            {/* 제10조 */}
            <section>
              <h2 className="text-white text-lg font-bold mb-3">제10조 (분쟁 해결)</h2>
              <ol className="list-decimal list-inside space-y-2 pl-2">
                <li>회사와 이용자 간에 발생한 분쟁에 관한 소송은 대한민국 법률에 따릅니다.</li>
                <li>회사와 이용자 간의 분쟁에 대해서는 회사의 본사 소재지를 관할하는 법원을 전속 관할 법원으로 합니다.</li>
              </ol>
            </section>

            {/* 사업자 정보 */}
            <section className="border-t border-[#2A2A2A] pt-6">
              <h2 className="text-white text-lg font-bold mb-3">사업자 정보</h2>
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4">
                <ul className="space-y-1.5">
                  <li>• <strong className="text-white">상호:</strong> 에스지 넥스트(SG NEXT)</li>
                  <li>• <strong className="text-white">사업자등록번호:</strong> 263-67-00924</li>
                  <li>• <strong className="text-white">대표자:</strong> 김범준</li>
                  <li>• <strong className="text-white">사업장 소재지:</strong> 서울특별시 은평구 응암로 373, 2층(녹번동, 역촌빌딩)</li>
                  <li>• <strong className="text-white">업태:</strong> 정보통신업</li>
                  <li>• <strong className="text-white">종목:</strong> 응용 소프트웨어 개발 및 공급업</li>
                  <li>• <strong className="text-white">이메일:</strong> <span className="text-[#E63946]">support@speedgang.io</span></li>
                </ul>
              </div>
            </section>

            {/* 부칙 */}
            <section className="border-t border-[#2A2A2A] pt-6">
              <h2 className="text-white text-lg font-bold mb-3">부칙</h2>
              <p>이 약관은 2026년 4월 5일부터 시행합니다.</p>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}