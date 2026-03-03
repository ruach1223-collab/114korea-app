import { NextRequest, NextResponse } from 'next/server'
import { findCompanyByEmail, checkBizNumberExists, createCompany } from '@/lib/auth'
import { registerSchema } from '@/features/auth/validators'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 유효성 검증
    const result = registerSchema.safeParse(body)
    if (!result.success) {
      const firstError = result.error.issues[0]?.message ?? '입력값이 올바르지 않습니다'
      return NextResponse.json(
        { message: firstError },
        { status: 400 },
      )
    }

    const { email, password, company_name, biz_number, rep_name, phone, address } = result.data

    // 이메일 중복 체크
    const existing = await findCompanyByEmail(email)
    if (existing) {
      return NextResponse.json(
        { message: '이미 등록된 이메일입니다' },
        { status: 400 },
      )
    }

    // 사업자등록번호 중복 체크
    const bizExists = await checkBizNumberExists(biz_number)
    if (bizExists) {
      return NextResponse.json(
        { message: '이미 등록된 사업자등록번호입니다' },
        { status: 400 },
      )
    }

    // 업체 생성 (status: pending → 관리자 승인 필요)
    const newCompany = await createCompany({
      email,
      password,
      company_name,
      biz_number,
      rep_name,
      phone,
      address,
    })

    return NextResponse.json(
      {
        id: newCompany.id,
        email: newCompany.email,
        company_name: newCompany.company_name,
        status: newCompany.status,
        message: '회원가입이 완료되었습니다. 관리자 승인 후 이용 가능합니다.',
      },
      { status: 201 },
    )
  } catch {
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 },
    )
  }
}
