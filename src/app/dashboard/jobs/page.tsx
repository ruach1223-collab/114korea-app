'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatSalary, formatTimeAgo, INDUSTRY_ICONS } from '@/features/jobs/utils/constants'
import type { JobPost } from '@/types/job'

const STATUS_LABELS: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'default' }> = {
  active: { label: '공개', variant: 'success' },
  pending: { label: '심사중', variant: 'warning' },
  hidden: { label: '숨김', variant: 'danger' },
  expired: { label: '만료', variant: 'default' },
}

export default function DashboardJobsPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<JobPost[]>([])
  const [todayCount, setTodayCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/dashboard/jobs')
      .then((res) => res.json())
      .then((data) => {
        setJobs(data.jobs ?? [])
        setTodayCount(data.todayCount ?? 0)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setJobs((prev) => prev.filter((j) => j.id !== id))
      }
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-24 bg-gray-200 rounded" />
          <div className="h-24 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">내 공고 관리</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">오늘 {todayCount}/2건</span>
          <Link href="/dashboard/jobs/new">
            <Button size="sm">공고 등록</Button>
          </Link>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <span className="text-4xl block mb-4">📭</span>
          <h3 className="text-lg font-medium text-gray-900 mb-1">등록된 공고가 없습니다</h3>
          <p className="text-sm text-gray-500 mb-4">첫 공고를 등록해보세요</p>
          <Link href="/dashboard/jobs/new">
            <Button>공고 등록하기</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => {
            const statusInfo = STATUS_LABELS[job.status] ?? STATUS_LABELS.expired
            return (
              <div
                key={job.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      {job.is_vip && <Badge variant="vip">VIP</Badge>}
                      <span className="text-lg">
                        {INDUSTRY_ICONS[job.industry]}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {job.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {job.region_city} {job.region_district} ·{' '}
                      {formatSalary(job.salary_type, job.salary_amount)} ·{' '}
                      조회 {job.view_count}회 ·{' '}
                      {formatTimeAgo(job.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Link href={`/dashboard/jobs/${job.id}/edit`}>
                      <Button variant="secondary" size="sm">수정</Button>
                    </Link>
                    <Button
                      variant="danger"
                      size="sm"
                      loading={deleting === job.id}
                      onClick={() => handleDelete(job.id)}
                    >
                      삭제
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 대시보드로 돌아가기 */}
      <div className="mt-6 text-center">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-sm text-gray-500 hover:text-blue-600"
        >
          ← 대시보드로
        </button>
      </div>
    </div>
  )
}
