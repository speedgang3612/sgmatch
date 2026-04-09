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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;