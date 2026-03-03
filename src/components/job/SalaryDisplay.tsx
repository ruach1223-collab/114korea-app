import type { SalaryType } from '@/types/job'
import { formatSalary } from '@/features/jobs/utils/constants'

type SalaryDisplayProps = {
  type: SalaryType
  amount: number
  className?: string
}

export function SalaryDisplay({ type, amount, className = '' }: SalaryDisplayProps) {
  return (
    <span className={`font-semibold text-blue-600 ${className}`}>
      {formatSalary(type, amount)}
    </span>
  )
}
