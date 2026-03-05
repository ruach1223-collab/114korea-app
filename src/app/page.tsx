export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { JobCard } from '@/components/job/JobCard'
import { JobListItem } from '@/components/job/JobListItem'
import { INDUSTRY_LABELS, INDUSTRY_ICONS, REGION_CITIES } from '@/features/jobs/utils/constants'
import { getHomePageData } from '@/lib/jobs'
import type { Industry } from '@/types/job'

export default async function HomePage() {
  const { vipJobs, recentJobs } = await getHomePageData()
  const industries = Object.entries(INDUSTRY_LABELS) as [Industry, string][]

  return (
    <div>
      {/* 히어로 섹션 */}
      <section className="bg-gradient-to-b from-blue-700 to-blue-600 text-white py-10 md:py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/20 border border-green-400/30 rounded-full text-green-200 text-xs font-medium mb-4">
            <span>✓</span> 사업자등록 검증 업체만 등록 가능
          </div>
          <h1 className="text-2xl md:text-4xl font-bold mb-3">
            검증된 공고만, K114
          </h1>
          <p className="text-blue-100 text-sm md:text-base mb-2">
            사업자등록번호 확인된 업체의 구인정보만 제공합니다
          </p>
          <p className="text-blue-200/70 text-xs mb-6">
            허위 공고 ZERO — 관리자 승인 후 공개
          </p>

          {/* 빠른 필터 - 지역 */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {REGION_CITIES.slice(0, 9).map((city) => (
              <Link
                key={city}
                href={`/jobs?region_city=${city}`}
                className="px-3 py-1.5 text-sm bg-white/20 rounded-full hover:bg-white/30 transition-colors"
              >
                {city}
              </Link>
            ))}
          </div>

          {/* 빠른 필터 - 업종 */}
          <div className="flex flex-wrap justify-center gap-2">
            {industries.map(([code, label]) => (
              <Link
                key={code}
                href={`/jobs?industry=${code}`}
                className="px-3 py-1.5 text-sm bg-white/10 rounded-full hover:bg-white/20 transition-colors"
              >
                {INDUSTRY_ICONS[code]} {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 신뢰 지표 */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-6 md:gap-10 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <span className="text-green-500 font-bold">✓</span>
              <span>사업자등록 검증</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-green-500 font-bold">✓</span>
              <span>관리자 승인제</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-green-500 font-bold">✓</span>
              <span>허위공고 즉시삭제</span>
            </div>
            <div className="hidden md:flex items-center gap-1.5">
              <span className="text-green-500 font-bold">✓</span>
              <span>무료 열람</span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* VIP 프리미엄 - 카드형 상단 고정 */}
        {vipJobs.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 text-xs font-bold bg-amber-400 text-amber-900 rounded">PREMIUM</span>
              <h2 className="text-sm font-bold text-gray-700">프리미엄 채용정보</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {vipJobs.map((job) => (
                <JobCard key={job.id} job={job} compact />
              ))}
            </div>
          </section>
        )}

        {/* 최신 채용정보 - 카페 줄 리스트 */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-gray-700">
              최신 채용정보
            </h2>
            <Link
              href="/jobs"
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              전체보기 →
            </Link>
          </div>

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

          {/* 줄 리스트 */}
          <div className="bg-white border-b border-gray-200">
            {recentJobs.map((job, index) => (
              <JobListItem key={job.id} job={job} highlight={index < 10} />
            ))}
          </div>

          {recentJobs.length === 0 && (
            <div className="text-center py-12 text-gray-500 text-sm">
              등록된 채용정보가 없습니다
            </div>
          )}

          {/* 더보기 */}
          <div className="text-center mt-4">
            <Link
              href="/jobs"
              className="inline-block px-6 py-2.5 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
            >
              채용정보 더보기
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
