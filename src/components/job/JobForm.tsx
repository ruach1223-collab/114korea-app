'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { jobFormSchema, type JobFormData } from '@/features/jobs/validators'
import {
  INDUSTRY_LABELS,
  SALARY_TYPE_LABELS,
  WORK_SHIFT_LABELS,
  VISA_TYPE_LABELS,
  JOB_TAG_LABELS,
  REGION_CITIES,
  REGION_DISTRICTS,
} from '@/features/jobs/utils/constants'
import type { VisaType, JobTag, JobPost } from '@/types/job'

type JobFormProps = {
  mode: 'create' | 'edit'
  initialData?: JobPost
  todayCount?: number
}

export function JobForm({ mode, initialData, todayCount = 0 }: JobFormProps) {
  const router = useRouter()
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: initialData
      ? {
          title: initialData.title,
          industry: initialData.industry,
          region_city: initialData.region_city,
          region_district: initialData.region_district,
          salary_type: initialData.salary_type,
          salary_amount: initialData.salary_amount,
          work_hours: initialData.work_hours,
          work_shift: initialData.work_shift,
          visa_types: initialData.visa_types,
          tags: initialData.tags,
          dormitory: initialData.dormitory,
          description: initialData.description,
          contact_phone: initialData.contact_phone,
          contact_kakao: initialData.contact_kakao,
        }
      : {
          visa_types: [],
          tags: [],
          dormitory: false,
          salary_amount: 0,
          region_district: '',
          contact_kakao: '',
        },
  })

  const selectedCity = watch('region_city')
  const selectedSalaryType = watch('salary_type')
  const selectedVisas = watch('visa_types') ?? []
  const selectedTags = watch('tags') ?? []

  const districts = selectedCity ? REGION_DISTRICTS[selectedCity] ?? [] : []

  const industryOptions = Object.entries(INDUSTRY_LABELS).map(([v, l]) => ({ value: v, label: l }))
  const salaryOptions = Object.entries(SALARY_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))
  const shiftOptions = Object.entries(WORK_SHIFT_LABELS).map(([v, l]) => ({ value: v, label: l }))
  const regionOptions = REGION_CITIES.map((c) => ({ value: c, label: c }))
  const districtOptions = districts.map((d) => ({ value: d, label: d }))

  const toggleVisa = (visa: VisaType) => {
    const current = selectedVisas as string[]
    if (current.includes(visa)) {
      setValue('visa_types', current.filter((v) => v !== visa))
    } else {
      setValue('visa_types', [...current, visa])
    }
  }

  const toggleTag = (tag: JobTag) => {
    const current = selectedTags as string[]
    if (current.includes(tag)) {
      setValue('tags', current.filter((t) => t !== tag))
    } else {
      setValue('tags', [...current, tag])
    }
  }

  const onSubmit = async (data: JobFormData) => {
    setError('')
    try {
      const url = mode === 'create' ? '/api/jobs' : `/api/jobs/${initialData?.id}`
      const method = mode === 'create' ? 'POST' : 'PUT'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        setError(result.message || '요청에 실패했습니다')
        return
      }

      router.push('/dashboard/jobs')
      router.refresh()
    } catch {
      setError('서버 오류가 발생했습니다')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* 등록 현황 */}
      {mode === 'create' && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          오늘 등록: {todayCount}/2건 (무료)
        </div>
      )}

      {/* 공고 제목 */}
      <Input
        label="공고 제목"
        placeholder="예: 화성 반도체 공장 생산직 모집"
        error={errors.title?.message}
        required
        {...register('title')}
      />

      {/* 업종 */}
      <Select
        label="업종"
        options={industryOptions}
        value={watch('industry') ?? ''}
        onChange={(e) => setValue('industry', e.target.value)}
        placeholder="업종 선택"
        error={errors.industry?.message}
        required
      />

      {/* 근무 지역 */}
      <div className="grid grid-cols-2 gap-3">
        <Select
          label="지역 (시/도)"
          options={regionOptions}
          value={watch('region_city') ?? ''}
          onChange={(e) => {
            setValue('region_city', e.target.value)
            setValue('region_district', '')
          }}
          placeholder="시/도 선택"
          error={errors.region_city?.message}
          required
        />
        <Select
          label="시/군/구"
          options={districtOptions}
          value={watch('region_district') ?? ''}
          onChange={(e) => setValue('region_district', e.target.value)}
          placeholder="시/군/구 선택"
        />
      </div>

      {/* 급여 */}
      <div className="grid grid-cols-2 gap-3">
        <Select
          label="급여 유형"
          options={salaryOptions}
          value={watch('salary_type') ?? ''}
          onChange={(e) => setValue('salary_type', e.target.value)}
          placeholder="급여 유형"
          error={errors.salary_type?.message}
          required
        />
        {selectedSalaryType !== 'NEGOTIABLE' && (
          <Input
            label="급여 금액 (원)"
            type="number"
            placeholder="2800000"
            error={errors.salary_amount?.message}
            {...register('salary_amount', { valueAsNumber: true })}
          />
        )}
      </div>

      {/* 근무시간 + 형태 */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="근무시간"
          placeholder="08:00~17:00"
          error={errors.work_hours?.message}
          required
          {...register('work_hours')}
        />
        <Select
          label="근무형태"
          options={shiftOptions}
          value={watch('work_shift') ?? ''}
          onChange={(e) => setValue('work_shift', e.target.value)}
          placeholder="근무형태"
          error={errors.work_shift?.message}
          required
        />
      </div>

      {/* 비자 유형 (멀티 체크박스) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          가능 비자 <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {(Object.entries(VISA_TYPE_LABELS) as [VisaType, string][]).map(([code, label]) => (
            <button
              key={code}
              type="button"
              onClick={() => toggleVisa(code)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                selectedVisas.includes(code)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {errors.visa_types?.message && (
          <p className="mt-1 text-sm text-red-500">{errors.visa_types.message}</p>
        )}
      </div>

      {/* 근무조건 태그 (멀티 체크박스) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          근무조건 태그
        </label>
        <div className="flex flex-wrap gap-2">
          {(Object.entries(JOB_TAG_LABELS) as [JobTag, string][]).map(([code, label]) => (
            <button
              key={code}
              type="button"
              onClick={() => toggleTag(code)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                selectedTags.includes(code)
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-green-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 숙소 제공 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          숙소 제공 <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="true"
              checked={watch('dormitory') === true}
              onChange={() => setValue('dormitory', true)}
              className="text-blue-600"
            />
            <span className="text-sm">제공</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="false"
              checked={watch('dormitory') === false}
              onChange={() => setValue('dormitory', false)}
              className="text-blue-600"
            />
            <span className="text-sm">미제공</span>
          </label>
        </div>
      </div>

      {/* 상세 설명 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          상세 설명 <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={8}
          placeholder="근무 내용, 자격 요건, 근무 조건 등을 자세히 작성해 주세요."
          className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          {...register('description')}
        />
        {errors.description?.message && (
          <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      {/* 연락처 */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="연락처 전화번호"
          placeholder="031-1234-5678"
          error={errors.contact_phone?.message}
          required
          {...register('contact_phone')}
        />
        <Input
          label="카카오톡 ID (선택)"
          placeholder="kakao_id"
          error={errors.contact_kakao?.message}
          {...register('contact_kakao')}
        />
      </div>

      {/* 제출 */}
      <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
        {mode === 'create' ? '공고 등록' : '공고 수정'}
      </Button>

      {mode === 'create' && (
        <p className="text-xs text-gray-500 text-center">
          * 등록된 공고는 30일간 게시됩니다
        </p>
      )}
    </form>
  )
}
