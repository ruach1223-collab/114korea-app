import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getAllJobs } from '@/lib/jobs'

// 관리자: 전체 공고 목록
export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ message: '관리자 권한이 필요합니다' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const data = await getAllJobs({
    status: searchParams.get('status') || undefined,
    vip: searchParams.get('vip') || undefined,
  })

  return NextResponse.json({ data })
}
