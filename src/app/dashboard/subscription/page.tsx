'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/features/auth/store/authStore'
import { Button } from '@/components/ui/Button'
import type { Subscription, Payment } from '@/types/subscription'

declare global {
  interface Window {
    PortOne?: {
      requestIssueBillingKey: (params: {
        storeId: string
        channelKey: string
        billingKeyMethod: string
      }) => Promise<{
        billingKey?: string
        code?: string
        message?: string
      }>
    }
  }
}

export default function SubscriptionPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchSubscription = useCallback(async () => {
    const res = await fetch('/api/subscription')
    const data = await res.json()
    setSubscription(data.subscription)
    setPayments(data.payments ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!user || user.role !== 'company') {
      router.replace('/auth/login')
      return
    }
    fetchSubscription()
  }, [user, router, fetchSubscription])

  // 포트원 SDK 빌링키 발급 + 구독 시작
  const handleSubscribe = async () => {
    setActionLoading(true)
    try {
      // 포트원 SDK 동적 로드
      if (!window.PortOne) {
        const script = document.createElement('script')
        script.src = 'https://cdn.portone.io/v2/browser-sdk.js'
        document.head.appendChild(script)
        await new Promise<void>((resolve) => {
          script.onload = () => resolve()
        })
      }

      const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID
      if (!storeId) {
        alert('포트원 설정이 완료되지 않았습니다. 관리자에게 문의하세요.')
        return
      }

      // 빌링키 발급
      const response = await window.PortOne!.requestIssueBillingKey({
        storeId,
        channelKey: 'channel-key-afcb8f23-5557-45ca-bc7b-2301221b4c6a',
        billingKeyMethod: 'CARD',
      })

      if (response.code || !response.billingKey) {
        alert(response.message ?? '카드 등록에 실패했습니다.')
        return
      }

      // 서버에 구독 생성 요청
      const res = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billing_key: response.billingKey }),
      })

      const result = await res.json()
      if (!res.ok) {
        alert(result.message ?? '구독 생성에 실패했습니다.')
        return
      }

      alert(result.message)
      fetchSubscription()
    } finally {
      setActionLoading(false)
    }
  }

  // 구독 해지
  const handleCancel = async () => {
    if (!confirm('정말 VIP 구독을 해지하시겠습니까?\n현재 구독 기간이 끝날 때까지 VIP는 유지됩니다.')) return

    setActionLoading(true)
    try {
      const res = await fetch('/api/subscription/cancel', { method: 'POST' })
      const result = await res.json()
      if (!res.ok) {
        alert(result.message ?? '해지에 실패했습니다.')
        return
      }
      alert(result.message)
      fetchSubscription()
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-64 bg-gray-200 rounded-lg" />
        </div>
      </div>
    )
  }

  const isVipActive = subscription &&
    (subscription.status === 'active' || subscription.status === 'cancelled') &&
    new Date(subscription.period_end) > new Date()

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-900 mb-6">VIP 구독 관리</h1>

      {/* 미구독 상태 */}
      {!isVipActive && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="text-center mb-6">
            <span className="text-4xl block mb-3">👑</span>
            <h2 className="text-lg font-bold text-gray-900 mb-2">VIP 상단고정노출</h2>
            <p className="text-gray-500 text-sm">
              모든 공고가 검색 결과 최상단에 노출됩니다
            </p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
              <span className="text-lg">🔝</span>
              <div>
                <p className="text-sm font-medium text-gray-900">상단 고정 노출</p>
                <p className="text-xs text-gray-500">모든 공고가 일반 공고 위에 노출됩니다</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
              <span className="text-lg">🏷️</span>
              <div>
                <p className="text-sm font-medium text-gray-900">VIP 뱃지</p>
                <p className="text-xs text-gray-500">눈에 띄는 VIP 뱃지로 신뢰도 향상</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
              <span className="text-lg">📊</span>
              <div>
                <p className="text-sm font-medium text-gray-900">높은 조회수</p>
                <p className="text-xs text-gray-500">상단 노출로 평균 3배 이상의 조회수</p>
              </div>
            </div>
          </div>

          <div className="text-center border-t border-gray-100 pt-6">
            <p className="text-3xl font-bold text-gray-900 mb-1">
              월 100,000<span className="text-base font-normal text-gray-500">원</span>
            </p>
            <p className="text-xs text-gray-400 mb-4">매월 자동 결제 · 언제든 해지 가능</p>
            <Button
              onClick={handleSubscribe}
              loading={actionLoading}
              className="w-full"
            >
              카드 등록하고 VIP 시작
            </Button>
          </div>
        </div>
      )}

      {/* 구독 중 상태 */}
      {isVipActive && subscription && (
        <div className="space-y-4">
          {/* 구독 상태 카드 */}
          <div className="bg-amber-50 border border-amber-300 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">👑</span>
                <h2 className="text-lg font-bold text-amber-900">VIP 구독 중</h2>
              </div>
              <span
                className={`px-3 py-1 text-xs font-medium rounded-full ${
                  subscription.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {subscription.status === 'active' ? '자동갱신' : '해지 예정'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-amber-700">구독 시작</p>
                <p className="font-medium text-gray-900">
                  {new Date(subscription.period_start).toLocaleDateString('ko-KR')}
                </p>
              </div>
              <div>
                <p className="text-amber-700">
                  {subscription.status === 'active' ? '다음 결제일' : '만료 예정일'}
                </p>
                <p className="font-medium text-gray-900">
                  {new Date(subscription.period_end).toLocaleDateString('ko-KR')}
                </p>
              </div>
              <div>
                <p className="text-amber-700">월 결제 금액</p>
                <p className="font-medium text-gray-900">
                  {subscription.amount.toLocaleString()}원
                </p>
              </div>
            </div>

            {subscription.status === 'active' && (
              <div className="mt-4 pt-4 border-t border-amber-200">
                <button
                  onClick={handleCancel}
                  disabled={actionLoading}
                  className="text-sm text-red-500 hover:text-red-700 underline"
                >
                  구독 해지
                </button>
                <p className="text-xs text-amber-600 mt-1">
                  해지하면 현재 기간 종료 후 VIP가 해제됩니다
                </p>
              </div>
            )}

            {subscription.status === 'cancelled' && (
              <div className="mt-4 pt-4 border-t border-amber-200">
                <p className="text-sm text-yellow-700">
                  해지 예정 · {new Date(subscription.period_end).toLocaleDateString('ko-KR')}까지 VIP 유지
                </p>
              </div>
            )}
          </div>

          {/* 결제 내역 */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">결제 내역</h3>
            {payments.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">결제 내역이 없습니다</p>
            ) : (
              <div className="space-y-2">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div>
                      <p className="text-sm text-gray-900">
                        {payment.amount.toLocaleString()}원
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(payment.paid_at).toLocaleDateString('ko-KR')}{' '}
                        {new Date(payment.paid_at).toLocaleTimeString('ko-KR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        payment.status === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : payment.status === 'failed'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {payment.status === 'paid'
                        ? '결제완료'
                        : payment.status === 'failed'
                          ? '실패'
                          : '환불'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
