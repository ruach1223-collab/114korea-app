import Link from 'next/link'
import type { JobPostCard } from '@/types/job'
import { INDUSTRY_LABELS, formatSalary, formatTimeAgo } from '@/features/jobs/utils/constants'

type JobListItemProps = {
  job: JobPostCard
}

// 카페 게시판 스타일 줄 리스트 - 촘촘한 버전
export function JobListItem({ job }: JobListItemProps) {
  return (
    <Link href={`/jobs/${job.id}`} className="block">
      <div className="flex items-center gap-2 px-2 py-1.5 border-b border-gray-100 hover:bg-blue-50/40 transition-colors text-[13px] leading-tight">
        {/* 업종 */}
        <span className="text-[11px] text-gray-400 w-14 shrink-0 text-center hidden sm:block">
          {INDUSTRY_LABELS[job.industry]}
        </span>

        {/* 제목 */}
        <span className="flex-1 min-w-0 text-gray-800 truncate">
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
