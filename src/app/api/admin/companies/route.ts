import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, getAllCompanies } from '@/lib/auth'

// 관리자: 업체 목록 조회
export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ message: '관리자 권한이 필요합니다' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const statusFilter = searchParams.get('status') || ''

  const companies = await getAllCompanies(statusFilter || undefined)

  return NextResponse.json({ data: companies })
}
