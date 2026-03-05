'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { INDUSTRY_LABELS, formatSalary } from '@/features/jobs/utils/constants'
import type { JobPost, Industry, JobStatus } from '@/types/job'

type AdminJob = JobPost & { company_name: string }

const STATUS_LABELS: Record<JobStatus, string> = {
  pending: '심사 대기',
  active: '활성',
  hidden: '숨김',
  expired: '만료',
}

const STATUS_COLORS: Record<JobStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  active: 'bg-green-100 text-green-700',
  hidden: 'bg-red-100 text-red-700',
  expired: 'bg-gray-100 text-gray-500',
}

export default function AdminJobsPage() {
  const searchParams = useSearchParams()
  const [jobs, setJobs] = useState<AdminJob[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState(searchParams.get('status') || '')
  const [sourceFilter, setSourceFilter] = useState(searchParams.get('source') || '')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filter) params.set('status', filter)
    if (sourceFilter) params.set('source', sourceFilter)
    const res = await fetch(`/api/admin/jobs?${params}`)
    const data = await res.json()
    setJobs(data.data ?? [])
    setLoading(false)
  }, [filter, sourceFilter])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  const handleStatusChange = async (jobId: string, newStatus: JobStatus) => {
    setActionLoading(jobId)
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) await fetchJobs()
    } finally {
      setActionLoading(null)
    }
  }

  const handleVipToggle = async (jobId: string, currentVip: boolean) => {
    setActionLoading(jobId)
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_vip: !currentVip }),
      })
      if (res.ok) await fetchJobs()
    } finally {
      setActionLoading(null)
    }
  }

  const handleBoostToggle = async (jobId: string, currentBoost: boolean) => {
    setActionLoading(jobId)
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_boost: !currentBoost }),
      })
      if (res.ok) await fetchJobs()
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (jobId: string) => {
    if (!confirm('정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return
    setActionLoading(jobId)
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}`, { method: 'DELETE' })
      if (res.ok) await fetchJobs()
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div>
      {/* 상태 필터 */}
      <div className="flex gap-2 mb-2 flex-wrap">
        {(['', 'active', 'pending', 'hidden', 'expired'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {status === '' ? '전체' : STATUS_LABELS[status]}
          </button>
        ))}
      </div>

      {/* 출처 필터 */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {([
          { value: '', label: '전체 출처' },
          { value: 'organic', label: '직접등록' },
          { value: 'crawled', label: '크롤링' },
        ]).map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setSourceFilter(value)}
            className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
              sourceFilter === value
                ? 'bg-amber-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 공고 목록 */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <span className="text-3xl block mb-2">📋</span>
          <p>공고가 없습니다</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div
              key={job.id}
              className={`bg-white border rounded-lg p-4 ${
                job.is_boost ? 'border-red-300 bg-red-50/30' : job.is_vip ? 'border-amber-300 bg-amber-50/30' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* 제목 + 상태 */}
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {job.is_vip && (
                      <span className="px-1.5 py-0.5 text-xs font-bold bg-amber-400 text-amber-900 rounded" title="VIP 상단노출">VIP</span>
                    )}
                    {job.is_boost && (
                      <span className="px-1.5 py-0.5 text-xs font-bold bg-red-500 text-white rounded" title="긴급채용 부스트">긴급</span>
                    )}
                    <Link
                      href={`/jobs/${job.id}`}
                      className="font-semibold text-gray-900 hover:text-blue-600 truncate"
                    >
                      {job.title}
                    </Link>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full shrink-0 ${STATUS_COLORS[job.status]}`}>
                      {STATUS_LABELS[job.status]}
                    </span>
                  </div>

                  {/* 메타 정보 */}
                  <div className="text-sm text-gray-500 space-y-0.5">
                    <p>
                      {job.company_name} · {INDUSTRY_LABELS[job.industry as Industry]} · {job.region_city} {job.region_district}
                    </p>
                    <p>
                      {formatSalary(job.salary_type, job.salary_amount)} · 조회 {job.view_count}회
                    </p>
                    <p className="text-xs text-gray-400">
                      등록: {new Date(job.created_at).toLocaleDateString('ko-KR')} ·
                      마감: {new Date(job.expires_at).toLocaleDateString('ko-KR')} ·
                      출처: {job.source === 'crawled' ? '크롤링' : '직접등록'}
                    </p>
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex flex-col gap-1.5 shrink-0">
                  {/* 상태 변경 */}
                  {job.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(job.id, 'active')}
                      loading={actionLoading === job.id}
                    >
                      승인
                    </Button>
                  )}
                  {job.status === 'active' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleStatusChange(job.id, 'hidden')}
                      loading={actionLoading === job.id}
                    >
                      숨김
                    </Button>
                  )}
                  {job.status === 'hidden' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(job.id, 'active')}
                      loading={actionLoading === job.id}
                    >
                      활성화
                    </Button>
                  )}

                  {/* VIP 토글 */}
                  <Button
                    size="sm"
                    variant={job.is_vip ? 'secondary' : 'ghost'}
                    onClick={() => handleVipToggle(job.id, job.is_vip)}
                    loading={actionLoading === job.id}
                    className={job.is_vip ? '' : 'border border-amber-300 text-amber-700'}
                  >
                    {job.is_vip ? 'VIP 해제' : 'VIP 지정'}
                  </Button>

                  {/* 긴급채용 부스트 토글 */}
                  <Button
                    size="sm"
                    variant={job.is_boost ? 'danger' : 'ghost'}
                    onClick={() => handleBoostToggle(job.id, job.is_boost)}
                    loading={actionLoading === job.id}
                    className={job.is_boost ? '' : 'border border-red-300 text-red-600'}
                  >
                    {job.is_boost ? '긴급 해제' : '긴급 부스트'}
                  </Button>

                  {/* 삭제 */}
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(job.id)}
                    loading={actionLoading === job.id}
                  >
                    삭제
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
