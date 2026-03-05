// === 구독 상태 ===
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired'

// === 결제 상태 ===
export type PaymentStatus = 'paid' | 'failed' | 'refunded'

// === 구독 ===
export type Subscription = {
  id: string
  company_id: string
  billing_key: string
  amount: number
  status: SubscriptionStatus
  period_start: string
  period_end: string
  created_at: string
  updated_at: string
}

// === 결제 내역 ===
export type Payment = {
  id: string
  subscription_id: string
  payment_id: string
  amount: number
  status: PaymentStatus
  paid_at: string
}

// === 구독 + 업체명 (관리자 목록용) ===
export type SubscriptionWithCompany = Subscription & {
  company_name: string
  company_email: string
}

// === 구독 생성 요청 ===
export type CreateSubscriptionRequest = {
  billing_key: string
}
