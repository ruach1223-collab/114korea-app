'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import type { SubscriptionWithCompany, SubscriptionStatus } from '@/types/subscription'

const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  active: '활성',
  cancelled: '해지예정',
  expired: '만료',
}

const STATUS_COLORS: Record<SubscriptionStatus, string> = {
  active: 'bg-green-100 text-green-700',
  cancelled: 'bg-yellow-100 text-yellow-700',
  expired: 'bg-gray-100 text-gray-500',
}

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/subscriptions')
    const data = await res.json()
    setSubscriptions(data.data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchSubscriptions()
  }, [fetchSubscriptions])

  const handleStatusChange = async (id: string, newStatus: SubscriptionStatus) => {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/admin/subscriptions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) await fetchSubscriptions()
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (subscriptions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <span className="text-3xl block mb-2">👑</span>
        <p>등록된 구독이 없습니다</p>
      </div>
    )
  }

  return (
    <div>
      {/* 요약 */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-xs text-gray-500">활성 구독</p>
          <p className="text-2xl font-bold text-green-700">
            {subscriptions.filter((s) => s.status === 'active').length}
          </p>
        </div>
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-gray-500">해지 예정</p>
          <p className="text-2xl font-bold text-yellow-700">
            {subscriptions.filter((s) => s.status === 'cancelled').length}
          </p>
        </div>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-gray-500">월 수익</p>
          <p className="text-2xl font-bold text-blue-700">
            {subscriptions
              .filter((s) => s.status === 'active')
              .reduce((sum, s) => sum + s.amount, 0)
              .toLocaleString()}
            <span className="text-sm font-normal">원</span>
          </p>
        </div>
      </div>

      {/* 구독 목록 */}
      <div className="space-y-3">
        {subscriptions.map((sub) => (
          <div
            key={sub.id}
            className={`bg-white border rounded-lg p-4 ${
              sub.status === 'active' ? 'border-green-200' : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-semibold text-gray-900">{sub.company_name}</span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_COLORS[sub.status]}`}>
                    {STATUS_LABELS[sub.status]}
                  </span>
                </div>
                <div className="text-sm text-gray-500 space-y-0.5">
                  <p>{sub.company_email}</p>
                  <p>
                    {sub.amount.toLocaleString()}원/월 ·
                    구독 시작: {new Date(sub.period_start).toLocaleDateString('ko-KR')} ·
                    {sub.status === 'active' ? '다음 결제' : '만료'}: {new Date(sub.period_end).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 shrink-0">
                {sub.status === 'active' && (
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleStatusChange(sub.id, 'expired')}
                    loading={actionLoading === sub.id}
                  >
                    강제 만료
                  </Button>
                )}
                {sub.status === 'expired' && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange(sub.id, 'active')}
                    loading={actionLoading === sub.id}
                  >
                    재활성화
                  </Button>
                )}
                {sub.status === 'cancelled' && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleStatusChange(sub.id, 'expired')}
                    loading={actionLoading === sub.id}
                  >
                    즉시 만료
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
