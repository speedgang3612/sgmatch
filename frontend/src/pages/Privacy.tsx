import { Link } from "react-router-dom";
import { useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";

export default function Privacy() {
  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "개인정보처리방침 - SpeedGang Match",
    description: "SpeedGang Match 개인정보처리방침",
    url: "https://speedgangmatch.com/privacy",
  }), []);

  useSEO({
    title: "개인정보처리방침 - SpeedGang Match",
    description: "SpeedGang Match의 개인정보처리방침입니다. 수집하는 개인정보 항목, 이용 목적, 보유 기간 등을 안내합니다.",
    url: "/privacy",
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

          <h1 className="text-3xl sm:text-4xl font-bold mb-2">개인정보처리방침</h1>
          <p className="text-[#6B7280] text-sm mb-10">최종 수정일: 2026년 4월 5일</p>

          <div className="space-y-8 text-[#D1D5DB] text-sm leading-relaxed">
            {/* 개요 */}
            <section>
              <p>
                SpeedGang Match(이하 "회사")는 「개인정보 보호법」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 등
                관련 법령에 따라 이용자의 개인정보를 보호하고, 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록
                다음과 같이 개인정보처리방침을 수립·공개합니다.
              </p>
            </section>

            {/* 제1조 */}
            <section>
              <h2 className="text-white text-lg font-bold mb-3">제1조 (수집하는 개인정보 항목)</h2>
              <p className="mb-3">회사는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다:</p>

              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4 mb-4">
                <h3 className="text-white font-semibold mb-2">📋 라이더 회원가입 시</h3>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li><strong className="text-white">필수:</strong> 이름, 연락처(전화번호), 출생년도, 활동 지역(시/도, 구/군), 배달 경력, 오토바이 보유 여부, 근무 유형</li>
                </ul>
              </div>

              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4 mb-4">
                <h3 className="text-white font-semibold mb-2">🏢 회사/지사 회원가입 시</h3>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li><strong className="text-white">필수:</strong> 회사명, 사업자등록번호, 대표자명, 연락처(전화번호)</li>
                  <li><strong className="text-white">선택:</strong> 이메일</li>
                  <li><strong className="text-white">지사 정보:</strong> 지사명, 담당자명, 연락처, 활동 지역, 플랫폼, 건당 단가, 정산 방식, 오토바이 리스/렌탈 옵션</li>
                </ul>
              </div>

              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4">
                <h3 className="text-white font-semibold mb-2">🔄 서비스 이용 과정에서 자동 수집</h3>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li>접속 IP 주소, 접속 일시, 서비스 이용 기록, 브라우저 종류, 기기 정보</li>
                </ul>
              </div>
            </section>

            {/* 제2조 */}
            <section>
              <h2 className="text-white text-lg font-bold mb-3">제2조 (개인정보의 수집 및 이용 목적)</h2>
              <p className="mb-3">회사는 수집한 개인정보를 다음의 목적을 위해 이용합니다:</p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li><strong className="text-white">회원 관리:</strong> 회원 가입 의사 확인, 본인 식별·인증, 회원 자격 유지·관리</li>
                <li><strong className="text-white">서비스 제공:</strong> 라이더-지사 매칭, 지사 정보 비교, 채용 정보 제공</li>
                <li><strong className="text-white">서비스 개선:</strong> 서비스 이용 통계 분석, 신규 서비스 개발, 맞춤형 서비스 제공</li>
                <li><strong className="text-white">고객 지원:</strong> 문의 사항 처리, 공지사항 전달, 분쟁 조정</li>
                <li><strong className="text-white">마케팅:</strong> 이벤트 및 프로모션 안내 (동의한 경우에 한함)</li>
              </ul>
            </section>

            {/* 제3조 */}
            <section>
              <h2 className="text-white text-lg font-bold mb-3">제3조 (개인정보의 보유 및 이용 기간)</h2>
              <p className="mb-3">
                회사는 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다.
                단, 관련 법령에 의해 보존할 필요가 있는 경우 아래와 같이 보관합니다:
              </p>
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#2A2A2A]">
                      <th className="text-left text-white font-semibold p-3">보존 항목</th>
                      <th className="text-left text-white font-semibold p-3">보존 기간</th>
                      <th className="text-left text-white font-semibold p-3">근거 법령</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[#2A2A2A]">
                      <td className="p-3">계약 또는 청약철회 등에 관한 기록</td>
                      <td className="p-3">5년</td>
                      <td className="p-3">전자상거래법</td>
                    </tr>
                    <tr className="border-b border-[#2A2A2A]">
                      <td className="p-3">소비자 불만 또는 분쟁 처리에 관한 기록</td>
                      <td className="p-3">3년</td>
                      <td className="p-3">전자상거래법</td>
                    </tr>
                    <tr className="border-b border-[#2A2A2A]">
                      <td className="p-3">웹사이트 방문 기록</td>
                      <td className="p-3">3개월</td>
                      <td className="p-3">통신비밀보호법</td>
                    </tr>
                    <tr>
                      <td className="p-3">회원 탈퇴 후 개인정보</td>
                      <td className="p-3">탈퇴 후 즉시 파기</td>
                      <td className="p-3">개인정보보호법</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* 제4조 */}
            <section>
              <h2 className="text-white text-lg font-bold mb-3">제4조 (개인정보의 제3자 제공)</h2>
              <p>
                회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2 mt-3">
                <li>이용자가 사전에 동의한 경우</li>
                <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
                <li>라이더-지사 매칭 서비스 제공을 위해 필요한 최소한의 정보를 상대방에게 제공하는 경우 (이름, 연락처 등 - 이용자 동의 하에)</li>
              </ul>
            </section>

            {/* 제5조 */}
            <section>
              <h2 className="text-white text-lg font-bold mb-3">제5조 (개인정보의 파기)</h2>
              <ol className="list-decimal list-inside space-y-2 pl-2">
                <li>회사는 개인정보 보유 기간의 경과, 처리 목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.</li>
                <li>전자적 파일 형태의 정보는 복구 및 재생이 불가능한 방법으로 영구 삭제합니다.</li>
                <li>종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각하여 파기합니다.</li>
              </ol>
            </section>

            {/* 제6조 */}
            <section>
              <h2 className="text-white text-lg font-bold mb-3">제6조 (이용자의 권리와 행사 방법)</h2>
              <p className="mb-3">이용자는 언제든지 다음과 같은 개인정보 보호 관련 권리를 행사할 수 있습니다:</p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>개인정보 열람 요구</li>
                <li>오류 등이 있을 경우 정정 요구</li>
                <li>삭제 요구</li>
                <li>처리 정지 요구</li>
              </ul>
              <p className="mt-3">
                위 권리 행사는 이메일(<span className="text-[#E63946]">support@sgmatch.co.kr</span>)을 통해 하실 수 있으며,
                회사는 이에 대해 지체 없이 조치하겠습니다.
              </p>
            </section>

            {/* 제7조 */}
            <section>
              <h2 className="text-white text-lg font-bold mb-3">제7조 (개인정보의 안전성 확보 조치)</h2>
              <p className="mb-3">회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다:</p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li><strong className="text-white">관리적 조치:</strong> 내부 관리 계획 수립·시행, 개인정보 취급 직원 최소화 및 교육</li>
                <li><strong className="text-white">기술적 조치:</strong> 개인정보 처리 시스템 접근 권한 관리, 접근 통제 시스템 설치, 고유 식별 정보 등의 암호화, 보안 프로그램 설치</li>
                <li><strong className="text-white">물리적 조치:</strong> 전산실, 자료 보관실 등의 접근 통제</li>
              </ul>
            </section>

            {/* 제8조 */}
            <section>
              <h2 className="text-white text-lg font-bold mb-3">제8조 (쿠키의 사용)</h2>
              <ol className="list-decimal list-inside space-y-2 pl-2">
                <li>회사는 이용자에게 개별적인 맞춤 서비스를 제공하기 위해 쿠키(cookie)를 사용합니다.</li>
                <li>쿠키는 웹사이트를 운영하는 데 이용되는 서버가 이용자의 브라우저에 보내는 소량의 정보이며, 이용자의 컴퓨터에 저장됩니다.</li>
                <li>이용자는 쿠키 설치에 대한 선택권을 가지고 있으며, 브라우저 설정을 통해 쿠키 허용, 확인, 거부할 수 있습니다.</li>
              </ol>
            </section>

            {/* 제9조 */}
            <section>
              <h2 className="text-white text-lg font-bold mb-3">제9조 (개인정보 보호 책임자)</h2>
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4">
                <p className="mb-2">회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 이용자의 개인정보 관련 불만 처리 및 피해 구제를 위하여 아래와 같이 개인정보 보호 책임자를 지정하고 있습니다:</p>
                <ul className="space-y-1.5 mt-3">
                  <li>• <strong className="text-white">회사명:</strong> 에스지 넥스트(SG NEXT)</li>
                  <li>• <strong className="text-white">사업자등록번호:</strong> 263-67-00924</li>
                  <li>• <strong className="text-white">대표자 / 개인정보 보호 책임자:</strong> 김범준</li>
                  <li>• <strong className="text-white">소재지:</strong> 서울특별시 은평구 응암로 373, 2층(녹번동, 역촌빌딩)</li>
                  <li>• <strong className="text-white">이메일:</strong> <span className="text-[#E63946]">support@sgmatch.co.kr</span></li>
                </ul>
              </div>
            </section>

            {/* 제10조 */}
            <section>
              <h2 className="text-white text-lg font-bold mb-3">제10조 (권익 침해 구제 방법)</h2>
              <p className="mb-3">이용자는 개인정보 침해로 인한 구제를 받기 위하여 다음 기관에 분쟁 해결이나 상담 등을 신청할 수 있습니다:</p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>개인정보분쟁조정위원회: (국번없이) 1833-6972 (www.kopico.go.kr)</li>
                <li>개인정보침해신고센터: (국번없이) 118 (privacy.kisa.or.kr)</li>
                <li>대검찰청: (국번없이) 1301 (www.spo.go.kr)</li>
                <li>경찰청: (국번없이) 182 (ecrm.cyber.go.kr)</li>
              </ul>
            </section>

            {/* 부칙 */}
            <section className="border-t border-[#2A2A2A] pt-6">
              <h2 className="text-white text-lg font-bold mb-3">부칙</h2>
              <p>이 개인정보처리방침은 2026년 4월 5일부터 시행합니다.</p>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}