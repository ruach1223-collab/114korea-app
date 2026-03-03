'use client'

import { useState, useEffect, useCallback } from 'react'
import { JobCard } from '@/components/job/JobCard'
import { JobListItem } from '@/components/job/JobListItem'
import { JobFilter } from '@/components/job/JobFilter'
import { Pagination } from '@/components/ui/Pagination'
import { Spinner } from '@/components/ui/Spinner'
import type { JobPostCard, Industry, VisaType, SalaryType } from '@/types/job'

export default function JobsPage() {
  const [filters, setFilters] = useState({
    industry: '' as string,
    region_city: '' as string,
    visa_type: '' as string,
    salary_type: '' as string,
    sort: 'latest' as string,
  })
  const [page, setPage] = useState(1)
  const [jobs, setJobs] = useState<JobPostCard[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filters.industry) params.set('industry', filters.industry)
    if (filters.region_city) params.set('region_city', filters.region_city)
    if (filters.visa_type) params.set('visa_type', filters.visa_type)
    if (filters.salary_type) params.set('salary_type', filters.salary_type)
    params.set('sort', filters.sort)
    params.set('page', String(page))
    params.set('limit', '30')

    try {
      const res = await fetch(`/api/jobs?${params}`)
      const data = await res.json()
      setJobs(data.data ?? [])
      setTotal(data.pagination?.total ?? 0)
      setTotalPages(data.pagination?.total_pages ?? 0)
    } finally {
      setLoading(false)
    }
  }, [filters, page])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }

  // VIP와 일반 공고 분리
  const vipJobs = jobs.filter((j) => j.is_vip)
  const regularJobs = jobs.filter((j) => !j.is_vip)

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-900 mb-4">채용정보</h1>

      <JobFilter
        industry={filters.industry as Industry}
        regionCity={filters.region_city}
        visaType={filters.visa_type as VisaType}
        salaryType={filters.salary_type as SalaryType}
        sort={filters.sort}
        onFilterChange={handleFilterChange}
      />

      <p className="text-sm text-gray-500 mt-4 mb-3">
        총 <span className="font-semibold text-gray-900">{total}</span>건의 채용정보
      </p>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : jobs.length > 0 ? (
        <div>
          {/* VIP 프리미엄 - 카드형 상단 고정 */}
          {vipJobs.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 text-xs font-bold bg-amber-400 text-amber-900 rounded">PREMIUM</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {vipJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            </div>
          )}

          {/* 일반 공고 - 줄 리스트 */}
          {regularJobs.length > 0 && (
            <div>
              {/* 테이블 헤더 */}
              <div className="bg-gray-50 border-y border-gray-200">
                <div className="flex items-center gap-2 px-2 py-1.5 text-[11px] text-gray-500 font-medium">
                  <span className="w-14 text-center hidden sm:block">업종</span>
                  <span className="flex-1">제목</span>
                  <span className="w-16 text-center hidden sm:block">지역</span>
                  <span className="w-20 text-right">급여</span>
                  <span className="w-16 text-center hidden lg:block">업체</span>
                  <span className="w-10 text-right hidden sm:block">등록</span>
                </div>
              </div>

              <div className="bg-white border-b border-gray-200">
                {regularJobs.map((job) => (
                  <JobListItem key={job.id} job={job} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <span className="text-4xl mb-4">🔍</span>
          <h3 className="text-lg font-medium text-gray-900 mb-1">검색 결과가 없습니다</h3>
          <p className="text-sm text-gray-500">필터 조건을 변경해보세요</p>
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  )
}
