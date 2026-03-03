# 114Korea Changelog

모든 주목할 만한 변경 사항이 이 파일에 기록됩니다.

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)를 따릅니다.

---

## [0.1.0] - 2026-03-03

### 추가됨 (Added)

**공개 페이지 (외국인 근로자용)**
- 메인 페이지: VIP 공고 배너, 최신 공고 목록, 지역/업종 빠른 필터 (FR-01)
- 공고 목록 페이지: 지역/업종/비자/급여별 필터링, 정렬, 페이지네이션 (FR-02)
- 공고 상세 페이지: 업체정보, 급여, 근무시간, 숙소, 비자, 태그, 조회수 표시 (FR-03)
- 연락하기 기능: 전화 버튼 + 카카오톡 연결 (FR-04)
- 15개 근무조건 태그 표시 (FR-05)
- SEO 최적화: 동적 메타데이터 (Open Graph, Twitter Card)

**업체 영역**
- 업체 회원가입: 이메일, 비밀번호, 사업자등록번호, 회사명, 대표자, 연락처, 주소 (FR-06)
- 업체 로그인/로그아웃: 쿠키 기반 세션 관리 (FR-07)
- 공고 등록 폼: 모든 필드 포함, react-hook-form + zod 검증 (FR-08)
- 공고 수정/삭제: 본인 공고만 수정/삭제 가능 (FR-09)
- 하루 2건 무료 등록 제한: getTodayJobCount() 로직 구현 (FR-10)
- 내 공고 관리 대시보드: 공고 목록, 상태 표시, 조회수 (FR-11)
- 업체 프로필 수정: 회사명, 연락처, 주소 등 수정 가능 (FR-12)

**관리자 영역**
- 업체 목록 페이지: 상태별 필터 (전체/대기중/승인/거부) + 승인/거부 버튼 (FR-13)
- 공고 관리 페이지: 상태별 필터 (전체/심사중/공개/숨김) + 상태 변경, 삭제 (FR-14)
- VIP 상위노출 수동 설정: 공고 관리에서 VIP 토글 (FR-15)
- 관리자 대시보드: 업체 현황, 공고 현황, VIP 현황 통계 (FR-16)

**인프라 & 보안**
- TypeScript strict 모드 설정
- zod 스키마로 클라이언트/서버 양측 입력값 검증
- 인증 미들웨어: 경로별 역할(역할) 기반 접근 제어
- XSS 방지: React 자동 이스케이프 (dangerouslySetInnerHTML 미사용)
- CSRF 방지: SameSite=Lax 쿠키 정책
- Rate Limiting: 공고 등록 하루 2건 제한
- 사업자등록번호 포맷 검증 (000-00-00000)

**기술 스택**
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS (모바일 우선 반응형)
- react-hook-form (폼 관리)
- zod (스키마 검증)
- Zustand (인증 상태 관리)

**페이지 및 라우트**
- 14개 페이지 구현 (메인, 공고 목록/상세, 인증, 대시보드, 관리자 등)
- 404/500 에러 페이지
- 이용약관, 개인정보처리방침 페이지

**API 엔드포인트**
- 인증: POST /api/auth/register, /login, /logout, GET /me
- 공고: GET/POST /api/jobs, GET/PUT/DELETE /api/jobs/[id]
- 대시보드: GET/PUT /api/dashboard/profile, GET /api/dashboard/jobs
- 관리자: GET/PUT /api/admin/companies, /api/admin/jobs, GET /api/admin/stats

**UI 컴포넌트**
- 기본 UI: Button, Input, Select, Badge, Pagination, Spinner, EmptyState
- 공고 관련: JobCard, JobFilter, JobForm, JobTagBadge, VisaBadge, SalaryDisplay, ContactButtons
- 레이아웃: Header (모바일 반응형), Footer

**데이터 타입**
- Industry, SalaryType, WorkShift, VisaType (열거형)
- JobTag (15개 근무조건 태그)
- Company, JobPost, Admin 엔티티 타입
- JobFilter, PaginatedResponse, AuthUser 등 헬퍼 타입

**유틸리티**
- 업종/비자/태그/지역 상수 + 한글 포맷 함수
- 공고 폼 검증 스키마 (zod)
- 인증 검증 스키마

### 변경됨 (Changed)

**공고 등록 상태 정책**
- 초기 상태를 `'active'` (즉시 공개) → `'pending'` (관리자 승인 필요)으로 변경
- 비즈니스 정책: 공고 품질 관리 위해 관리자 승인 절차 도입

### 알려진 문제점 (Known Issues)

**아직 구현되지 않은 항목**
- bkend.ai BaaS 연동: 현재 Mock 데이터 (Map 기반) 사용 중
  - 실제 데이터베이스 미연동
  - 비밀번호 평문 저장 (bkend.ai 해싱 필요)
  - JWT 서명 미구현 (Base64 인코딩만 사용)

**하루 2건 제한의 한계**
- 현재 메모리 기반 (서버 시간 기준)
- 서버 재시작 시 초기화됨
- bkend.ai 전환 후 DB 기반으로 개선 필요

**부분 구현된 기능**
- 내 공고 관리 (FR-11): 상태별 필터 탭 미구현 (모든 공고 조회 가능)
- 하루 2건 제한 (FR-10): 메모리 기반 (불안정)

**미구현 UI 컴포넌트**
- Modal: confirm() 사용으로 대체
- Card: 기본 div로 구현
- VipSlider: Grid 레이아웃으로 대체

### 아키텍처 상태

- ✅ 기본 폴더 구조 (components, features, lib, types)
- ✅ 컴포넌트 기반 개발
- ⚠️ services 레이어 미분리 (API 호출이 컴포넌트/페이지 내 인라인)
- ⚠️ Custom hooks 미분리 (페이지 내 로직 인라인)
- ✅ 타입 안전성 (TypeScript strict mode)
- ✅ 입력값 검증 (zod)

### Gap 분석 결과

**PDCA Check 단계 완료**
- 종합 일치율: **91%**
- 기능 요구사항 (FR): 88%
- API 엔드포인트: 100%
- 타입/스키마: 93%
- 페이지 라우트: 100%
- 컴포넌트 구조: 82%
- 컨벤션 준수: 95%

### 다음 단계 (Next Phase)

**Phase 2: bkend.ai BaaS 연동 (예정)**
- Mock 데이터 → bkend.ai API 전환
- JWT 기반 인증 구현
- 하루 2건 제한 DB 기반 구현
- 비밀번호 해싱 (bkend.ai 기본 제공)

**Phase 3: 아키텍처 개선 (예정)**
- services/ 레이어 분리
- Custom hooks 추출 (useJobs, useJob, useJobMutation 등)
- features/company/, features/admin/ 모듈화

**Phase 4: 기능 확대 (예정)**
- 내 공고 상태 필터 추가
- VipSlider 컴포넌트 구현
- Modal 컴포넌트 추가
- 메인 페이지 검색바 기능
- 테스트 추가 (Jest + React Testing Library)

---

## 기여자

- **acctb** - 기획, 설계, 개발, 검증

---

## 라이선스

이 프로젝트는 내부 프로젝트입니다.
