import type { VisaType } from '@/types/job'

type VisaBadgeProps = {
  visa: VisaType
}

export function VisaBadge({ visa }: VisaBadgeProps) {
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600 font-mono">
      {visa}
    </span>
  )
}
