'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Stats = {
  companies: { total: number; pending: number; approved: number; rejected: number }
  jobs: { total: number; active: number; pending: number; hidden: number; expired: number; vip: number }
  views: { total: number }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => setStats(data.stats))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return <p className="text-center text-gray-500 py-12">통계를 불러올 수 없습니다.</p>
  }

  return (
    <div className="space-y-6">
      {/* 업체 통계 */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700">업체 현황</h2>
          <Link href="/admin/companies" className="text-xs text-blue-600 hover:underline">
            관리하기 →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="전체 업체" value={stats.companies.total} color="gray" />
          <StatCard label="승인 대기" value={stats.companies.pending} color="yellow" highlight />
          <StatCard label="승인 완료" value={stats.companies.approved} color="green" />
          <StatCard label="거부됨" value={stats.companies.rejected} color="red" />
        </div>
      </section>

      {/* 공고 통계 */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700">공고 현황</h2>
          <Link href="/admin/jobs" className="text-xs text-blue-600 hover:underline">
            관리하기 →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <StatCard label="전체 공고" value={stats.jobs.total} color="gray" />
          <StatCard label="활성 공고" value={stats.jobs.active} color="green" />
          <StatCard label="심사 대기" value={stats.jobs.pending} color="yellow" highlight />
          <StatCard label="숨김 처리" value={stats.jobs.hidden} color="red" />
          <StatCard label="VIP 공고" value={stats.jobs.vip} color="amber" />
          <StatCard label="총 조회수" value={stats.views.total} color="blue" />
        </div>
      </section>

      {/* 빠른 액션 */}
      <section>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">빠른 작업</h2>
        <div className="flex flex-wrap gap-2">
          {stats.companies.pending > 0 && (
            <Link
              href="/admin/companies?status=pending"
              className="px-4 py-2 text-sm bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg hover:bg-yellow-100"
            >
              승인 대기 업체 {stats.companies.pending}건 처리하기
            </Link>
          )}
          {stats.jobs.pending > 0 && (
            <Link
              href="/admin/jobs?status=pending"
              className="px-4 py-2 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100"
            >
              심사 대기 공고 {stats.jobs.pending}건 확인하기
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}

function StatCard({
  label,
  value,
  color,
  highlight = false,
}: {
  label: string
  value: number
  color: string
  highlight?: boolean
}) {
  const colorMap: Record<string, string> = {
    gray: 'bg-gray-50 border-gray-200',
    green: 'bg-green-50 border-green-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    red: 'bg-red-50 border-red-200',
    blue: 'bg-blue-50 border-blue-200',
    amber: 'bg-amber-50 border-amber-200',
  }
  const textColorMap: Record<string, string> = {
    gray: 'text-gray-900',
    green: 'text-green-700',
    yellow: 'text-yellow-700',
    red: 'text-red-700',
    blue: 'text-blue-700',
    amber: 'text-amber-700',
  }

  return (
    <div className={`p-4 rounded-lg border ${colorMap[color] ?? colorMap.gray} ${highlight ? 'ring-2 ring-yellow-300' : ''}`}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${textColorMap[color] ?? textColorMap.gray}`}>
        {value.toLocaleString()}
      </p>
    </div>
  )
}
