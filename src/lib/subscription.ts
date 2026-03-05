import { createServerClient } from '@/lib/supabase/server'
import type { Subscription, Payment } from '@/types/subscription'

// === 구독 조회 (업체별) ===

export async function getSubscriptionByCompany(companyId: string): Promise<Subscription | null> {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('company_id', companyId)
    .single()
  return data as Subscription | null
}

// === 구독 생성 ===

export async function createSubscription(
  companyId: string,
  billingKey: string,
  paymentId: string,
): Promise<Subscription> {
  const supabase = createServerClient()
  const now = new Date()
  const periodEnd = new Date(now.getTime() + 30 * 86400000)

  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      company_id: companyId,
      billing_key: billingKey,
      amount: 100000,
      status: 'active',
      period_start: now.toISOString(),
      period_end: periodEnd.toISOString(),
    })
    .select('*')
    .single()

  if (error) throw error

  // 첫 결제 기록
  await supabase.from('payments').insert({
    subscription_id: data.id,
    payment_id: paymentId,
    amount: 100000,
    status: 'paid',
  })

  // 업체 공고 VIP 활성화
  await syncVip(companyId, true)

  return data as Subscription
}

// === 구독 해지 (기간 끝까지 유지) ===

export async function cancelSubscription(companyId: string): Promise<Subscription> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('subscriptions')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('company_id', companyId)
    .eq('status', 'active')
    .select('*')
    .single()

  if (error) throw error
  return data as Subscription
}

// === 구독 만료 처리 ===

export async function expireSubscription(subscriptionId: string, companyId: string): Promise<void> {
  const supabase = createServerClient()
  await supabase
    .from('subscriptions')
    .update({ status: 'expired', updated_at: new Date().toISOString() })
    .eq('id', subscriptionId)

  // VIP 해제
  await syncVip(companyId, false)
}

// === 자동갱신 대상 조회 (기간 만료 + active 상태) ===

export async function getSubscriptionsToRenew(): Promise<Subscription[]> {
  const supabase = createServerClient()
  const now = new Date().toISOString()

  const { data } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('status', 'active')
    .lte('period_end', now)

  return (data ?? []) as Subscription[]
}

// === 해지 후 기간 만료된 구독 조회 ===

export async function getCancelledExpiredSubscriptions(): Promise<Subscription[]> {
  const supabase = createServerClient()
  const now = new Date().toISOString()

  const { data } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('status', 'cancelled')
    .lte('period_end', now)

  return (data ?? []) as Subscription[]
}

// === 구독 갱신 (기간 연장) ===

export async function renewSubscription(
  subscriptionId: string,
  paymentId: string,
): Promise<void> {
  const supabase = createServerClient()
  const now = new Date()
  const newEnd = new Date(now.getTime() + 30 * 86400000)

  await supabase
    .from('subscriptions')
    .update({
      period_start: now.toISOString(),
      period_end: newEnd.toISOString(),
      updated_at: now.toISOString(),
    })
    .eq('id', subscriptionId)

  await supabase.from('payments').insert({
    subscription_id: subscriptionId,
    payment_id: paymentId,
    amount: 100000,
    status: 'paid',
  })
}

// === 결제 실패 기록 ===

export async function recordPaymentFailure(
  subscriptionId: string,
  paymentId: string,
): Promise<void> {
  const supabase = createServerClient()
  await supabase.from('payments').insert({
    subscription_id: subscriptionId,
    payment_id: paymentId,
    amount: 100000,
    status: 'failed',
  })
}

// === 결제 내역 조회 ===

export async function getPaymentsBySubscription(subscriptionId: string): Promise<Payment[]> {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('payments')
    .select('*')
    .eq('subscription_id', subscriptionId)
    .order('paid_at', { ascending: false })

  return (data ?? []) as Payment[]
}

// === 업체 공고 VIP 일괄 변경 ===

export async function syncVip(companyId: string, vipStatus: boolean): Promise<void> {
  const supabase = createServerClient()
  await supabase.rpc('sync_vip_by_company', {
    target_company_id: companyId,
    vip_status: vipStatus,
  })
}

// === 관리자: 전체 구독 목록 ===

export async function getAllSubscriptions() {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('subscriptions')
    .select('*')
    .order('created_at', { ascending: false })

  const subscriptions = (data ?? []) as Subscription[]

  // 업체명 매핑
  const companyIds = [...new Set(subscriptions.map((s) => s.company_id))]
  if (companyIds.length === 0) return []

  const { data: companies } = await supabase
    .from('companies')
    .select('id, company_name, email')
    .in('id', companyIds)

  const companyMap: Record<string, { name: string; email: string }> = {}
  for (const c of companies ?? []) {
    companyMap[c.id] = { name: c.company_name, email: c.email }
  }

  return subscriptions.map((s) => ({
    ...s,
    company_name: companyMap[s.company_id]?.name ?? '미등록업체',
    company_email: companyMap[s.company_id]?.email ?? '',
  }))
}

// === 관리자: 구독 상태 변경 ===

export async function updateSubscriptionAdmin(
  id: string,
  updates: { status?: string },
): Promise<Subscription> {
  const supabase = createServerClient()

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('id', id)
    .single()

  if (!sub) throw new Error('구독을 찾을 수 없습니다')

  const { data, error } = await supabase
    .from('subscriptions')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error

  // 상태에 따라 VIP 동기화
  if (updates.status === 'expired') {
    await syncVip(sub.company_id, false)
  } else if (updates.status === 'active') {
    await syncVip(sub.company_id, true)
  }

  return data as Subscription
}

// === 구독 통계 ===

export async function getSubscriptionStats() {
  const supabase = createServerClient()
  const { data } = await supabase.from('subscriptions').select('status, amount')

  const subs = data ?? []
  const activeSubs = subs.filter((s: { status: string }) => s.status === 'active')

  return {
    total: subs.length,
    active: activeSubs.length,
    cancelled: subs.filter((s: { status: string }) => s.status === 'cancelled').length,
    expired: subs.filter((s: { status: string }) => s.status === 'expired').length,
    monthlyRevenue: activeSubs.reduce((sum: number, s: { amount: number }) => sum + s.amount, 0),
  }
}

// === 업체가 구독 중인지 확인 ===

export async function isCompanySubscribed(companyId: string): Promise<boolean> {
  const sub = await getSubscriptionByCompany(companyId)
  if (!sub) return false
  return sub.status === 'active' || (sub.status === 'cancelled' && new Date(sub.period_end) > new Date())
}
