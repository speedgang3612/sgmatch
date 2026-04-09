# SpeedGang Match - 회사-지사 1:N 구조 변경

## 개요
하나의 회사(사업자등록)가 여러 지사를 운영할 수 있는 구조로 변경
- 회사(Company) 1 : N 지사(Branch/Agency)
- 하나의 계정으로 여러 지사의 구인 공고를 통합 관리

## DB 테이블 구조 (완료)
- companies: 회사 정보 (company_name, business_number, representative, phone, email)
- agency_profiles: 지사 정보 (company_id로 회사와 연결)
- job_listings: 채용공고 (company_id, agency_id로 연결)

## 프론트엔드 수정 파일 목록

### 1. src/pages/Register.tsx
- 지사 가입 흐름 변경: 회사 등록 → 지사 추가 2단계
- 회사명, 사업자등록번호, 대표자명 입력 → 지사 정보 입력

### 2. src/pages/AgencyDashboard.tsx
- 내 회사 정보 + 소속 지사 목록 표시
- 지사 추가 기능

### 3. src/pages/Index.tsx
- 지사 카드에 "회사명 · 지사명" 형식으로 표시

### 4. src/pages/JobListings.tsx
- 채용공고에 회사명 표시

### 5. src/components/AddBranchModal.tsx (신규)
- 기존 회사에 새 지사 추가하는 모달

## 구현 순서
1. Register.tsx 수정 (회사+지사 2단계 가입)
2. AddBranchModal.tsx 생성
3. AgencyDashboard.tsx 수정 (회사-지사 관리)
4. Index.tsx 수정 (표시 형식)
5. JobListings.tsx 수정 (회사명 표시)
6. 빌드 & 테스트