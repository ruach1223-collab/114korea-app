# 114Korea 크롤러 Gap 분석 리포트

> **분석 유형**: Gap Analysis (설계-구현 비교)
>
> **프로젝트**: 114Korea
> **분석 대상**: 크롤링 공고 수집 및 차별화 표시 기능
> **분석일**: 2026-03-04
> **설계 문서**: 구현 계획서 (크롤링 공고 vs 직접 공고 차별화)

---

## 1. 분석 개요

### 1.1 분석 목적

크롤러 구현 계획(4개 Step) 대비 실제 구현 코드의 일치율을 측정하고,
미구현/불일치/추가 구현 항목을 식별한다.

### 1.2 분석 범위

- **설계 문서**: 크롤러 구현 계획 (Step 1~4, 파일 변경 요약)
- **구현 코드**: 8개 파일
  - `scripts/crawl-114kr.mjs` (신규)
  - `src/app/jobs/[id]/page.tsx` (수정)
  - `src/app/admin/jobs/page.tsx` (수정)
  - `supabase/schema.sql` (수정)
  - `src/lib/jobs.ts` (수정)
  - `src/app/api/admin/jobs/route.ts` (수정)
  - `src/app/api/admin/stats/route.ts` (수정)
  - `src/app/admin/page.tsx` (수정)

---

## 2. 전체 스코어

| 카테고리 | 점수 | 상태 |
|----------|:----:|:----:|
| Step 1: 크롤러 스크립트 | 100% | Pass |
| Step 2: 공고 상세 페이지 수정 | 100% | Pass |
| Step 3: 가짜 업체 처리 | 100% | Pass |
| Step 4: 관리자 크롤링 관리 | 100% | Pass |
| **종합 일치율** | **100%** | **Pass** |

---

## 3. Step별 상세 분석

### 3.1 Step 1: 크롤러 스크립트 (`scripts/crawl-114kr.mjs`)

| 요구사항 | 구현 여부 | 근거 |
|----------|:---------:|------|
| Puppeteer로 114114kr.com/board 접속 | Pass | L20-21: `BASE_URL = 'https://114114kr.com'`, `BOARD_URL = \`${BASE_URL}/board\`` + Puppeteer import (L13) |
| 페이지네이션 포함 전체 공고 목록 수집 | Pass | L267-349: `collectJobLinks()` 함수에서 `MAX_PAGES`(=10) 까지 반복하며 페이지별 수집 |
| 각 공고 상세 페이지에서 파싱: 제목 | Pass | L367-380: `titleCandidates` 배열로 다양한 셀렉터 시도 |
| 각 공고 상세 페이지에서 파싱: 업종 | Pass | L76-87: `mapIndustry()` 함수로 카테고리 매핑 |
| 각 공고 상세 페이지에서 파싱: 지역 | Pass | L123-142: `parseRegion()` 함수로 광역시/도 + 구/시/군 파싱 |
| 각 공고 상세 페이지에서 파싱: 급여 | Pass | L90-120: `parseSalary()` 함수로 시급/일급/월급/협의 파싱 |
| 각 공고 상세 페이지에서 파싱: 근무시간 | Pass | L456: `info['근무시간'] \|\| info['시간'] \|\| info['근무'] \|\| '08:00~17:00'` |
| 각 공고 상세 페이지에서 파싱: 설명 | Pass | L397-409: `descCandidates` 셀렉터로 본문 추출 |
| 각 공고 상세 페이지에서 파싱: 업체명 | Pass | L416: `info['업체명'] \|\| info['회사명'] \|\| info['업체'] \|\| info['회사']` |
| 각 공고 상세 페이지에서 파싱: 연락처 | Pass | L412-413: 정규식으로 전화번호 패턴 매칭 |
| 114korea 스키마에 매핑 | Pass | L436-491: `toJobRecord()` 함수가 모든 필드를 114korea 스키마에 맞게 변환 |
| `source: 'crawled'`로 INSERT | Pass | L487: `source: 'crawled'` |
| 중복 체크: `source_url` 기준 | Pass | L496-499: `.eq('source_url', record.source_url).limit(1)` 으로 중복 확인 후 스킵 |
| 속도 제한: 요청 간 5초 대기 | Pass | L23: `REQUEST_DELAY_MS = 5000`, L343/564/588에서 `await delay(REQUEST_DELAY_MS)` 호출 |
| 실행: `node scripts/crawl-114kr.mjs` | Pass | L5: 사용법 주석에 명시, L602: `main()` 호출로 직접 실행 가능 |

**추가 구현 (설계에 없으나 구현됨)**:

| 항목 | 위치 | 설명 |
|------|------|------|
| `--inspect` 모드 | L62, L172-264 | 페이지 구조 탐색용 디버그 모드 (HTML 저장 포함) |
| `--dry-run` 모드 | L63, L570-573 | DB 저장 없이 파싱 결과만 출력하는 테스트 모드 |
| 비자 파싱 | L145-154 | `parseVisaTypes()` - E-9, H-2 등 비자 코드 자동 추출 |
| 태그 파싱 | L157-169 | `parseTags()` - 숙소/식사/셔틀 등 조건 태그 자동 추출 |
| 업종 매핑 | L76-87 | `mapIndustry()` - 텍스트 기반 업종 코드 자동 분류 |
| 환경변수 로딩 | L30-46 | `.env.local` 파일 직접 파싱 (dotenv 의존성 없이) |
| 결과 통계 | L591-592 | 크롤링 완료 후 저장/스킵/실패 건수 출력 |

**Step 1 일치율: 100%** (14/14 필수 요구사항 충족 + 7개 추가 기능)

---

### 3.2 Step 2: 공고 상세 페이지 수정 (`src/app/jobs/[id]/page.tsx`)

| 요구사항 | 구현 여부 | 근거 |
|----------|:---------:|------|
| `source === 'crawled'`일 때 연락처(ContactButtons) 대신 "원문에서 확인하기" 버튼 | Pass | L190-203: `job.source === 'crawled' && job.source_url` 조건으로 분기, `source_url` 링크 버튼 표시 |
| source_url 링크 (target="_blank") | Pass | L192-199: `target="_blank"`, `rel="noopener noreferrer"` 포함 |
| 업체정보 섹션에 "이 공고는 외부 사이트에서 수집되었습니다" 안내 | Pass | L168-176: 앰버 색상 배경의 안내 메시지 표시 |
| 상세설명은 표시하되 하단에 "전체 내용은 원문에서 확인" 링크 | Pass | L148-159: 설명 하단에 `source_url`로 연결되는 "전체 내용은 원문에서 확인 ->" 링크 |
| 직접등록 공고는 기존과 동일 (ContactButtons 유지) | Pass | L205: `<ContactButtons phone={job.contact_phone} kakao={job.contact_kakao} />` |

**추가 구현 (설계에 없으나 구현됨)**:

| 항목 | 위치 | 설명 |
|------|------|------|
| 출처 배지 표시 | L79-89 | 크롤링=`외부수집` 배지, 직접등록=`검증업체` 배지 |
| 연락처 안내 문구 | L200-202 | "연락처와 상세 내용은 원본 사이트에서 확인하세요" 부가 안내 |

**Step 2 일치율: 100%** (5/5 필수 요구사항 충족 + 2개 추가 기능)

---

### 3.3 Step 3: 크롤링 공고 "가짜 업체" 처리

| 요구사항 | 구현 여부 | 근거 |
|----------|:---------:|------|
| 크롤링 공고용 시스템 업체 1개 생성 | Pass | `schema.sql` L104-107: `'c0000000-crawl-0000-0000-000000000000'` ID로 시스템 업체 INSERT |
| company_id 필요하므로 가짜 업체 사용 | Pass | `crawl-114kr.mjs` L22: `CRAWLED_COMPANY_ID = 'c0000000-crawl-0000-0000-000000000000'`, L469: `company_id: CRAWLED_COMPANY_ID` |
| 모든 크롤링 공고는 이 업체 ID로 저장 | Pass | `crawl-114kr.mjs` L469: `toJobRecord()` 함수에서 모든 레코드에 `CRAWLED_COMPANY_ID` 할당 |
| `schema.sql`에 `crawled-company` INSERT | Pass | `schema.sql` L104-107: 업체명 `'114Korea 외부수집'`, 사업자번호 `'000-00-00000'`, 상태 `'approved'` |

**Step 3 일치율: 100%** (4/4 필수 요구사항 충족)

---

### 3.4 Step 4: 관리자 크롤링 관리

| 요구사항 | 구현 여부 | 근거 |
|----------|:---------:|------|
| `src/app/admin/page.tsx` 통계에 크롤링 공고 수 표시 | Pass | L72: `<StatCard label="크롤링 공고" value={stats.jobs.crawled} color="blue" />` |
| 통계 데이터에 crawled 카운트 포함 | Pass | `src/lib/jobs.ts` L321: `crawled: jobs.filter(j => j.source === 'crawled').length` |
| Stats API에서 crawled 반환 | Pass | `src/app/api/admin/stats/route.ts` L28: `crawled: jobStats.crawled` |
| Stats 타입에 crawled 필드 | Pass | `src/app/admin/page.tsx` L8: `jobs: { ... crawled: number }` |
| 관리자 공고 목록에서 출처 필터 추가 | Pass | `src/app/admin/jobs/page.tsx` L107-126: 전체/직접등록/크롤링 3개 필터 버튼 |
| 필터 값: 전체/직접등록(organic)/크롤링(crawled) | Pass | L109-113: `{ value: '', label: '전체 출처' }`, `{ value: 'organic', label: '직접등록' }`, `{ value: 'crawled', label: '크롤링' }` |
| API에서 source 필터 파라미터 처리 | Pass | `src/app/api/admin/jobs/route.ts` L16: `source: searchParams.get('source')` |
| `src/lib/jobs.ts` getAllJobs에서 source 필터 | Pass | L288: `getAllJobs(filters: { ... source?: string })`, L294: `if (filters.source) query = query.eq('source', filters.source)` |
| 공고 목록에 출처 표시 | Pass | `src/app/admin/jobs/page.tsx` L178: `출처: {job.source === 'crawled' ? '크롤링' : '직접등록'}` |

**Step 4 일치율: 100%** (9/9 필수 요구사항 충족)

---

## 4. 파일 변경 요약 비교

### 4.1 설계 파일 목록 vs 실제 변경

| 파일 | 설계 분류 | 실제 변경 | 상태 |
|------|:---------:|:---------:|:----:|
| `scripts/crawl-114kr.mjs` | 신규 | 신규 (603줄) | Pass |
| `src/app/jobs/[id]/page.tsx` | 수정 | 수정 (217줄) | Pass |
| `src/app/admin/jobs/page.tsx` | 수정 | 수정 (243줄) | Pass |
| `supabase/schema.sql` | 수정 | 수정 (233줄) | Pass |
| `src/lib/jobs.ts` | 추가 수정 | 수정 (375줄) | Pass |
| `src/app/api/admin/jobs/route.ts` | 추가 수정 | 수정 (20줄) | Pass |
| `src/app/api/admin/stats/route.ts` | 추가 수정 | 수정 (37줄) | Pass |
| `src/app/admin/page.tsx` | 추가 수정 | 수정 (155줄) | Pass |

**파일 일치율: 8/8 (100%)** - 설계에 명시된 모든 파일이 구현됨

---

## 5. 설계-구현 차이 상세

### 5.1 Missing Features (설계 O, 구현 X)

없음.

### 5.2 Added Features (설계 X, 구현 O)

| 항목 | 구현 위치 | 설명 | 영향 |
|------|-----------|------|------|
| `--inspect` 디버그 모드 | `crawl-114kr.mjs` L62, L172-264 | 크롤링 대상 사이트 구조 탐색 기능 | 긍정적 - 디버깅 용이 |
| `--dry-run` 테스트 모드 | `crawl-114kr.mjs` L63, L570-573 | DB 저장 없이 파싱 결과만 확인 | 긍정적 - 안전한 테스트 |
| 비자 자동 파싱 | `crawl-114kr.mjs` L145-154 | 공고 본문에서 비자 코드 자동 추출 | 긍정적 - 데이터 풍부화 |
| 태그 자동 파싱 | `crawl-114kr.mjs` L157-169 | 숙소/식사/셔틀 등 조건 태그 추출 | 긍정적 - 데이터 풍부화 |
| 업종 자동 매핑 | `crawl-114kr.mjs` L76-87 | 텍스트 기반 업종 코드 자동 분류 | 긍정적 - 데이터 정규화 |
| 출처 배지 (외부수집/검증업체) | `jobs/[id]/page.tsx` L79-89 | 공고 제목 옆에 출처 시각적 표시 | 긍정적 - UX 향상 |
| 연락처 대체 안내 문구 | `jobs/[id]/page.tsx` L200-202 | "원본 사이트에서 확인하세요" | 긍정적 - 사용자 안내 |
| 다중 셀렉터 패턴 | `crawl-114kr.mjs` L278-333 | 테이블/카드/키워드 3단계 폴백 | 긍정적 - 크롤링 안정성 |

### 5.3 Changed Features (설계와 다른 구현)

없음. 모든 핵심 설계 사항이 명세대로 구현됨.

---

## 6. 코드 품질 분석

### 6.1 긍정적 사항

| 항목 | 위치 | 설명 |
|------|------|------|
| 중복 방지 | `crawl-114kr.mjs` L347 | `Map` 기반 URL 중복 제거 |
| 에러 처리 | `crawl-114kr.mjs` L429-432 | 상세 파싱 실패 시 graceful skip |
| 자원 정리 | `crawl-114kr.mjs` L597-598 | `finally` 블록에서 browser 종료 보장 |
| 타입 안전성 | `src/lib/jobs.ts` L288 | source 필터에 `string` 타입 명시 |
| 조건부 렌더링 | `jobs/[id]/page.tsx` L190 | `source === 'crawled' && source_url` 이중 체크 |

### 6.2 개선 권장 사항

| 심각도 | 파일 | 위치 | 문제 | 권장 조치 |
|:------:|------|------|------|-----------|
| 낮음 | `crawl-114kr.mjs` | L70-73 | `console.log` 사용 (스크립트이므로 허용 가능) | 프로덕션 크론잡 전환 시 로거 교체 |
| 낮음 | `crawl-114kr.mjs` | L485 | `status: 'active'` 하드코딩 | 설계와 일치 (크롤링 공고는 즉시 활성) |
| 낮음 | `crawl-114kr.mjs` | L24 | `MAX_PAGES = 10` 하드코딩 | CLI 인자로 받거나 환경변수 처리 고려 |
| 참고 | `crawl-114kr.mjs` | L86 | `mapIndustry` 기본값 `'PRODUCTION'` | 매핑 실패 시 로깅 추가 권장 |

---

## 7. 종합 스코어

```
+---------------------------------------------+
|  종합 일치율: 100%                            |
+---------------------------------------------+
|  Step 1 (크롤러 스크립트):    14/14  (100%)   |
|  Step 2 (상세 페이지 수정):    5/5   (100%)   |
|  Step 3 (가짜 업체 처리):      4/4   (100%)   |
|  Step 4 (관리자 크롤링 관리):  9/9   (100%)   |
|  파일 변경 일치:               8/8   (100%)   |
+---------------------------------------------+
|  추가 구현 (설계 외):          8개             |
|  미구현 (설계만 있음):         0개             |
|  불일치 (설계와 다름):         0개             |
+---------------------------------------------+
```

---

## 8. 결론

설계 문서의 모든 요구사항(32개 체크 항목)이 100% 구현되었습니다.

**핵심 설계 전략 이행 확인:**

1. **크롤링 vs 직접 공고 차별화**: `source` 필드(`organic`/`crawled`)를 기준으로 UI 분기 처리 완료
2. **연락처 비노출**: 크롤링 공고에서 `ContactButtons` 대신 "원문에서 확인하기" 버튼 표시
3. **원본 링크**: `source_url`에 원본 URL 저장, 상세 페이지 상/하단에 원문 링크 제공
4. **시스템 업체**: `c0000000-crawl-0000-0000-000000000000` ID로 가짜 업체 생성, 스키마에 INSERT
5. **관리자 기능**: 대시보드 크롤링 통계 + 공고 목록 출처 필터 완비
6. **중복 방지**: `source_url` 기준 중복 체크, 속도 제한 5초 구현

추가로 `--inspect`, `--dry-run` 디버그 모드와 비자/태그/업종 자동 파싱 등
설계에 없던 유용한 기능이 보강되어 완성도가 높습니다.

**Match Rate >= 90% 이므로 Check 단계를 통과합니다.**

---

## Version History

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|-----------|--------|
| 1.0 | 2026-03-04 | 최초 Gap 분석 | Claude |
