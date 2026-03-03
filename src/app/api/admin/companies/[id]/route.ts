import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, updateCompanyStatus } from '@/lib/auth'
import type { CompanyStatus } from '@/types/job'

type RouteContext = {
  params: Promise<{ id: string }>
}

// 관리자: 업체 상태 변경 (승인/거부)
export async function PUT(request: NextRequest, context: RouteContext) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ message: '관리자 권한이 필요합니다' }, { status: 403 })
  }

  const { id } = await context.params
  const body = await request.json()
  const newStatus = body.status as CompanyStatus

  if (!['approved', 'rejected', 'pending'].includes(newStatus)) {
    return NextResponse.json({ message: '올바르지 않은 상태값입니다' }, { status: 400 })
  }

  try {
    const company = await updateCompanyStatus(id, newStatus)
    return NextResponse.json({ company, message: '상태가 변경되었습니다' })
  } catch {
    return NextResponse.json({ message: '업체를 찾을 수 없습니다' }, { status: 404 })
  }
}
