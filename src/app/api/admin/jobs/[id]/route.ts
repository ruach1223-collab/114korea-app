import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getJobById, getCompanyName, updateJobAdmin, deleteJob } from '@/lib/jobs'
import type { JobStatus } from '@/types/job'

type RouteContext = {
  params: Promise<{ id: string }>
}

// 관리자: 공고 상태 변경 (활성화/숨김/VIP 설정 등)
export async function PUT(request: NextRequest, context: RouteContext) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ message: '관리자 권한이 필요합니다' }, { status: 403 })
  }

  const { id } = await context.params
  const body = await request.json()

  const existing = await getJobById(id)
  if (!existing) {
    return NextResponse.json({ message: '공고를 찾을 수 없습니다' }, { status: 404 })
  }

  const updates: { status?: string; is_vip?: boolean; is_boost?: boolean; boost_expires_at?: string | null } = {}

  // 상태 변경
  if (body.status) {
    const validStatuses: JobStatus[] = ['pending', 'active', 'hidden', 'expired']
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json({ message: '올바르지 않은 상태값입니다' }, { status: 400 })
    }
    updates.status = body.status
  }

  // VIP 토글
  if (typeof body.is_vip === 'boolean') {
    updates.is_vip = body.is_vip
  }

  // 긴급채용 부스트 토글 (24시간 유효)
  if (typeof body.is_boost === 'boolean') {
    updates.is_boost = body.is_boost
    updates.boost_expires_at = body.is_boost
      ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      : null
  }

  const updatedJob = await updateJobAdmin(id, updates)
  const companyName = await getCompanyName(updatedJob.company_id)

  return NextResponse.json({
    job: { ...updatedJob, company_name: companyName },
    message: '공고가 수정되었습니다',
  })
}

// 관리자: 공고 삭제
export async function DELETE(_request: NextRequest, context: RouteContext) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ message: '관리자 권한이 필요합니다' }, { status: 403 })
  }

  const { id } = await context.params
  const existing = await getJobById(id)

  if (!existing) {
    return NextResponse.json({ message: '공고를 찾을 수 없습니다' }, { status: 404 })
  }

  await deleteJob(id)
  return NextResponse.json({ message: '공고가 삭제되었습니다' })
}
