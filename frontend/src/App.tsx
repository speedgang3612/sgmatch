import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// 페이지 로드 속도 개선: React.lazy로 페이지별 코드 스플리팅
// 각 페이지가 필요할 때만 로드되어 초기 로딩 속도가 빨라집니다
const Index = lazy(() => import("./pages/Index"));
const RiderDashboard = lazy(() => import("./pages/RiderDashboard"));
const AgencyDashboard = lazy(() => import("./pages/AgencyDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AgencyVerification = lazy(() => import("./pages/AgencyVerification"));
const Register = lazy(() => import("./pages/Register"));
const Pricing = lazy(() => import("./pages/Pricing"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const AuthError = lazy(() => import("./pages/AuthError"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));

// #4 — 새로 생성한 플레이스홀더 페이지 (라우트 미등록 버그 수정)
const RiderSaved = lazy(() => import("./pages/RiderSaved"));
const RiderApplications = lazy(() => import("./pages/RiderApplications"));
const RiderProfile = lazy(() => import("./pages/RiderProfile"));
const RiderSupport = lazy(() => import("./pages/RiderSupport"));
const AgencyAnalytics = lazy(() => import("./pages/AgencyAnalytics"));
const AgencyPromotions = lazy(() => import("./pages/AgencyPromotions"));
// #20 — 채용 공고 관리 페이지 (지사 관점)
const AgencyListings = lazy(() => import("./pages/AgencyListings"));

// #5 — 기존 파일이지만 라우트가 없던 페이지 (버그 수정)
const JobListings = lazy(() => import("./pages/JobListings"));
const BranchRegister = lazy(() => import("./pages/BranchRegister"));
const RiderRegister = lazy(() => import("./pages/RiderRegister"));
const Contact = lazy(() => import("./pages/Contact"));
const LogoutCallbackPage = lazy(() => import("./pages/LogoutCallbackPage"));

// 보호 라우트는 즉시 로드 (가벼운 컴포넌트)
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";

/** 페이지 로딩 중 표시되는 스피너 */
function PageLoader() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-3 border-[#E63946] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#6B7280] text-sm">로딩 중...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/rider" element={<RiderDashboard />} />
          <Route path="/rider/*" element={<RiderDashboard />} />
          <Route path="/agency" element={<AgencyDashboard />} />
          <Route path="/agency/verification" element={<AgencyVerification />} />

          {/* #20 — 채용 공고 관리: wildcard보다 먼저 등록해야 라우팅이 정확함 */}
          <Route path="/agency/listings" element={<AgencyListings />} />

          <Route path="/agency/*" element={<AgencyDashboard />} />
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/*"
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }
          />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/auth/error" element={<AuthError />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />

          {/* #4 — 라이더 서브 페이지 */}
          <Route path="/rider/saved" element={<RiderSaved />} />
          <Route path="/rider/applications" element={<RiderApplications />} />
          <Route path="/rider/profile" element={<RiderProfile />} />
          <Route path="/rider/support" element={<RiderSupport />} />

          {/* #4 — 지사 서브 페이지 */}
          <Route path="/agency/analytics" element={<AgencyAnalytics />} />
          <Route path="/agency/promotions" element={<AgencyPromotions />} />

          {/* #5 — 기존 파일 라우트 등록 */}
          <Route path="/jobs" element={<JobListings />} />
          <Route path="/branch/register" element={<BranchRegister />} />
          <Route path="/rider/register" element={<RiderRegister />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/auth/logout/callback" element={<LogoutCallbackPage />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;