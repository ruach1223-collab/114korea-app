import type { JobTag } from '@/types/job'
import { JOB_TAG_LABELS } from '@/features/jobs/utils/constants'

type JobTagBadgeProps = {
  tag: JobTag
}

export function JobTagBadge({ tag }: JobTagBadgeProps) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700">
      {JOB_TAG_LABELS[tag]}
    </span>
  )
}
