// 포트원 서버 API (빌링키 결제 요청)

const PORTONE_API_URL = 'https://api.portone.io'

async function getPortoneHeaders(): Promise<Record<string, string>> {
  const apiSecret = process.env.PORTONE_API_SECRET
  if (!apiSecret) throw new Error('PORTONE_API_SECRET 환경변수를 설정하세요')

  return {
    'Content-Type': 'application/json',
    Authorization: `PortOne ${apiSecret}`,
  }
}

// === 빌링키로 결제 요청 ===

export async function requestBillingPayment(params: {
  billingKey: string
  paymentId: string
  amount: number
  orderName: string
  customerName: string
  customerEmail: string
}): Promise<{ success: boolean; paymentId: string; message?: string }> {
  const headers = await getPortoneHeaders()

  const res = await fetch(`${PORTONE_API_URL}/payments/${params.paymentId}/billing-key`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      billingKey: params.billingKey,
      orderName: params.orderName,
      currency: 'KRW',
      amount: { total: params.amount },
      customer: {
        name: { full: params.customerName },
        email: params.customerEmail,
      },
    }),
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    return {
      success: false,
      paymentId: params.paymentId,
      message: error.message ?? '결제 요청 실패',
    }
  }

  return { success: true, paymentId: params.paymentId }
}

// === 결제 고유 ID 생성 ===

export function generatePaymentId(): string {
  const now = new Date()
  const dateStr = now.toISOString().replace(/[-:T.Z]/g, '').slice(0, 14)
  const random = Math.random().toString(36).slice(2, 8)
  return `k114_${dateStr}_${random}`
}
