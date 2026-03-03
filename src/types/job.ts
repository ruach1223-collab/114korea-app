// === 업종 ===
export type Industry =
  | 'PRODUCTION'
  | 'CONSTRUCTION'
  | 'LOGISTICS'
  | 'FOOD'
  | 'RETAIL'
  | 'OFFICE'
  | 'LODGING'
  | 'AGRICULTURE'

// === 급여 유형 ===
export type SalaryType = 'HOURLY' | 'DAILY' | 'MONTHLY' | 'NEGOTIABLE'

// === 근무 형태 ===
export type WorkShift = 'DAY' | 'NIGHT' | 'TWO_SHIFT' | 'THREE_SHIFT' | 'FLEXIBLE'

// === 비자 유형 ===
export type VisaType = 'E-9' | 'E-7' | 'F-2' | 'F-4' | 'F-5' | 'F-6' | 'H-2'

// === 근무조건 태그 ===
export type JobTag =
  | 'DORMITORY'
  | 'MEAL'
  | 'SHUTTLE'
  | 'BEGINNER_OK'
  | 'IMMEDIATE'
  | 'WEEKLY_PAY'
  | 'DAILY_PAY'
  | 'NIGHT_BONUS'
  | 'INSURANCE'
  | 'SEVERANCE'
  | 'OVERTIME'
  | 'FOREIGNER_OK'
  | 'NO_KOREAN'
  | 'COUPLE_OK'
  | 'VEHICLE'

// === 상태 ===
export type CompanyStatus = 'pending' | 'approved' | 'rejected'
export type JobStatus = 'pending' | 'active' | 'hidden' | 'expired'

// === 공고 출처 (크롤링 전환 전략용) ===
export type JobSource = 'organic' | 'crawled'

// === 업체 ===
export type Company = {
  id: string
  email: string
  company_name: string
  biz_number: string
  rep_name: string
  phone: string
  address: string
  status: CompanyStatus
  created_at: string
  updated_at: string
}

// === 구인공고 ===
export type JobPost = {
  id: string
  company_id: string
  title: string
  industry: Industry
  region_city: string
  region_district: string
  salary_type: SalaryType
  salary_amount: number
  work_hours: string
  work_shift: WorkShift
  visa_types: VisaType[]
  tags: JobTag[]
  dormitory: boolean
  description: string
  contact_phone: string
  contact_kakao: string
  is_vip: boolean
  status: JobStatus
  view_count: number
  source: JobSource
  source_url?: string
  created_at: string
  expires_at: string
}

// === 공고 카드 (목록용 요약) ===
export type JobPostCard = {
  id: string
  title: string
  company_name: string
  industry: Industry
  region_city: string
  region_district: string
  salary_type: SalaryType
  salary_amount: number
  tags: JobTag[]
  is_vip: boolean
  created_at: string
}

// === 필터 ===
export type JobFilter = {
  industry?: Industry
  region_city?: string
  visa_type?: VisaType
  salary_type?: SalaryType
  sort?: 'latest' | 'salary_high' | 'salary_low'
  page?: number
  limit?: number
}

// === 관리자 ===
export type Admin = {
  id: string
  email: string
  role: 'super_admin' | 'admin'
}

// === API 응답 ===
export type PaginatedResponse<T> = {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
}
