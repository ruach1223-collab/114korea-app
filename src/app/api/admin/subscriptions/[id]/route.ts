import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { updateSubscriptionAdmin } from '@/lib/subscription'

// 관리자: 구독 상태 변경
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ message: '관리자 권한이 필요합니다' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()

  const validStatuses = ['active', 'cancelled', 'expired']
  if (body.status && !validStatuses.includes(body.status)) {
    return NextResponse.json({ message: '유효하지 않은 상태입니다' }, { status: 400 })
  }

  const subscription = await updateSubscriptionAdmin(id, { status: body.status })
  return NextResponse.json({ subscription })
}
