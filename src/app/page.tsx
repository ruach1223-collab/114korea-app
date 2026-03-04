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
      <section className="bg-blue-600 text-white py-10 md:py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-2xl md:text-4xl font-bold mb-3">
            안전한 일자리, K114에서 찾으세요
          </h1>
          <p className="text-blue-100 text-sm md:text-base mb-6">
            검증된 아웃소싱 업체의 구인정보를 무료로 확인하세요
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
