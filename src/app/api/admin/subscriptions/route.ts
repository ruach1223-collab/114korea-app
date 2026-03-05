import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getAllSubscriptions } from '@/lib/subscription'

// 관리자: 전체 구독 목록
export async function GET() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ message: '관리자 권한이 필요합니다' }, { status: 403 })
  }

  const subscriptions = await getAllSubscriptions()
  return NextResponse.json({ data: subscriptions })
}
