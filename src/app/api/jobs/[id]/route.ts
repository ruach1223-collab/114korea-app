import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getJobById, getCompanyName, updateJob, deleteJob, incrementViewCount } from '@/lib/jobs'
import { jobFormSchema } from '@/features/jobs/validators'

type RouteContext = {
  params: Promise<{ id: string }>
}

// GET /api/jobs/[id] - 공고 상세 (공개, 조회수 증가)
export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  const job = await getJobById(id)

  if (!job || (job.status !== 'active' && job.status !== 'pending')) {
    return NextResponse.json({ message: '공고를 찾을 수 없습니다' }, { status: 404 })
  }

  // 조회수 증가 (비동기, 응답 차단 안 함)
  incrementViewCount(id).catch(() => {})

  const companyName = await getCompanyName(job.company_id)
  return NextResponse.json({
    ...job,
    company_name: companyName,
  })
}

// PUT /api/jobs/[id] - 공고 수정 (본인만)
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'company') {
      return NextResponse.json({ message: '로그인이 필요합니다' }, { status: 401 })
    }

    const { id } = await context.params
    const job = await getJobById(id)

    if (!job) {
      return NextResponse.json({ message: '공고를 찾을 수 없습니다' }, { status: 404 })
    }

    if (job.company_id !== user.id) {
      return NextResponse.json({ message: '본인의 공고만 수정할 수 있습니다' }, { status: 403 })
    }

    const body = await request.json()
    const result = jobFormSchema.safeParse(body)
    if (!result.success) {
      const firstError = result.error.issues[0]?.message ?? '입력값이 올바르지 않습니다'
      return NextResponse.json({ message: firstError }, { status: 400 })
    }

    const data = result.data
    await updateJob(id, {
      title: data.title,
      industry: data.industry,
      region_city: data.region_city,
      region_district: data.region_district,
      salary_type: data.salary_type,
      salary_amount: data.salary_amount,
      work_hours: data.work_hours,
      work_shift: data.work_shift,
      visa_types: data.visa_types,
      tags: data.tags,
      dormitory: data.dormitory,
      description: data.description,
      contact_phone: data.contact_phone,
      contact_kakao: data.contact_kakao,
    })

    return NextResponse.json({ message: '공고가 수정되었습니다' })
  } catch {
    return NextResponse.json({ message: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}

// DELETE /api/jobs/[id] - 공고 삭제 (본인만)
export async function DELETE(_request: NextRequest, context: RouteContext) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'company') {
    return NextResponse.json({ message: '로그인이 필요합니다' }, { status: 401 })
  }

  const { id } = await context.params
  const job = await getJobById(id)

  if (!job) {
    return NextResponse.json({ message: '공고를 찾을 수 없습니다' }, { status: 404 })
  }

  if (job.company_id !== user.id) {
    return NextResponse.json({ message: '본인의 공고만 삭제할 수 있습니다' }, { status: 403 })
  }

  await deleteJob(id)
  return NextResponse.json({ message: '공고가 삭제되었습니다' })
}
