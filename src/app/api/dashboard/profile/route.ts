import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, findCompanyById, updateCompanyProfile, createToken, AUTH_COOKIE_NAME } from '@/lib/auth'
import type { AuthUser } from '@/types/auth'

// GET /api/dashboard/profile - 내 업체 정보
export async function GET() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'company') {
    return NextResponse.json({ message: '로그인이 필요합니다' }, { status: 401 })
  }

  const company = await findCompanyById(user.id)
  if (!company) {
    return NextResponse.json({ message: '업체 정보를 찾을 수 없습니다' }, { status: 404 })
  }

  return NextResponse.json({ profile: company })
}

// PUT /api/dashboard/profile - 업체 프로필 수정
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'company') {
      return NextResponse.json({ message: '로그인이 필요합니다' }, { status: 401 })
    }

    const body = await request.json()
    const { company_name, rep_name, phone, address } = body

    const updates: Record<string, string> = {}
    if (company_name) updates.company_name = company_name
    if (rep_name) updates.rep_name = rep_name
    if (phone) updates.phone = phone
    if (address) updates.address = address

    const updatedCompany = await updateCompanyProfile(user.id, updates)

    // 쿠키의 사용자 정보도 업데이트
    const updatedUser: AuthUser = {
      ...user,
      company: updatedCompany,
    }
    const token = await createToken(updatedUser)
    const response = NextResponse.json({
      message: '프로필이 수정되었습니다',
      profile: updatedCompany,
    })
    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    return response
  } catch {
    return NextResponse.json({ message: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}
