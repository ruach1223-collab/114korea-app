import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getActiveJobs, getTodayJobCount, createJob } from '@/lib/jobs'
import { jobFormSchema } from '@/features/jobs/validators'

// GET /api/jobs - 공개 공고 목록 (필터/정렬/페이지네이션)
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  const result = await getActiveJobs({
    industry: searchParams.get('industry') ?? undefined,
    region_city: searchParams.get('region_city') ?? undefined,
    visa_type: searchParams.get('visa_type') ?? undefined,
    salary_type: searchParams.get('salary_type') ?? undefined,
    sort: searchParams.get('sort') ?? 'latest',
    page: Number(searchParams.get('page') ?? '1'),
    limit: Number(searchParams.get('limit') ?? '20'),
  })

  return NextResponse.json(result)
}

// POST /api/jobs - 공고 등록 (인증 필요, 승인 업체만)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'company') {
      return NextResponse.json({ message: '로그인이 필요합니다' }, { status: 401 })
    }

    if (user.company?.status !== 'approved') {
      return NextResponse.json({ message: '승인된 업체만 공고를 등록할 수 있습니다' }, { status: 403 })
    }

    // 하루 2건 제한 체크
    const todayCount = await getTodayJobCount(user.id)
    if (todayCount >= 2) {
      return NextResponse.json(
        { message: '오늘 등록 가능한 공고 수(2건)를 초과했습니다' },
        { status: 429 },
      )
    }

    const body = await request.json()
    const result = jobFormSchema.safeParse(body)
    if (!result.success) {
      const firstError = result.error.issues[0]?.message ?? '입력값이 올바르지 않습니다'
      return NextResponse.json({ message: firstError }, { status: 400 })
    }

    const data = result.data
    const newJob = await createJob(user.id, {
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

    return NextResponse.json(
      { id: newJob.id, message: '공고가 등록되었습니다. 관리자 승인 후 공개됩니다.' },
      { status: 201 },
    )
  } catch {
    return NextResponse.json({ message: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}
