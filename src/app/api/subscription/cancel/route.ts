import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { cancelSubscription, getSubscriptionByCompany } from '@/lib/subscription'

// 구독 해지 (기간 끝까지 유지)
export async function POST() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'company') {
    return NextResponse.json({ message: '로그인이 필요합니다' }, { status: 401 })
  }

  const existing = await getSubscriptionByCompany(user.id)
  if (!existing || existing.status !== 'active') {
    return NextResponse.json({ message: '활성 구독이 없습니다' }, { status: 400 })
  }

  const subscription = await cancelSubscription(user.id)

  return NextResponse.json({
    subscription,
    message: `구독이 해지되었습니다. ${new Date(subscription.period_end).toLocaleDateString('ko-KR')}까지 VIP가 유지됩니다.`,
  })
}
