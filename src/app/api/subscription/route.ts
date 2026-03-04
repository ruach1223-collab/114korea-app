import { NextResponse } from 'next/server'
import { getCurrentUser, findCompanyById } from '@/lib/auth'
import {
  getSubscriptionByCompany,
  createSubscription,
  getPaymentsBySubscription,
} from '@/lib/subscription'
import { requestBillingPayment, generatePaymentId } from '@/lib/portone'

// 구독 조회
export async function GET() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'company') {
    return NextResponse.json({ message: '로그인이 필요합니다' }, { status: 401 })
  }

  const subscription = await getSubscriptionByCompany(user.id)
  if (!subscription) {
    return NextResponse.json({ subscription: null, payments: [] })
  }

  const payments = await getPaymentsBySubscription(subscription.id)
  return NextResponse.json({ subscription, payments })
}

// 구독 생성 (빌링키 + 첫 결제)
export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'company') {
    return NextResponse.json({ message: '로그인이 필요합니다' }, { status: 401 })
  }

  // 이미 구독 중인지 확인
  const existing = await getSubscriptionByCompany(user.id)
  if (existing && (existing.status === 'active' || existing.status === 'cancelled')) {
    return NextResponse.json({ message: '이미 구독 중입니다' }, { status: 400 })
  }

  const body = await req.json()
  const { billing_key } = body

  if (!billing_key) {
    return NextResponse.json({ message: '빌링키가 필요합니다' }, { status: 400 })
  }

  // 업체 정보 조회
  const company = await findCompanyById(user.id)
  if (!company) {
    return NextResponse.json({ message: '업체 정보를 찾을 수 없습니다' }, { status: 404 })
  }

  // 첫 결제 요청
  const paymentId = generatePaymentId()
  const paymentResult = await requestBillingPayment({
    billingKey: billing_key,
    paymentId,
    amount: 100000,
    orderName: 'K114 VIP 구독 (월간)',
    customerName: company.company_name,
    customerEmail: company.email,
  })

  if (!paymentResult.success) {
    return NextResponse.json(
      { message: paymentResult.message ?? '결제에 실패했습니다' },
      { status: 400 },
    )
  }

  // 구독 생성
  const subscription = await createSubscription(user.id, billing_key, paymentId)

  return NextResponse.json({ subscription, message: 'VIP 구독이 시작되었습니다!' })
}
