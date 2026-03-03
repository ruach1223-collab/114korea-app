# 114Korea 설계서 (Design Document)

> **요약**: 외국인 근로자 대상 검증된 구인구직 플랫폼 - 화면/API/컴포넌트 상세 설계
>
> **프로젝트**: 114Korea
> **버전**: 0.1.0
> **작성자**: acctb
> **날짜**: 2026-02-27
> **상태**: Draft
> **기획서**: [114korea.plan.md](../01-plan/features/114korea.plan.md)

---

## 1. 설계 목표

### 1.1 기술 목표

- 모바일 퍼스트 반응형 UI (외국인 근로자 대부분 모바일 사용)
- SEO 최적화 (SSR/SSG로 구글/네이버 검색 노출)
- 빠른 MVP 출시 (bkend.ai BaaS 활용으로 백엔드 개발 최소화)
- 직관적인 공고 등록/관리 UX (업체용)

### 1.2 설계 원칙

- 모바일 우선 (Mobile First) - 320px부터 설계
- 단순한 정보 구조 (3클릭 이내 목표 도달)
- 컴포넌트 재사용 (공고 카드, 필터 등)
- 타입 안전 (TypeScript strict mode)

---

## 2. 아키텍처

### 2.1 시스템 구조

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────┐
│   Client          │     │   bkend.ai       │     │   MongoDB    │
│  (Next.js 15)     │────>│   (BaaS API)     │────>│  (Database)  │
│  - SSR/SSG        │     │   - Auth         │     │              │
│  - App Router     │     │   - CRUD API     │     └──────────────┘
│  - Tailwind CSS   │     │   - File Storage │
└──────────────────┘     └──────────────────┘
        │
        └──> Vercel (배포)
```

### 2.2 데이터 흐름

```
[공개 페이지]
외국인 근로자 → 메인/목록 → 필터/검색 → 공고 상세 → 연락하기(전화/카톡)

[업체 페이지]
업체 → 회원가입 → 관리자 승인 대기 → 로그인 → 공고 등록 → 심사 → 공개

[관리자 페이지]
관리자 → 로그인 → 업체 승인/거부 → 공고 승인/숨김 → VIP 지정
```

### 2.3 의존성

| 컴포넌트 | 의존 대상 | 용도 |
|----------|-----------|------|
| Next.js App | bkend.ai REST API | 데이터 CRUD, 인증 |
| 공고 목록 | Zustand Store | 필터 상태 관리 |
| 공고 등록 폼 | react-hook-form + zod | 폼 검증 |
| 인증 | bkend.ai Auth | 업체 로그인/회원가입 |

---

## 3. 데이터 모델 (TypeScript)

### 3.1 타입 정의

```typescript
// === 상수 (Enum 대체) ===

// 업종
type Industry =
  | 'PRODUCTION'    // 생산/제조
  | 'CONSTRUCTION'  // 건설/현장
  | 'LOGISTICS'     // 물류/운송
  | 'FOOD'          // 외식/식당
  | 'RETAIL'        // 매장/판매
  | 'OFFICE'        // 사무/영업
  | 'LODGING'       // 숙박/청소
  | 'AGRICULTURE'   // 농축산/어업

// 급여 유형
type SalaryType = 'HOURLY' | 'DAILY' | 'MONTHLY' | 'NEGOTIABLE'

// 근무 형태
type WorkShift = 'DAY' | 'NIGHT' | 'TWO_SHIFT' | 'THREE_SHIFT' | 'FLEXIBLE'

// 비자 유형
type VisaType = 'E-9' | 'E-7' | 'F-2' | 'F-4' | 'F-5' | 'F-6' | 'H-2'

// 근무조건 태그
type JobTag =
  | 'DORMITORY'        // 숙소제공
  | 'MEAL'             // 식사제공
  | 'SHUTTLE'          // 통근버스
  | 'BEGINNER_OK'      // 초보가능
  | 'IMMEDIATE'        // 즉시출근
  | 'WEEKLY_PAY'       // 주급가능
  | 'DAILY_PAY'        // 당일지급
  | 'NIGHT_BONUS'      // 야간수당
  | 'INSURANCE'        // 4대보험
  | 'SEVERANCE'        // 퇴직금
  | 'OVERTIME'         // 잔업많음
  | 'FOREIGNER_OK'     // 외국인가능
  | 'NO_KOREAN'        // 한국어불필요
  | 'COUPLE_OK'        // 부부가능
  | 'VEHICLE'          // 차량지원

// 업체 상태
type CompanyStatus = 'pending' | 'approved' | 'rejected'

// 공고 상태
type JobStatus = 'pending' | 'active' | 'hidden' | 'expired'

// === 엔티티 ===

// 업체 (아웃소싱 회사)
type Company = {
  id: string
  email: string
  company_name: string       // 회사명
  biz_number: string         // 사업자등록번호 (000-00-00000)
  rep_name: string           // 대표자명
  phone: string              // 연락처
  address: string            // 주소
  status: CompanyStatus      // 승인 상태
  created_at: string         // ISO 8601
  updated_at: string
}

// 구인공고
type JobPost = {
  id: string
  company_id: string         // 업체 FK
  title: string              // 공고 제목
  industry: Industry         // 업종
  region_city: string        // 시/도 (서울, 경기 등)
  region_district: string    // 시/군/구 (강남구, 화성시 등)
  salary_type: SalaryType    // 급여 유형
  salary_amount: number      // 급여 금액
  work_hours: string         // 근무시간 (예: "09:00~18:00")
  work_shift: WorkShift      // 근무 형태
  visa_types: VisaType[]     // 가능 비자 (복수)
  tags: JobTag[]             // 근무조건 태그 (복수)
  dormitory: boolean         // 숙소 제공 여부
  description: string        // 상세 설명
  contact_phone: string      // 연락처 전화번호
  contact_kakao: string      // 카카오톡 ID (선택)
  is_vip: boolean            // VIP 상위노출 여부
  status: JobStatus          // 공고 상태
  view_count: number         // 조회수
  created_at: string
  expires_at: string         // 만료일 (등록일 + 30일)
}

// 관리자
type Admin = {
  id: string
  email: string
  role: 'super_admin' | 'admin'
}

// === 공고 카드용 요약 타입 ===
type JobPostCard = Pick<JobPost,
  'id' | 'title' | 'industry' | 'region_city' | 'region_district' |
  'salary_type' | 'salary_amount' | 'tags' | 'is_vip' | 'created_at'
> & {
  company_name: string  // 조인된 회사명
}

// === 필터 타입 ===
type JobFilter = {
  industry?: Industry
  region_city?: string
  visa_type?: VisaType
  salary_type?: SalaryType
  sort?: 'latest' | 'salary_high' | 'salary_low'
  page?: number
  limit?: number  // 기본 20
}
```

### 3.2 엔티티 관계

```
[Company] 1 ──── N [JobPost]
   │
   └── status: approved일 때만 공고 등록 가능

[Admin] ──── 독립 (Company/JobPost 관리 권한)
```

### 3.3 bkend.ai 테이블 스키마

**companies 테이블**

| 필드 | 타입 | 필수 | 유니크 | 설명 |
|------|------|:----:|:------:|------|
| email | String | O | O | 로그인 이메일 |
| company_name | String | O | - | 회사명 |
| biz_number | String | O | O | 사업자등록번호 |
| rep_name | String | O | - | 대표자명 |
| phone | String | O | - | 연락처 |
| address | String | O | - | 주소 |
| status | String | O | - | pending/approved/rejected |

**job_posts 테이블**

| 필드 | 타입 | 필수 | 유니크 | 설명 |
|------|------|:----:|:------:|------|
| company_id | String | O | - | 업체 ID (FK) |
| title | String | O | - | 공고 제목 (최대 100자) |
| industry | String | O | - | 업종 코드 |
| region_city | String | O | - | 시/도 |
| region_district | String | - | - | 시/군/구 |
| salary_type | String | O | - | HOURLY/DAILY/MONTHLY/NEGOTIABLE |
| salary_amount | Number | - | - | 급여 금액 (협의 시 null) |
| work_hours | String | O | - | 근무시간 텍스트 |
| work_shift | String | O | - | DAY/NIGHT/TWO_SHIFT 등 |
| visa_types | Array | O | - | 비자 유형 배열 |
| tags | Array | - | - | 근무조건 태그 배열 |
| dormitory | Boolean | O | - | 숙소 제공 여부 |
| description | String | O | - | 상세 설명 (최대 3000자) |
| contact_phone | String | O | - | 연락처 전화번호 |
| contact_kakao | String | - | - | 카카오톡 ID |
| is_vip | Boolean | O | - | VIP 여부 (기본 false) |
| status | String | O | - | pending/active/hidden/expired |
| view_count | Number | O | - | 조회수 (기본 0) |
| expires_at | String | O | - | 만료일 ISO 8601 |

---

## 4. API 명세

### 4.1 bkend.ai 자동 생성 CRUD

bkend.ai BaaS를 사용하므로 테이블 생성 시 CRUD API가 자동 생성됩니다.

**기본 엔드포인트 패턴:**
```
GET    /api/tables/{table}/rows          - 목록 조회 (필터/정렬/페이지네이션)
GET    /api/tables/{table}/rows/{id}     - 상세 조회
POST   /api/tables/{table}/rows          - 생성
PUT    /api/tables/{table}/rows/{id}     - 수정
DELETE /api/tables/{table}/rows/{id}     - 삭제
```

### 4.2 Next.js API Routes (비즈니스 로직)

bkend.ai 자동 CRUD 외에, 비즈니스 로직이 필요한 부분은 Next.js API Route로 구현합니다.

| Method | Path | 설명 | 인증 | FR |
|--------|------|------|:----:|------|
| POST | `/api/auth/register` | 업체 회원가입 (Company 생성 + bkend auth) | - | FR-06 |
| POST | `/api/auth/login` | 업체 로그인 | - | FR-07 |
| POST | `/api/auth/logout` | 업체 로그아웃 | O | FR-07 |
| GET | `/api/jobs` | 공고 목록 (필터/정렬/페이지네이션, active만) | - | FR-01,02 |
| GET | `/api/jobs/[id]` | 공고 상세 (view_count 증가) | - | FR-03 |
| POST | `/api/jobs` | 공고 등록 (하루 2건 체크) | 업체 | FR-08,10 |
| PUT | `/api/jobs/[id]` | 공고 수정 (본인만) | 업체 | FR-09 |
| DELETE | `/api/jobs/[id]` | 공고 삭제 (본인만) | 업체 | FR-09 |
| GET | `/api/dashboard/jobs` | 내 공고 목록 (모든 상태) | 업체 | FR-11 |
| GET | `/api/dashboard/profile` | 내 업체 정보 | 업체 | FR-12 |
| PUT | `/api/dashboard/profile` | 업체 프로필 수정 | 업체 | FR-12 |
| GET | `/api/admin/companies` | 업체 목록 (관리자) | 관리자 | FR-13 |
| PUT | `/api/admin/companies/[id]` | 업체 승인/거부 | 관리자 | FR-13 |
| GET | `/api/admin/jobs` | 공고 목록 (관리자, 모든 상태) | 관리자 | FR-14 |
| PUT | `/api/admin/jobs/[id]` | 공고 상태 변경 (승인/숨김/VIP) | 관리자 | FR-14,15 |
| GET | `/api/admin/stats` | 통계 데이터 | 관리자 | FR-16 |

### 4.3 주요 API 상세

#### POST `/api/auth/register` (업체 회원가입)

**Request:**
```json
{
  "email": "company@example.com",
  "password": "securePassword123",
  "company_name": "ABC아웃소싱",
  "biz_number": "123-45-67890",
  "rep_name": "홍길동",
  "phone": "010-1234-5678",
  "address": "경기도 화성시 동탄대로 123"
}
```

**Response (201):**
```json
{
  "id": "company_abc123",
  "email": "company@example.com",
  "company_name": "ABC아웃소싱",
  "status": "pending",
  "message": "회원가입이 완료되었습니다. 관리자 승인 후 이용 가능합니다."
}
```

**비즈니스 로직:**
1. bkend.ai auth로 계정 생성
2. companies 테이블에 업체 정보 저장 (status: 'pending')
3. 사업자등록번호 중복 체크
4. 이메일 중복 체크

#### POST `/api/jobs` (공고 등록)

**Request:**
```json
{
  "title": "화성 반도체 공장 생산직 모집",
  "industry": "PRODUCTION",
  "region_city": "경기",
  "region_district": "화성시",
  "salary_type": "MONTHLY",
  "salary_amount": 2800000,
  "work_hours": "08:00~17:00",
  "work_shift": "DAY",
  "visa_types": ["E-9", "F-4", "H-2"],
  "tags": ["DORMITORY", "MEAL", "SHUTTLE", "INSURANCE"],
  "dormitory": true,
  "description": "삼성전자 협력사 반도체 공장...",
  "contact_phone": "031-1234-5678",
  "contact_kakao": "abc_outsourcing"
}
```

**비즈니스 로직:**
1. 업체 status === 'approved' 확인
2. 오늘 등록한 공고 수 체크 (2건 제한, is_vip 제외)
3. status: 'pending'으로 생성 (관리자 승인 필요)
4. expires_at: created_at + 30일 자동 설정

#### GET `/api/jobs` (공고 목록)

**Query Parameters:**
```
?industry=PRODUCTION
&region_city=경기
&visa_type=E-9
&salary_type=MONTHLY
&sort=latest       (latest | salary_high | salary_low)
&page=1
&limit=20
```

**Response:**
```json
{
  "data": [
    {
      "id": "job_123",
      "title": "화성 반도체 공장 생산직 모집",
      "company_name": "ABC아웃소싱",
      "industry": "PRODUCTION",
      "region_city": "경기",
      "region_district": "화성시",
      "salary_type": "MONTHLY",
      "salary_amount": 2800000,
      "tags": ["DORMITORY", "MEAL", "SHUTTLE"],
      "is_vip": false,
      "created_at": "2026-02-27T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "total_pages": 8
  }
}
```

**비즈니스 로직:**
1. status === 'active'인 공고만 반환
2. is_vip === true인 공고 상단 고정
3. 만료된 공고(expires_at < now) 자동 제외

---

## 5. UI/UX 설계

### 5.1 메인 페이지 (/)

```
┌─────────────────────────────────────────┐
│  🔷 114Korea       [업체 로그인] [공고등록]│ Header
├─────────────────────────────────────────┤
│                                          │
│  안전한 일자리, 114Korea에서 찾으세요      │ Hero
│  ┌──────────────────────────────────┐   │
│  │  🔍 검색어 입력...    [검색]      │   │ 검색바
│  └──────────────────────────────────┘   │
│                                          │
│  [서울][경기][인천][부산][대구]...        │ 지역 빠른필터
│  [생산][건설][물류][외식][매장]...        │ 업종 빠른필터
│                                          │
├─────────────────────────────────────────┤
│  ⭐ VIP 채용정보                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │ VIP 공고 슬라이드
│  │VIP 공고1 │ │VIP 공고2 │ │VIP 공고3 │   │ (가로 스크롤)
│  │회사명    │ │회사명    │ │회사명    │   │
│  │월 280만  │ │일 15만   │ │월 300만  │   │
│  │경기 화성 │ │서울 강서 │ │인천 남동 │   │
│  └─────────┘ └─────────┘ └─────────┘   │
│                                          │
├─────────────────────────────────────────┤
│  📋 최신 채용정보              [전체보기 >]│
│  ┌──────────────────────────────────┐   │
│  │ 🏭 화성 반도체 공장 생산직 모집    │   │ 공고 카드
│  │ ABC아웃소싱 | 경기 화성시           │   │
│  │ 월급 280만원                       │   │
│  │ [숙소제공][식사제공][통근버스]       │   │ 태그
│  │ E-9 F-4 H-2 | 2시간 전            │   │
│  ├──────────────────────────────────┤   │
│  │ 🍳 강남 일식집 주방보조 구함        │   │
│  │ ...                               │   │
│  └──────────────────────────────────┘   │
│                                          │
├─────────────────────────────────────────┤
│  114Korea | 이용약관 | 개인정보처리방침   │ Footer
│  고객센터: 010-xxxx-xxxx               │
└─────────────────────────────────────────┘
```

### 5.2 구인공고 목록 (/jobs)

```
┌─────────────────────────────────────────┐
│  🔷 114Korea       [업체 로그인] [공고등록]│
├─────────────────────────────────────────┤
│  필터                                    │
│  지역: [전체 v]  업종: [전체 v]           │
│  비자: [전체 v]  급여: [전체 v]           │
│  정렬: [최신순 v]                         │
├─────────────────────────────────────────┤
│                                          │
│  총 156건의 채용정보                       │
│                                          │
│  ⭐VIP ────────────────────────────────  │
│  │ 🏭 [VIP] 화성 반도체 공장             │
│  │ ABC아웃소싱 | 경기 화성시              │
│  │ 월급 280만원                          │
│  │ [숙소제공][식사제공][4대보험]           │
│  │ E-9 F-4 H-2                          │
│  ─────────────────────────────────────  │
│                                          │
│  │ 🍳 강남 일식집 주방보조                │
│  │ 스시야마 | 서울 강남구                 │
│  │ 시급 12,000원                         │
│  │ [식사제공][초보가능]                    │
│  │ F-4 F-5 F-6                          │
│  ─────────────────────────────────────  │
│                                          │
│  │ 🚚 인천 물류센터 분류원                │
│  │ ...                                   │
│                                          │
│  [1] [2] [3] [4] ... [8]  페이지네이션    │
│                                          │
├─────────────────────────────────────────┤
│  Footer                                  │
└─────────────────────────────────────────┘
```

### 5.3 공고 상세 (/jobs/[id])

```
┌─────────────────────────────────────────┐
│  🔷 114Korea              [< 목록으로]    │
├─────────────────────────────────────────┤
│                                          │
│  🏭 화성 반도체 공장 생산직 모집           │ 제목
│  ABC아웃소싱 ✅검증업체                    │ 회사명 + 뱃지
│                                          │
│  ┌──────────────────────────────────┐   │
│  │ 💰 급여    월급 2,800,000원       │   │
│  │ 📍 근무지   경기 화성시 동탄       │   │ 기본정보
│  │ ⏰ 근무시간  08:00~17:00 (주간)   │   │ 카드
│  │ 📋 업종    생산/제조              │   │
│  │ 🏠 숙소    제공 (기숙사)          │   │
│  │ 📄 비자    E-9, F-4, H-2         │   │
│  └──────────────────────────────────┘   │
│                                          │
│  근무조건                                 │
│  [숙소제공] [식사제공] [통근버스]           │ 태그 뱃지
│  [4대보험] [퇴직금] [잔업많음]             │
│                                          │
│  상세 설명                                │
│  ──────────────────────────────────────  │
│  삼성전자 협력사 반도체 공장에서            │
│  생산직 근무자를 모집합니다.               │ 설명 텍스트
│  ...                                     │
│  ──────────────────────────────────────  │
│                                          │
│  업체 정보                                │
│  ──────────────────────────────────────  │
│  회사명: ABC아웃소싱                       │
│  주소: 경기도 화성시 동탄대로 123          │
│  ──────────────────────────────────────  │
│                                          │
│  ┌──────────────────────────────────┐   │
│  │  📞 전화하기     💬 카카오톡       │   │ 연락 버튼
│  │  031-1234-5678   abc_outsourcing  │   │ (고정 하단)
│  └──────────────────────────────────┘   │
│                                          │
├─────────────────────────────────────────┤
│  등록일: 2026-02-27 | 조회: 234회         │
│  마감일: 2026-03-29                       │
└─────────────────────────────────────────┘
```

### 5.4 업체 회원가입 (/auth/register)

```
┌─────────────────────────────────────────┐
│  🔷 114Korea                             │
├─────────────────────────────────────────┤
│                                          │
│  업체 회원가입                             │
│                                          │
│  이메일 *                                 │
│  ┌──────────────────────────────────┐   │
│  │  company@example.com              │   │
│  └──────────────────────────────────┘   │
│                                          │
│  비밀번호 *                               │
│  ┌──────────────────────────────────┐   │
│  │  ••••••••                         │   │
│  └──────────────────────────────────┘   │
│  영문+숫자 8자 이상                       │
│                                          │
│  비밀번호 확인 *                           │
│  ┌──────────────────────────────────┐   │
│  │  ••••••••                         │   │
│  └──────────────────────────────────┘   │
│                                          │
│  ─── 업체 정보 ───                        │
│                                          │
│  회사명 *                                 │
│  ┌──────────────────────────────────┐   │
│  │  ABC아웃소싱                       │   │
│  └──────────────────────────────────┘   │
│                                          │
│  사업자등록번호 *                          │
│  ┌──────────────────────────────────┐   │
│  │  123-45-67890                     │   │
│  └──────────────────────────────────┘   │
│                                          │
│  대표자명 *                               │
│  ┌──────────────────────────────────┐   │
│  │  홍길동                            │   │
│  └──────────────────────────────────┘   │
│                                          │
│  연락처 *                                 │
│  ┌──────────────────────────────────┐   │
│  │  010-1234-5678                    │   │
│  └──────────────────────────────────┘   │
│                                          │
│  주소 *                                   │
│  ┌──────────────────────────────────┐   │
│  │  경기도 화성시 동탄대로 123        │   │
│  └──────────────────────────────────┘   │
│                                          │
│  ┌──────────────────────────────────┐   │
│  │         📝  회원가입               │   │
│  └──────────────────────────────────┘   │
│                                          │
│  이미 계정이 있으신가요? [로그인]          │
│                                          │
│  * 회원가입 후 관리자 승인이 필요합니다    │
│                                          │
└─────────────────────────────────────────┘
```

### 5.5 업체 대시보드 (/dashboard)

```
┌─────────────────────────────────────────┐
│  🔷 114Korea    ABC아웃소싱   [로그아웃]   │
├─────────────────────────────────────────┤
│  [내 공고] [공고 등록] [프로필]            │ 탭 메뉴
├─────────────────────────────────────────┤
│                                          │
│  내 공고 관리                   오늘 0/2건 │
│                                          │
│  상태: [전체 v]                           │
│                                          │
│  ┌──────────────────────────────────┐   │
│  │ 🟢공개  화성 반도체 공장 생산직    │   │
│  │ 등록: 02/27 | 조회: 234          │   │
│  │ [수정] [삭제]                     │   │
│  ├──────────────────────────────────┤   │
│  │ 🟡심사중  인천 물류센터 분류원     │   │
│  │ 등록: 02/27 | 조회: 0            │   │
│  │ [수정] [삭제]                     │   │
│  ├──────────────────────────────────┤   │
│  │ 🔴거부  서울 식당 홀서빙          │   │
│  │ 사유: 연락처 미기재               │   │
│  │ [수정 후 재등록]                  │   │
│  └──────────────────────────────────┘   │
│                                          │
└─────────────────────────────────────────┘
```

### 5.6 공고 등록 (/dashboard/jobs/new)

```
┌─────────────────────────────────────────┐
│  🔷 114Korea    ABC아웃소싱   [로그아웃]   │
├─────────────────────────────────────────┤
│                                          │
│  구인공고 등록              오늘 0/2건    │
│                                          │
│  공고 제목 *                              │
│  ┌──────────────────────────────────┐   │
│  │                                   │   │
│  └──────────────────────────────────┘   │
│                                          │
│  업종 *                                   │
│  [생산/제조 v]                            │
│                                          │
│  근무 지역 *                              │
│  [경기 v] [화성시 v]                      │
│                                          │
│  급여 *                                   │
│  [월급 v] ┌──────────┐ 원               │
│           │ 2,800,000 │                  │
│           └──────────┘                   │
│                                          │
│  근무시간 *                               │
│  ┌──────────────────────────────────┐   │
│  │  08:00~17:00                      │   │
│  └──────────────────────────────────┘   │
│                                          │
│  근무형태 *                               │
│  [주간 v]                                │
│                                          │
│  가능 비자 * (복수 선택)                   │
│  [✓ E-9][✓ F-4][ F-5][ F-6][✓ H-2]     │
│  [ E-7][ F-2]                            │
│                                          │
│  근무조건 태그 (복수 선택)                  │
│  [✓ 숙소제공][✓ 식사제공][✓ 통근버스]      │
│  [✓ 4대보험][ 초보가능][ 즉시출근]         │
│  [ 주급가능][ 당일지급][ 야간수당]         │
│  [ 퇴직금][ 잔업많음][ 외국인가능]         │
│  [ 한국어불필요][ 부부가능][ 차량지원]     │
│                                          │
│  숙소 제공 *                              │
│  (●) 제공  ( ) 미제공                     │
│                                          │
│  상세 설명 *                              │
│  ┌──────────────────────────────────┐   │
│  │  근무 내용, 자격 요건 등을          │   │
│  │  자세히 작성해 주세요.             │   │
│  │                                   │   │
│  └──────────────────────────────────┘   │
│                                          │
│  연락처 전화번호 *                        │
│  ┌──────────────────────────────────┐   │
│  │  031-1234-5678                    │   │
│  └──────────────────────────────────┘   │
│                                          │
│  카카오톡 ID (선택)                       │
│  ┌──────────────────────────────────┐   │
│  │  abc_outsourcing                  │   │
│  └──────────────────────────────────┘   │
│                                          │
│  ┌──────────────────────────────────┐   │
│  │          📝 공고 등록              │   │
│  └──────────────────────────────────┘   │
│                                          │
│  * 관리자 심사 후 공개됩니다 (영업일 기준)  │
│                                          │
└─────────────────────────────────────────┘
```

### 5.7 관리자 - 업체 관리 (/admin/companies)

```
┌─────────────────────────────────────────┐
│  🔷 114Korea 관리자     [대시보드] [로그아웃]│
├─────────────────────────────────────────┤
│  [업체관리] [공고관리]                     │
├─────────────────────────────────────────┤
│                                          │
│  업체 관리        총 45개사               │
│                                          │
│  상태: [전체 v] [대기중] [승인] [거부]     │
│                                          │
│  ┌──────────────────────────────────┐   │
│  │ 🟡대기  ABC아웃소싱               │   │
│  │ 사업자: 123-45-67890             │   │
│  │ 대표: 홍길동 | 010-1234-5678     │   │
│  │ 가입일: 2026-02-27              │   │
│  │ [✅ 승인]  [❌ 거부]              │   │
│  ├──────────────────────────────────┤   │
│  │ 🟢승인  XYZ파견                  │   │
│  │ 사업자: 987-65-43210             │   │
│  │ 등록공고: 12건                    │   │
│  │ [🔴 승인취소]                     │   │
│  └──────────────────────────────────┘   │
│                                          │
└─────────────────────────────────────────┘
```

### 5.8 관리자 - 공고 관리 (/admin/jobs)

```
┌─────────────────────────────────────────┐
│  🔷 114Korea 관리자     [대시보드] [로그아웃]│
├─────────────────────────────────────────┤
│  [업체관리] [공고관리]                     │
├─────────────────────────────────────────┤
│                                          │
│  📊 오늘: 업체 45 | 공고 156 | 신규 8    │ 통계 (FR-16)
│     VIP 5건                              │
│                                          │
│  공고 관리                                │
│  상태: [전체 v] [심사중] [공개] [숨김]     │
│                                          │
│  ┌──────────────────────────────────┐   │
│  │ 🟡심사중  화성 반도체 공장 생산직  │   │
│  │ ABC아웃소싱 | 2026-02-27         │   │
│  │ [✅ 승인] [❌ 숨김] [⭐ VIP지정]   │   │
│  ├──────────────────────────────────┤   │
│  │ 🟢공개 ⭐VIP  인천 물류센터       │   │
│  │ XYZ파견 | 2026-02-26            │   │
│  │ [❌ 숨김] [⭐ VIP해제] [🗑 삭제]  │   │
│  └──────────────────────────────────┘   │
│                                          │
└─────────────────────────────────────────┘
```

---

## 6. 컴포넌트 구조

### 6.1 공통 컴포넌트 (components/)

| 컴포넌트 | 위치 | 역할 |
|----------|------|------|
| `Header` | `components/layout/Header.tsx` | 상단 네비게이션 (로고, 로그인, 공고등록) |
| `Footer` | `components/layout/Footer.tsx` | 하단 정보 (이용약관, 개인정보, 연락처) |
| `Button` | `components/ui/Button.tsx` | 공통 버튼 (variant: primary/secondary/danger) |
| `Input` | `components/ui/Input.tsx` | 입력 필드 (label, error 포함) |
| `Select` | `components/ui/Select.tsx` | 드롭다운 선택 |
| `Badge` | `components/ui/Badge.tsx` | 태그/뱃지 (VIP, 상태, 근무조건) |
| `Card` | `components/ui/Card.tsx` | 카드 레이아웃 |
| `Pagination` | `components/ui/Pagination.tsx` | 페이지네이션 |
| `Modal` | `components/ui/Modal.tsx` | 모달 (삭제 확인 등) |
| `Spinner` | `components/ui/Spinner.tsx` | 로딩 스피너 |
| `EmptyState` | `components/ui/EmptyState.tsx` | 데이터 없음 표시 |

### 6.2 공고 관련 컴포넌트 (components/job/)

| 컴포넌트 | 위치 | 역할 |
|----------|------|------|
| `JobCard` | `components/job/JobCard.tsx` | 공고 카드 (목록용, VIP 스타일 분기) |
| `JobFilter` | `components/job/JobFilter.tsx` | 필터 패널 (지역/업종/비자/급여) |
| `JobTagBadge` | `components/job/JobTagBadge.tsx` | 근무조건 태그 뱃지 |
| `VisaBadge` | `components/job/VisaBadge.tsx` | 비자 유형 뱃지 |
| `SalaryDisplay` | `components/job/SalaryDisplay.tsx` | 급여 표시 (유형+금액 포맷팅) |
| `ContactButtons` | `components/job/ContactButtons.tsx` | 전화/카카오톡 연락 버튼 |
| `JobForm` | `components/job/JobForm.tsx` | 공고 등록/수정 폼 (react-hook-form) |
| `VipSlider` | `components/job/VipSlider.tsx` | VIP 공고 가로 슬라이드 (메인용) |

### 6.3 기능별 모듈 (features/)

```
features/
├── auth/
│   ├── hooks/
│   │   ├── useAuth.ts              # 로그인 상태 관리
│   │   └── useRegister.ts          # 회원가입 로직
│   └── components/
│       ├── LoginForm.tsx            # 로그인 폼
│       └── RegisterForm.tsx         # 회원가입 폼
│
├── jobs/
│   ├── hooks/
│   │   ├── useJobs.ts              # 공고 목록 조회 + 필터
│   │   ├── useJob.ts               # 공고 상세 조회
│   │   └── useJobMutation.ts       # 공고 생성/수정/삭제
│   ├── store/
│   │   └── jobFilterStore.ts       # 필터 상태 (Zustand)
│   └── utils/
│       ├── constants.ts            # 업종/비자/태그 상수 + 한글 라벨
│       └── validators.ts           # 공고 폼 검증 스키마 (zod)
│
├── company/
│   ├── hooks/
│   │   ├── useDashboard.ts         # 대시보드 데이터
│   │   └── useProfile.ts           # 프로필 조회/수정
│   └── components/
│       └── DashboardJobList.tsx     # 내 공고 목록
│
└── admin/
    ├── hooks/
    │   ├── useAdminCompanies.ts     # 업체 관리
    │   ├── useAdminJobs.ts          # 공고 관리
    │   └── useAdminStats.ts         # 통계
    └── components/
        ├── CompanyList.tsx          # 업체 목록 + 승인/거부
        ├── AdminJobList.tsx         # 공고 목록 + 상태관리
        └── StatsCard.tsx            # 통계 카드
```

---

## 7. 에러 처리

### 7.1 에러 코드

| 코드 | 메시지 | 원인 | 처리 |
|------|--------|------|------|
| 400 | 입력값이 올바르지 않습니다 | 폼 검증 실패 | 필드별 에러 메시지 표시 |
| 401 | 로그인이 필요합니다 | 인증 토큰 없음/만료 | 로그인 페이지로 이동 |
| 403 | 권한이 없습니다 | 승인되지 않은 업체/관리자 아님 | 에러 메시지 + 돌아가기 |
| 404 | 공고를 찾을 수 없습니다 | 삭제/만료된 공고 | 404 페이지 표시 |
| 429 | 오늘 등록 가능한 공고 수를 초과했습니다 | 하루 2건 제한 | 안내 메시지 |
| 500 | 서버 오류가 발생했습니다 | 서버 에러 | 재시도 안내 |

---

## 8. 보안 고려사항

- [x] 입력값 검증 (zod 스키마로 서버/클라이언트 양측 검증)
- [x] XSS 방지 (React 기본 이스케이프 + description dangerouslySetInnerHTML 미사용)
- [x] 인증/인가 (bkend.ai JWT + 미들웨어에서 role 체크)
- [x] 사업자등록번호 포맷 검증 (000-00-00000)
- [x] Rate Limiting (공고 등록 하루 2건)
- [x] HTTPS (Vercel 기본 제공)

---

## 9. 코딩 컨벤션

### 9.1 네이밍 규칙

| 대상 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 | PascalCase | `JobCard`, `LoginForm` |
| 함수/훅 | camelCase | `useJobs()`, `handleSubmit()` |
| 상수 | UPPER_SNAKE_CASE | `INDUSTRY_OPTIONS`, `VISA_TYPES` |
| 타입 | PascalCase | `JobPost`, `CompanyStatus` |
| 파일 (컴포넌트) | PascalCase.tsx | `JobCard.tsx` |
| 파일 (유틸) | camelCase.ts | `formatSalary.ts` |
| 폴더 | kebab-case | `job-filter/` |

### 9.2 Import 순서

```typescript
// 1. 외부 라이브러리
import { useState } from 'react'
import { useForm } from 'react-hook-form'

// 2. 내부 절대 경로
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/features/auth/hooks/useAuth'

// 3. 상대 경로
import { JobCard } from './JobCard'

// 4. 타입 import
import type { JobPost } from '@/types/job'
```

### 9.3 환경변수

| 변수 | 용도 | 범위 |
|------|------|------|
| `NEXT_PUBLIC_BKEND_URL` | bkend.ai API 주소 | Client |
| `BKEND_API_KEY` | bkend.ai 서버 인증키 | Server |
| `NEXT_PUBLIC_SITE_URL` | 사이트 URL | Client |
| `ADMIN_EMAIL` | 관리자 이메일 (초기 설정) | Server |

---

## 10. 구현 순서

### Phase 1: 프로젝트 초기화
1. [ ] Next.js 15 프로젝트 생성 (pnpm create next-app)
2. [ ] Tailwind CSS 설정
3. [ ] TypeScript 타입 정의 (types/)
4. [ ] 공통 UI 컴포넌트 (Button, Input, Select, Badge, Card)
5. [ ] 레이아웃 컴포넌트 (Header, Footer)
6. [ ] 상수 정의 (업종, 비자, 태그, 지역)

### Phase 2: bkend.ai 연동 + 인증
7. [ ] bkend.ai 프로젝트 설정 + 테이블 생성 (companies, job_posts)
8. [ ] bkend.ai 클라이언트 설정 (lib/bkend.ts)
9. [ ] 인증 기능 (회원가입, 로그인, 로그아웃)
10. [ ] 인증 미들웨어 (업체/관리자 권한 체크)

### Phase 3: 공고 CRUD (업체)
11. [ ] 공고 등록 폼 + API (JobForm, POST /api/jobs)
12. [ ] 공고 수정/삭제 + API
13. [ ] 업체 대시보드 (내 공고 목록)
14. [ ] 하루 2건 등록 제한 로직
15. [ ] 업체 프로필 관리

### Phase 4: 공개 페이지 (외국인 근로자용)
16. [ ] 공고 목록 페이지 + 필터/정렬/페이지네이션
17. [ ] 공고 상세 페이지 + 조회수 카운팅
18. [ ] 연락하기 (전화/카카오톡)
19. [ ] VIP 공고 슬라이더 (메인)
20. [ ] 메인 페이지 조합

### Phase 5: 관리자
21. [ ] 관리자 인증 (별도 로그인 or role 체크)
22. [ ] 업체 관리 (승인/거부)
23. [ ] 공고 관리 (승인/숨김/삭제)
24. [ ] VIP 수동 지정
25. [ ] 통계 대시보드

### Phase 6: 마무리
26. [ ] SEO 최적화 (메타태그, sitemap, robots.txt)
27. [ ] 반응형 점검 (모바일/태블릿/데스크탑)
28. [ ] 이용약관/개인정보처리방침 페이지
29. [ ] 에러 페이지 (404, 500)
30. [ ] 빌드 + 배포 (Vercel)

---

## 버전 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 0.1 | 2026-02-27 | 초안 작성 - UI/API/컴포넌트/구현순서 | acctb |
