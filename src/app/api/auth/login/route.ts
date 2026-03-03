import { NextRequest, NextResponse } from 'next/server'
import {
  findCompanyByEmail,
  findAdminByEmail,
  comparePassword,
  createToken,
  AUTH_COOKIE_NAME,
} from '@/lib/auth'
import type { AuthUser } from '@/types/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { message: '이메일과 비밀번호를 입력해주세요' },
        { status: 400 },
      )
    }

    // 관리자 로그인 체크
    const adminUser = await findAdminByEmail(email)
    if (adminUser) {
      const isValid = await comparePassword(password, adminUser.password_hash)
      if (isValid) {
        const user: AuthUser = {
          id: adminUser.id,
          email: adminUser.email,
          role: 'admin',
        }
        const token = await createToken(user)
        const response = NextResponse.json({ user })
        response.cookies.set(AUTH_COOKIE_NAME, token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7,
          path: '/',
        })
        return response
      }
    }

    // 업체 로그인 체크
    const company = await findCompanyByEmail(email)
    if (!company) {
      return NextResponse.json(
        { message: '이메일 또는 비밀번호가 올바르지 않습니다' },
        { status: 401 },
      )
    }

    const isValid = await comparePassword(password, company.password_hash)
    if (!isValid) {
      return NextResponse.json(
        { message: '이메일 또는 비밀번호가 올바르지 않습니다' },
        { status: 401 },
      )
    }

    const { password_hash: _, ...companyData } = company
    const user: AuthUser = {
      id: company.id,
      email: company.email,
      role: 'company',
      company: companyData,
    }

    const token = await createToken(user)
    const response = NextResponse.json({ user })
    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    return response
  } catch {
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 },
    )
  }
}
