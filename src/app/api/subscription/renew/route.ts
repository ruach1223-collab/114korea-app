import { NextResponse } from 'next/server'
import {
  getSubscriptionsToRenew,
  getCancelledExpiredSubscriptions,
  renewSubscription,
  expireSubscription,
  recordPaymentFailure,
} from '@/lib/subscription'
import { findCompanyById } from '@/lib/auth'
import { requestBillingPayment, generatePaymentId } from '@/lib/portone'

// Vercel Cron 전용 - 매일 자동갱신 처리
export async function POST(req: Request) {
  // Cron 인증 확인
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ message: '인증 실패' }, { status: 401 })
  }

  const results = { renewed: 0, expired: 0, failed: 0 }

  // 1. 해지 후 기간 만료된 구독 → expired 처리
  const cancelledExpired = await getCancelledExpiredSubscriptions()
  for (const sub of cancelledExpired) {
    await expireSubscription(sub.id, sub.company_id)
    results.expired++
  }

  // 2. active 구독 중 기간 만료된 것 → 자동 결제
  const toRenew = await getSubscriptionsToRenew()
  for (const sub of toRenew) {
    const company = await findCompanyById(sub.company_id)
    if (!company) {
      await expireSubscription(sub.id, sub.company_id)
      results.expired++
      continue
    }

    const paymentId = generatePaymentId()
    const result = await requestBillingPayment({
      billingKey: sub.billing_key,
      paymentId,
      amount: sub.amount,
      orderName: 'K114 VIP 구독 갱신 (월간)',
      customerName: company.company_name,
      customerEmail: company.email,
    })

    if (result.success) {
      await renewSubscription(sub.id, paymentId)
      results.renewed++
    } else {
      await recordPaymentFailure(sub.id, paymentId)
      // 결제 실패 시 만료 처리
      await expireSubscription(sub.id, sub.company_id)
      results.failed++
    }
  }

  return NextResponse.json({
    message: '자동갱신 처리 완료',
    results,
    processedAt: new Date().toISOString(),
  })
}
