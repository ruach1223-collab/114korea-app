-- K114 Supabase 스키마
-- Supabase SQL Editor에서 실행하세요

-- pgcrypto 활성화 (비밀번호 해싱용)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- 1. 테이블 생성
-- ============================================

-- 업체 테이블
CREATE TABLE companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  company_name TEXT NOT NULL,
  biz_number TEXT UNIQUE NOT NULL,
  rep_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 관리자 테이블
CREATE TABLE admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin'
    CHECK (role IN ('super_admin', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 구인공고 테이블
CREATE TABLE jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  industry TEXT NOT NULL,
  region_city TEXT NOT NULL,
  region_district TEXT NOT NULL DEFAULT '',
  salary_type TEXT NOT NULL,
  salary_amount INTEGER NOT NULL DEFAULT 0,
  work_hours TEXT NOT NULL,
  work_shift TEXT NOT NULL,
  visa_types TEXT[] NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}',
  dormitory BOOLEAN NOT NULL DEFAULT FALSE,
  description TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_kakao TEXT NOT NULL DEFAULT '',
  is_vip BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'hidden', 'expired')),
  view_count INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'organic',
  source_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- ============================================
-- 2. 인덱스
-- ============================================

CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_industry ON jobs(industry);
CREATE INDEX idx_jobs_region_city ON jobs(region_city);
CREATE INDEX idx_jobs_is_vip ON jobs(is_vip);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX idx_companies_status ON companies(status);
CREATE INDEX idx_jobs_source_url ON jobs(source_url) WHERE source_url IS NOT NULL;

-- ============================================
-- 3. 조회수 증가 함수 (atomic)
-- ============================================

CREATE OR REPLACE FUNCTION increment_view_count(job_id UUID)
RETURNS VOID AS $$
  UPDATE jobs SET view_count = view_count + 1 WHERE id = job_id;
$$ LANGUAGE sql;

-- ============================================
-- 4. 초기 데이터
-- ============================================

-- 관리자 계정 (admin@k114.com / admin1234)
INSERT INTO admins (email, password_hash, role) VALUES
  ('admin@k114.com', crypt('admin1234', gen_salt('bf', 10)), 'super_admin');

-- 테스트 업체 1: 승인됨 (test@abc.com / test1234)
INSERT INTO companies (id, email, password_hash, company_name, biz_number, rep_name, phone, address, status) VALUES
  ('c0000001-0000-0000-0000-000000000001', 'test@abc.com', crypt('test1234', gen_salt('bf', 10)),
   'ABC아웃소싱', '123-45-67890', '홍길동', '031-1234-5678', '경기도 화성시 동탄대로 123', 'approved');

-- 테스트 업체 2: 승인대기 (pending@xyz.com / test1234)
INSERT INTO companies (id, email, password_hash, company_name, biz_number, rep_name, phone, address, status) VALUES
  ('c0000002-0000-0000-0000-000000000002', 'pending@xyz.com', crypt('test1234', gen_salt('bf', 10)),
   'XYZ파견', '987-65-43210', '김철수', '032-9876-5432', '인천시 남동구 논현로 456', 'pending');

-- 크롤링 공고용 시스템 업체 (모든 크롤링 공고가 이 업체에 소속)
INSERT INTO companies (id, email, password_hash, company_name, biz_number, rep_name, phone, address, status) VALUES
  ('c0000000-0000-4000-a000-000000000000', 'crawl@system.k114.com', crypt('no-login', gen_salt('bf', 10)),
   'K114 외부수집', '000-00-00000', '시스템', '000-0000-0000', '-', 'approved');

-- 추가 테스트 업체 (공고 seed 데이터용)
INSERT INTO companies (id, email, password_hash, company_name, biz_number, rep_name, phone, address, status) VALUES
  ('c0000003-0000-0000-0000-000000000003', 'test3@korea.com', crypt('test1234', gen_salt('bf', 10)),
   '한국인력', '111-22-33333', '이영희', '02-1111-2222', '서울시 금천구 가산로 100', 'approved'),
  ('c0000004-0000-0000-0000-000000000004', 'test4@korea.com', crypt('test1234', gen_salt('bf', 10)),
   '글로벌워커스', '222-33-44444', '박민수', '031-3333-4444', '경기도 안산시 원곡로 200', 'approved'),
  ('c0000005-0000-0000-0000-000000000005', 'test5@korea.com', crypt('test1234', gen_salt('bf', 10)),
   '대한아웃소싱', '333-44-55555', '최지연', '041-5555-6666', '충남 천안시 신부로 300', 'approved');

-- 샘플 공고 (VIP 3개 + 일반 7개)
INSERT INTO jobs (company_id, title, industry, region_city, region_district, salary_type, salary_amount, work_hours, work_shift, visa_types, tags, dormitory, description, contact_phone, contact_kakao, is_vip, status, view_count, source, expires_at) VALUES
  -- VIP 공고
  ('c0000001-0000-0000-0000-000000000001', '화성 반도체 공장 생산직 모집', 'PRODUCTION', '경기', '화성시', 'MONTHLY', 2800000,
   '08:00~17:00', 'DAY', ARRAY['E-9','F-4','H-2'], ARRAY['DORMITORY','MEAL','SHUTTLE','INSURANCE','SEVERANCE','OVERTIME'],
   TRUE, '삼성전자 협력사 반도체 공장 생산직 모집.\n클린룸 작업, 초보 환영, 기숙사 2인1실, 식사 3끼 제공.',
   '031-1234-5678', 'outsourcing_kr', TRUE, 'active', 150, 'organic', NOW() + INTERVAL '29 days'),

  ('c0000003-0000-0000-0000-000000000003', '[긴급] 평택 삼성 협력사 대량모집 50명', 'PRODUCTION', '경기', '평택시', 'MONTHLY', 3200000,
   '주간 06:00~18:00 / 야간 18:00~06:00', 'TWO_SHIFT', ARRAY['E-9','F-4','H-2'], ARRAY['DORMITORY','MEAL','SHUTTLE','INSURANCE','SEVERANCE','OVERTIME'],
   TRUE, '삼성전자 평택캠퍼스 협력사 대량모집.\n2교대, 기숙사 무료, 식사 제공, 잔업 많음.',
   '031-0000-0000', '', TRUE, 'active', 230, 'organic', NOW() + INTERVAL '29 days'),

  ('c0000005-0000-0000-0000-000000000005', '이천 SK하이닉스 협력사 생산직', 'PRODUCTION', '경기', '이천시', 'MONTHLY', 3000000,
   '3조 3교대', 'THREE_SHIFT', ARRAY['E-9','F-4'], ARRAY['DORMITORY','MEAL','SHUTTLE','INSURANCE','SEVERANCE'],
   TRUE, 'SK하이닉스 이천 반도체 공장 협력사.\n3교대, 기숙사 1인1실, 식사 무료.',
   '031-0000-0000', '', TRUE, 'active', 180, 'organic', NOW() + INTERVAL '29 days'),

  -- 일반 공고
  ('c0000001-0000-0000-0000-000000000001', '안산 전자부품 포장 작업자', 'PRODUCTION', '경기', '안산시', 'MONTHLY', 2600000,
   '09:00~18:00', 'DAY', ARRAY['E-9','F-4'], ARRAY['SHUTTLE','MEAL','INSURANCE'],
   FALSE, '전자부품 포장 작업. 경력 무관, 초보 환영.',
   '031-0000-0000', '', FALSE, 'active', 45, 'organic', NOW() + INTERVAL '28 days'),

  ('c0000004-0000-0000-0000-000000000004', '시흥 플라스틱 사출 작업자', 'PRODUCTION', '경기', '시흥시', 'MONTHLY', 2700000,
   '08:00~20:00 / 20:00~08:00', 'TWO_SHIFT', ARRAY['E-9','H-2'], ARRAY['DORMITORY','MEAL','INSURANCE','OVERTIME'],
   TRUE, '플라스틱 사출 성형 작업. 2교대.',
   '031-0000-0000', '', FALSE, 'active', 32, 'organic', NOW() + INTERVAL '27 days'),

  ('c0000002-0000-0000-0000-000000000002', '부산 건설현장 철근공', 'CONSTRUCTION', '부산', '해운대구', 'DAILY', 180000,
   '07:00~18:00', 'DAY', ARRAY['E-9','H-2'], ARRAY['MEAL','NIGHT_BONUS','INSURANCE'],
   FALSE, '건설현장 철근 작업. 경력자 우대.',
   '051-0000-0000', '', FALSE, 'active', 28, 'organic', NOW() + INTERVAL '25 days'),

  ('c0000002-0000-0000-0000-000000000002', '인천 물류센터 분류원 대량 모집', 'LOGISTICS', '인천', '남동구', 'DAILY', 150000,
   '07:00~16:00', 'DAY', ARRAY['E-9','F-4','H-2','F-2'], ARRAY['SHUTTLE','MEAL','BEGINNER_OK','IMMEDIATE'],
   FALSE, '물류센터 택배 분류 작업. 대량 모집, 즉시 출근 가능.',
   '032-0000-0000', '', FALSE, 'active', 55, 'organic', NOW() + INTERVAL '26 days'),

  ('c0000001-0000-0000-0000-000000000001', '강남 일식집 주방보조 구함', 'FOOD', '서울', '강남구', 'HOURLY', 12000,
   '11:00~22:00', 'DAY', ARRAY['F-4','F-5','F-6'], ARRAY['MEAL','BEGINNER_OK'],
   FALSE, '강남 일식집 주방보조. 일본어 가능자 우대.',
   '02-0000-0000', '', FALSE, 'active', 18, 'organic', NOW() + INTERVAL '24 days'),

  ('c0000005-0000-0000-0000-000000000005', '제주 호텔 객실 청소', 'LODGING', '제주', '제주시', 'HOURLY', 11000,
   '09:00~16:00', 'DAY', ARRAY['F-4','F-6','H-2'], ARRAY['MEAL','BEGINNER_OK'],
   FALSE, '제주 리조트 호텔 객실 청소. 여성 우대.',
   '064-0000-0000', '', FALSE, 'active', 12, 'organic', NOW() + INTERVAL '23 days'),

  ('c0000003-0000-0000-0000-000000000003', '논산 딸기농장 수확 작업', 'AGRICULTURE', '충남', '논산시', 'DAILY', 110000,
   '06:00~14:00', 'DAY', ARRAY['E-9','H-2'], ARRAY['DORMITORY','MEAL','BEGINNER_OK'],
   TRUE, '딸기 수확 및 선별 포장. 숙소/식사 제공.',
   '041-0000-0000', '', FALSE, 'active', 22, 'organic', NOW() + INTERVAL '22 days');

-- ============================================
-- 5. 구독 관련 테이블
-- ============================================

-- 구독 테이블
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  billing_key TEXT NOT NULL,
  amount INTEGER NOT NULL DEFAULT 100000,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'cancelled', 'expired')),
  period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  period_end TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 days',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_subscriptions_company UNIQUE (company_id)
);

-- 결제 내역 테이블
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  payment_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'paid'
    CHECK (status IN ('paid', 'failed', 'refunded')),
  paid_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_company_id ON subscriptions(company_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_period_end ON subscriptions(period_end);
CREATE INDEX idx_payments_subscription_id ON payments(subscription_id);

-- 업체 공고 is_vip 일괄 변경 RPC 함수
CREATE OR REPLACE FUNCTION sync_vip_by_company(target_company_id UUID, vip_status BOOLEAN)
RETURNS VOID AS $$
  UPDATE jobs
  SET is_vip = vip_status
  WHERE company_id = target_company_id
    AND status = 'active';
$$ LANGUAGE sql;

-- ============================================
-- 6. RLS (자체 인증 사용, API Route에서 권한 체크)
-- ============================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- anon 키로 모든 작업 허용 (API Route에서 인증/권한 체크)
CREATE POLICY "allow_all_companies" ON companies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_admins" ON admins FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_jobs" ON jobs FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_subscriptions" ON subscriptions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_payments" ON payments FOR ALL USING (true) WITH CHECK (true);
