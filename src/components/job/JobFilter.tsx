'use client'

import type { Industry, VisaType, SalaryType } from '@/types/job'
import { INDUSTRY_LABELS, SALARY_TYPE_LABELS, VISA_TYPE_LABELS, REGION_CITIES } from '@/features/jobs/utils/constants'
import { Select } from '@/components/ui/Select'

type JobFilterProps = {
  industry?: Industry
  regionCity?: string
  visaType?: VisaType
  salaryType?: SalaryType
  sort?: string
  onFilterChange: (key: string, value: string) => void
}

export function JobFilter({
  industry,
  regionCity,
  visaType,
  salaryType,
  sort,
  onFilterChange,
}: JobFilterProps) {
  const industryOptions = Object.entries(INDUSTRY_LABELS).map(([value, label]) => ({
    value,
    label,
  }))

  const regionOptions = REGION_CITIES.map((city) => ({
    value: city,
    label: city,
  }))

  const visaOptions = Object.entries(VISA_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
  }))

  const salaryOptions = Object.entries(SALARY_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
  }))

  const sortOptions = [
    { value: 'latest', label: '최신순' },
    { value: 'salary_high', label: '급여 높은순' },
    { value: 'salary_low', label: '급여 낮은순' },
  ]

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Select
          options={regionOptions}
          value={regionCity ?? ''}
          onChange={(e) => onFilterChange('region_city', e.target.value)}
          placeholder="지역 전체"
        />
        <Select
          options={industryOptions}
          value={industry ?? ''}
          onChange={(e) => onFilterChange('industry', e.target.value)}
          placeholder="업종 전체"
        />
        <Select
          options={visaOptions}
          value={visaType ?? ''}
          onChange={(e) => onFilterChange('visa_type', e.target.value)}
          placeholder="비자 전체"
        />
        <Select
          options={salaryOptions}
          value={salaryType ?? ''}
          onChange={(e) => onFilterChange('salary_type', e.target.value)}
          placeholder="급여 전체"
        />
        <Select
          options={sortOptions}
          value={sort ?? 'latest'}
          onChange={(e) => onFilterChange('sort', e.target.value)}
          placeholder="정렬"
        />
      </div>
    </div>
  )
}
