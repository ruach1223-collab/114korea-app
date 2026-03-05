import { createServerClient } from '@/lib/supabase/server'
import { isCompanySubscribed } from '@/lib/subscription'
import type { JobPost, JobPostCard, Industry, SalaryType, JobTag } from '@/types/job'

// === 회사명 조회 (내부 헬퍼) ===

async function getCompanyNames(companyIds: string[]): Promise<Record<string, string>> {
  if (companyIds.length === 0) return {}
  const supabase = createServerClient()
  const { data } = await supabase
    .from('companies')
    .select('id, company_name')
    .in('id', companyIds)

  const names: Record<string, string> = {}
  for (const comp of data ?? []) {
    names[comp.id] = comp.company_name
  }
  return names
}

export async function getCompanyName(companyId: string): Promise<string> {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('companies')
    .select('company_name')
    .eq('id', companyId)
    .single()
  return data?.company_name ?? '미등록업체'
}

// === 공개 공고 목록 (필터/정렬/페이지네이션) ===

export async function getActiveJobs(filters: {
  industry?: string
  region_city?: string
  visa_type?: string
  salary_type?: string
  sort?: string
  page?: number
  limit?: number
}) {
  const supabase = createServerClient()
  const page = filters.page ?? 1
  const limit = filters.limit ?? 20
  const now = new Date().toISOString()

  // 기본 필터 조건 빌더
  function applyFilters<T extends { eq: Function; gt: Function; contains: Function }>(query: T): T {
    let q = query.eq('status', 'active').gt('expires_at', now)
    if (filters.industry) q = q.eq('industry', filters.industry)
    if (filters.region_city) q = q.eq('region_city', filters.region_city)
    if (filters.salary_type) q = q.eq('salary_type', filters.salary_type)
    if (filters.visa_type) q = q.contains('visa_types', [filters.visa_type])
    return q as T
  }

  // 총 개수
  const countQuery = applyFilters(
    supabase.from('jobs').select('*', { count: 'exact', head: true }),
  )
  const { count } = await countQuery

  // 데이터 쿼리
  let dataQuery = applyFilters(
    supabase.from('jobs').select(
      'id, title, company_id, industry, region_city, region_district, salary_type, salary_amount, tags, is_vip, is_boost, created_at',
    ),
  )

  // 정렬: VIP 먼저 → 부스트 → 일반
  dataQuery = dataQuery.order('is_vip', { ascending: false })
  dataQuery = dataQuery.order('is_boost', { ascending: false })
  if (filters.sort === 'salary_high') {
    dataQuery = dataQuery.order('salary_amount', { ascending: false })
  } else if (filters.sort === 'salary_low') {
    dataQuery = dataQuery.order('salary_amount', { ascending: true })
  } else {
    dataQuery = dataQuery.order('created_at', { ascending: false })
  }

  const start = (page - 1) * limit
  dataQuery = dataQuery.range(start, start + limit - 1)

  const { data } = await dataQuery
  const total = count ?? 0
  const totalPages = Math.ceil(total / limit)

  // 회사명 매핑
  const companyIds = [...new Set((data ?? []).map((j: { company_id: string }) => j.company_id))]
  const companyNames = await getCompanyNames(companyIds)

  const jobCards: JobPostCard[] = (data ?? []).map((job: Record<string, unknown>) => ({
    id: job.id as string,
    title: job.title as string,
    company_name: companyNames[job.company_id as string] ?? '미등록업체',
    industry: job.industry as Industry,
    region_city: job.region_city as string,
    region_district: job.region_district as string,
    salary_type: job.salary_type as SalaryType,
    salary_amount: job.salary_amount as number,
    tags: job.tags as JobTag[],
    is_vip: job.is_vip as boolean,
    is_boost: job.is_boost as boolean,
    created_at: job.created_at as string,
  }))

  return {
    data: jobCards,
    pagination: { page, limit, total, total_pages: totalPages },
  }
}

// === 공고 상세 ===

export async function getJobById(id: string): Promise<JobPost | null> {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .single()
  return data as JobPost | null
}

// === 업체별 공고 목록 ===

export async function getJobsByCompany(companyId: string): Promise<JobPost[]> {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('jobs')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
  return (data ?? []) as JobPost[]
}

// === 오늘 등록한 무료 공고 수 ===

export async function getTodayJobCount(companyId: string): Promise<number> {
  const supabase = createServerClient()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { count } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .eq('is_vip', false)
    .gte('created_at', today.toISOString())

  return count ?? 0
}

// === 공고 생성 ===

export async function createJob(
  companyId: string,
  input: {
    title: string
    industry: string
    region_city: string
    region_district?: string
    salary_type: string
    salary_amount?: number
    work_hours: string
    work_shift: string
    visa_types: string[]
    tags?: string[]
    dormitory: boolean
    description: string
    contact_phone: string
    contact_kakao?: string
  },
): Promise<{ id: string }> {
  const supabase = createServerClient()
  const expiresAt = new Date(Date.now() + 30 * 86400000)

  // 구독 업체면 자동으로 VIP 적용
  const vip = await isCompanySubscribed(companyId)

  const { data, error } = await supabase
    .from('jobs')
    .insert({
      company_id: companyId,
      title: input.title,
      industry: input.industry,
      region_city: input.region_city,
      region_district: input.region_district ?? '',
      salary_type: input.salary_type,
      salary_amount: input.salary_amount ?? 0,
      work_hours: input.work_hours,
      work_shift: input.work_shift,
      visa_types: input.visa_types,
      tags: input.tags ?? [],
      dormitory: input.dormitory,
      description: input.description,
      contact_phone: input.contact_phone,
      contact_kakao: input.contact_kakao ?? '',
      is_vip: vip,
      status: 'pending',
      view_count: 0,
      source: 'organic',
      expires_at: expiresAt.toISOString(),
    })
    .select('id')
    .single()

  if (error) throw error
  return data as { id: string }
}

// === 공고 수정 ===

export async function updateJob(
  id: string,
  input: {
    title: string
    industry: string
    region_city: string
    region_district?: string
    salary_type: string
    salary_amount?: number
    work_hours: string
    work_shift: string
    visa_types: string[]
    tags?: string[]
    dormitory: boolean
    description: string
    contact_phone: string
    contact_kakao?: string
  },
) {
  const supabase = createServerClient()
  const { error } = await supabase
    .from('jobs')
    .update({
      title: input.title,
      industry: input.industry,
      region_city: input.region_city,
      region_district: input.region_district ?? '',
      salary_type: input.salary_type,
      salary_amount: input.salary_amount ?? 0,
      work_hours: input.work_hours,
      work_shift: input.work_shift,
      visa_types: input.visa_types,
      tags: input.tags ?? [],
      dormitory: input.dormitory,
      description: input.description,
      contact_phone: input.contact_phone,
      contact_kakao: input.contact_kakao ?? '',
    })
    .eq('id', id)

  if (error) throw error
}

// === 공고 삭제 ===

export async function deleteJob(id: string) {
  const supabase = createServerClient()
  const { error } = await supabase.from('jobs').delete().eq('id', id)
  if (error) throw error
}

// === 조회수 증가 ===

export async function incrementViewCount(id: string) {
  const supabase = createServerClient()
  await supabase.rpc('increment_view_count', { job_id: id })
}

// === 관리자: 공고 상태/VIP 변경 ===

export async function updateJobAdmin(id: string, updates: { status?: string; is_vip?: boolean; is_boost?: boolean; boost_expires_at?: string | null }) {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('jobs')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error
  return data as JobPost
}

// === 관리자: 전체 공고 목록 ===

export async function getAllJobs(filters: { status?: string; vip?: string; source?: string }) {
  const supabase = createServerClient()
  let query = supabase.from('jobs').select('*')

  if (filters.status) query = query.eq('status', filters.status)
  if (filters.vip === 'true') query = query.eq('is_vip', true)
  if (filters.source) query = query.eq('source', filters.source)

  const { data } = await query.order('created_at', { ascending: false })

  const companyIds = [...new Set((data ?? []).map((j: { company_id: string }) => j.company_id))]
  const companyNames = await getCompanyNames(companyIds)

  return (data ?? []).map((j: Record<string, unknown>) => ({
    ...j,
    company_name: companyNames[j.company_id as string] ?? '미등록업체',
  }))
}

// === 관리자: 통계 ===

export async function getJobStats() {
  const supabase = createServerClient()
  const { data } = await supabase.from('jobs').select('status, is_vip, view_count, source')

  const jobs = data ?? []
  return {
    total: jobs.length,
    active: jobs.filter((j: { status: string }) => j.status === 'active').length,
    pending: jobs.filter((j: { status: string }) => j.status === 'pending').length,
    hidden: jobs.filter((j: { status: string }) => j.status === 'hidden').length,
    expired: jobs.filter((j: { status: string }) => j.status === 'expired').length,
    vip: jobs.filter((j: { is_vip: boolean }) => j.is_vip).length,
    crawled: jobs.filter((j: { source: string }) => j.source === 'crawled').length,
    totalViews: jobs.reduce((sum: number, j: { view_count: number }) => sum + j.view_count, 0),
  }
}

// === 홈페이지 SSR 데이터 ===

export async function getHomePageData() {
  const supabase = createServerClient()
  const now = new Date().toISOString()
  const fields = 'id, title, company_id, industry, region_city, region_district, salary_type, salary_amount, tags, is_vip, is_boost, created_at'

  // VIP 공고 + 부족분 채우기 위해 일반 공고를 넉넉히 가져옴
  const PREMIUM_COUNT = 8
  const RECENT_COUNT = 30

  const [vipResult, recentResult] = await Promise.all([
    supabase
      .from('jobs')
      .select(fields)
      .eq('status', 'active')
      .eq('is_vip', true)
      .gt('expires_at', now)
      .order('created_at', { ascending: false })
      .limit(PREMIUM_COUNT),
    supabase
      .from('jobs')
      .select(fields)
      .eq('status', 'active')
      .eq('is_vip', false)
      .gt('expires_at', now)
      .order('created_at', { ascending: false })
      .limit(PREMIUM_COUNT + RECENT_COUNT),
  ])

  const vipRaw = vipResult.data ?? []
  const recentRaw = recentResult.data ?? []

  // VIP가 8개 미만이면 일반 공고에서 최신순으로 채움
  const fillCount = PREMIUM_COUNT - vipRaw.length
  const filledVip = fillCount > 0
    ? [...vipRaw, ...recentRaw.slice(0, fillCount)]
    : vipRaw
  const remainRecent = fillCount > 0
    ? recentRaw.slice(fillCount, fillCount + RECENT_COUNT)
    : recentRaw.slice(0, RECENT_COUNT)

  const allJobs = [...filledVip, ...remainRecent]
  const companyIds = [...new Set(allJobs.map((j: { company_id: string }) => j.company_id))]
  const companyNames = await getCompanyNames(companyIds)

  const mapToCard = (job: Record<string, unknown>): JobPostCard => ({
    id: job.id as string,
    title: job.title as string,
    company_name: companyNames[job.company_id as string] ?? '미등록업체',
    industry: job.industry as Industry,
    region_city: job.region_city as string,
    region_district: job.region_district as string,
    salary_type: job.salary_type as SalaryType,
    salary_amount: job.salary_amount as number,
    tags: job.tags as JobTag[],
    is_vip: job.is_vip as boolean,
    is_boost: job.is_boost as boolean,
    created_at: job.created_at as string,
  })

  return {
    vipJobs: filledVip.map(mapToCard),
    recentJobs: remainRecent.map(mapToCard),
  }
}
