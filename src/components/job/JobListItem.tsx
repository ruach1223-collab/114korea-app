import Link from 'next/link'
import type { JobPostCard } from '@/types/job'
import { INDUSTRY_LABELS, formatSalary, formatTimeAgo } from '@/features/jobs/utils/constants'

type JobListItemProps = {
  job: JobPostCard
  highlight?: boolean
}

// 카페 게시판 스타일 줄 리스트 - 촘촘한 버전
export function JobListItem({ job, highlight }: JobListItemProps) {
  const isBoosted = job.is_boost

  return (
    <Link href={`/jobs/${job.id}`} className="block">
      <div className={`flex items-center gap-2 px-2 py-1.5 border-b transition-colors text-[13px] leading-tight ${
        isBoosted
          ? 'bg-red-50/60 border-red-200 hover:bg-red-50'
          : highlight
          ? 'bg-amber-50/60 border-amber-100 hover:bg-amber-50'
          : 'border-gray-100 hover:bg-blue-50/40'
      }`}>
        {/* 긴급/추천 뱃지 */}
        {isBoosted ? (
          <span className="text-[10px] font-bold text-red-600 w-6 shrink-0 text-center">긴급</span>
        ) : highlight ? (
          <span className="text-[10px] font-bold text-amber-600 w-6 shrink-0 text-center">추천</span>
        ) : null}

        {/* 업종 */}
        <span className="text-[11px] text-gray-400 w-14 shrink-0 text-center hidden sm:block">
          {INDUSTRY_LABELS[job.industry]}
        </span>

        {/* 제목 */}
        <span className={`flex-1 min-w-0 truncate ${isBoosted ? 'text-red-800 font-semibold' : highlight ? 'text-gray-900 font-medium' : 'text-gray-800'}`}>
          {job.title}
        </span>

        {/* 지역 */}
        <span className="text-[11px] text-gray-500 w-16 shrink-0 text-center hidden sm:block truncate">
          {job.region_city} {job.region_district}
        </span>

        {/* 급여 */}
        <span className="text-[11px] font-medium text-blue-600 w-20 shrink-0 text-right">
          {formatSalary(job.salary_type, job.salary_amount)}
        </span>

        {/* 업체 */}
        <span className="text-[11px] text-gray-400 w-16 shrink-0 text-center hidden lg:block truncate">
          {job.company_name}
        </span>

        {/* 날짜 */}
        <span className="text-[11px] text-gray-400 w-10 shrink-0 text-right hidden sm:block">
          {formatTimeAgo(job.created_at)}
        </span>
      </div>
    </Link>
  )
}
