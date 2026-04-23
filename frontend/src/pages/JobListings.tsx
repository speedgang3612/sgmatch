import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface JobListing {
  id: number;
  agency_name: string;
  region: string;
  sub_region: string;
  title: string;
  conditions: string;
  promotion: string;
  platform?: string;
  motorcycle: string;
  settlement: string;
  work_time: string;
  status: string;
  created_at: string;
}

// Fallback data in case DB fetch fails
const fallbackJobs: JobListing[] = [
  {
    id: 1, agency_name: "은평 지사", region: "서울 은평구", sub_region: "서대문구",
    title: "은평구 라이더 모집", conditions: '["야간 가능", "초보 가능"]',
    promotion: "건당 1,000원 추가", motorcycle: "리스 가능", settlement: "익일 정산",
    work_time: "야간", status: "모집중", created_at: "2026-03-20 10:00:00",
  },
  {
    id: 2, agency_name: "마포 라이더스", region: "서울 마포구", sub_region: "용산구",
    title: "마포구 라이더 긴급 모집", conditions: '["주간 풀타임", "경력 우대"]',
    promotion: "첫 주 보너스 5만원", motorcycle: "본인 보유", settlement: "주급",
    work_time: "주간", status: "긴급", created_at: "2026-03-19 14:00:00",
  },
  {
    id: 3, agency_name: "고양 일산 허브", region: "경기 고양시", sub_region: "일산",
    title: "일산 지역 라이더 모집", conditions: '["주간/야간 선택", "초보 환영"]',
    promotion: "프로모션 진행중", motorcycle: "렌트 지원", settlement: "익일 정산",
    work_time: "주간", status: "모집중", created_at: "2026-03-18 09:00:00",
  },
  {
    id: 4, agency_name: "강남 익스프레스", region: "서울 강서구", sub_region: "양천구",
    title: "강서구 주간 라이더 모집", conditions: '["주간 전담", "경력 6개월 이상"]',
    promotion: "건당 500원 추가", motorcycle: "리스 가능", settlement: "주급",
    work_time: "주간", status: "모집중", created_at: "2026-03-17 11:00:00",
  },
  {
    id: 5, agency_name: "영등포 허브", region: "서울 영등포구", sub_region: "구로구",
    title: "영등포 야간 전담 라이더", conditions: '["야간 전담", "경력 우대"]',
    promotion: "야간 수당 별도", motorcycle: "본인 보유", settlement: "익일 정산",
    work_time: "야간", status: "긴급", created_at: "2026-03-16 15:00:00",
  },
  {
    id: 6, agency_name: "송파 라이더스", region: "경기 파주시", sub_region: "",
    title: "파주 운정 라이더 모집", conditions: '["풀타임", "초보 가능"]',
    promotion: "첫 달 인센티브", motorcycle: "렌트 지원", settlement: "격주",
    work_time: "풀타임", status: "모집중", created_at: "2026-03-15 08:00:00",
  },
];

/** "-" 기준 뒤 텍스트만 추출 (회사명 블라인드 처리) */
function getBlindName(name: string): string {
  return name.includes('-') ? name.split('-').slice(1).join('-') : name;
}

function parseConditions(conditions: string): string[] {
  try {
    return JSON.parse(conditions);
  } catch {
    return conditions ? [conditions] : [];
  }
}

export default function JobListings() {
  const [regionFilter, setRegionFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL ?? ''}/api/v1/entities/job_listings/all?sort=-created_at&limit=50&skip=0`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const items = data?.items;
        if (items && items.length > 0) {
          setJobs(items as JobListing[]);
        } else {
          setJobs(fallbackJobs);
        }
      } catch (err) {
        console.error("Failed to fetch job listings:", err);
        setJobs(fallbackJobs);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const regionMatch = regionFilter === "all" || job.region.includes(regionFilter);
    const timeMatch = timeFilter === "all" || job.work_time === timeFilter;
    return regionMatch && timeMatch;
  });

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <Navbar />

      <div className="pt-24 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="text-[#E63946]">모집공고</span> 게시판
            </h1>
            <p className="text-[#9CA3AF] text-lg">
              조건에 맞는 공고를 찾아 바로 지원하세요
            </p>
          </div>

          {/* Filters */}
          <div className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-2xl p-6 mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-2 text-[#9CA3AF]">
                <Search size={18} />
                <span className="text-sm font-medium">필터</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <Select value={regionFilter} onValueChange={setRegionFilter}>
                  <SelectTrigger className="bg-[#141414] border-[#2A2A2A] text-white focus:border-[#E63946] rounded-xl h-10 w-full sm:w-48">
                    <SelectValue placeholder="지역 선택" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1C1C1C] border-[#2A2A2A]">
                    <SelectItem value="all" className="text-white hover:bg-white/10">전체 지역</SelectItem>
                    <SelectItem value="은평" className="text-white hover:bg-white/10">은평구</SelectItem>
                    <SelectItem value="마포" className="text-white hover:bg-white/10">마포구</SelectItem>
                    <SelectItem value="강서" className="text-white hover:bg-white/10">강서구</SelectItem>
                    <SelectItem value="영등포" className="text-white hover:bg-white/10">영등포구</SelectItem>
                    <SelectItem value="고양" className="text-white hover:bg-white/10">고양시</SelectItem>
                    <SelectItem value="파주" className="text-white hover:bg-white/10">파주시</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger className="bg-[#141414] border-[#2A2A2A] text-white focus:border-[#E63946] rounded-xl h-10 w-full sm:w-48">
                    <SelectValue placeholder="근무시간" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1C1C1C] border-[#2A2A2A]">
                    <SelectItem value="all" className="text-white hover:bg-white/10">전체</SelectItem>
                    <SelectItem value="주간" className="text-white hover:bg-white/10">주간</SelectItem>
                    <SelectItem value="야간" className="text-white hover:bg-white/10">야간</SelectItem>
                    <SelectItem value="풀타임" className="text-white hover:bg-white/10">풀타임</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <span className="text-[#9CA3AF] text-sm">
                {filteredJobs.length}개 공고
              </span>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-[#E63946]" />
              <span className="ml-3 text-[#9CA3AF]">공고를 불러오는 중...</span>
            </div>
          )}

          {/* Job Cards */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job) => {
                const conditions = parseConditions(job.conditions);
                return (
                  <div
                    key={job.id}
                    className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-2xl p-6 hover:border-[#E63946]/30 transition-all duration-300 hover:-translate-y-1 group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          job.status === "긴급"
                            ? "bg-orange-500/10 text-orange-400"
                            : "bg-[#E63946]/10 text-[#E63946]"
                        }`}
                      >
                        {job.status}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#9CA3AF] text-xs">{job.region}</span>
                        <span className="text-xs text-[#6B7280] bg-[#1A1A1A] border border-[#2A2A2A] px-2 py-0.5 rounded-full">
                          {getBlindName(job.agency_name)}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold mb-4 group-hover:text-[#E63946] transition-colors">
                      {getBlindName(job.title)}
                    </h3>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {conditions.map((c, i) => (
                        <span
                          key={i}
                          className="bg-white/5 text-[#9CA3AF] text-xs px-3 py-1 rounded-lg"
                        >
                          {c}
                        </span>
                      ))}
                    </div>

                    <div className="space-y-2 mb-6 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[#9CA3AF]">💰 프로모션</span>
                        <span className="text-white">{job.promotion}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#9CA3AF]">🏍️ 오토바이</span>
                        <span className="text-white">{job.motorcycle}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#9CA3AF]">💳 정산</span>
                        <span className="text-white">{job.settlement}</span>
                      </div>
                    </div>

                    <Link to="/register">
                      <Button className="w-full bg-[#E63946] hover:bg-[#FF4D5A] text-white rounded-xl font-semibold">
                        지원하기
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && filteredJobs.length === 0 && (
            <div className="text-center py-20">
              <p className="text-[#9CA3AF] text-lg">해당 조건의 공고가 없습니다.</p>
              <p className="text-[#9CA3AF] text-sm mt-2">다른 조건으로 검색해보세요.</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}