import Link from 'next/link'
import type { JobPostCard } from '@/types/job'
import { INDUSTRY_ICONS, INDUSTRY_LABELS, formatSalary, formatTimeAgo } from '@/features/jobs/utils/constants'
import { JobTagBadge } from './JobTagBadge'
import { Badge } from '@/components/ui/Badge'

type JobCardProps = {
  job: JobPostCard
  compact?: boolean
}

export function JobCard({ job, compact }: JobCardProps) {
  if (compact) {
    return (
      <Link href={`/jobs/${job.id}`} className="block">
        <div className="p-2.5 border border-amber-200 bg-amber-50/40 rounded-lg hover:shadow-sm transition-shadow">
          <div className="flex items-center gap-2">
            <span className="text-sm shrink-0">{INDUSTRY_ICONS[job.industry]}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <Badge variant="vip">VIP</Badge>
                <h3 className="text-xs font-semibold text-gray-900 truncate">{job.title}</h3>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {job.company_name} · {job.region_city} · <span className="text-blue-600 font-medium">{formatSalary(job.salary_type, job.salary_amount)}</span>
              </p>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/jobs/${job.id}`} className="block">
      <div
        className={`p-4 border rounded-lg hover:shadow-md transition-shadow ${
          job.is_vip
            ? 'border-amber-300 bg-amber-50/50'
            : 'border-gray-200 bg-white'
        }`}
      >
        {/* VIP 뱃지 + 업종 아이콘 + 제목 */}
        <div className="flex items-start gap-2">
          <span className="text-lg flex-shrink-0">
            {INDUSTRY_ICONS[job.industry]}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {job.is_vip && <Badge variant="vip">VIP</Badge>}
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                {job.title}
              </h3>
            </div>

            {/* 회사명 + 지역 */}
            <p className="text-xs text-gray-500 mb-2">
              {job.company_name} · {job.region_city} {job.region_district}
            </p>

            {/* 급여 */}
            <p className="text-sm font-semibold text-blue-600 mb-2">
              {formatSalary(job.salary_type, job.salary_amount)}
            </p>

            {/* 태그 (최대 4개) */}
            {job.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {job.tags.slice(0, 4).map((tag) => (
                  <JobTagBadge key={tag} tag={tag} />
                ))}
                {job.tags.length > 4 && (
                  <span className="text-xs text-gray-400">+{job.tags.length - 4}</span>
                )}
              </div>
            )}

            {/* 등록 시간 */}
            <p className="text-xs text-gray-400">
              {formatTimeAgo(job.created_at)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}
