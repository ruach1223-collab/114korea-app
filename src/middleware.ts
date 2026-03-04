import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const AUTH_COOKIE = 'k114-auth'

// 인증 필요 경로
const PROTECTED_PATHS = ['/dashboard']
const ADMIN_PATHS = ['/admin']
// 로그인 상태에서 접근 불필요한 경로
const AUTH_PATHS = ['/auth/login', '/auth/register']

async function verifyTokenFromCookie(token: string): Promise<{ role?: string } | null> {
  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET ?? 'default-jwt-secret-change-in-production!!',
    )
    const { payload } = await jwtVerify(token, secret)
    return { role: payload.role as string }
  } catch {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p))
  const isAdmin = ADMIN_PATHS.some((p) => pathname.startsWith(p))
  const isAuth = AUTH_PATHS.some((p) => pathname.startsWith(p))

  // 인증이 필요한 페이지에 토큰 없이 접근 → 로그인으로 리다이렉트
  if ((isProtected || isAdmin) && !token) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 관리자 페이지에 관리자가 아닌 사용자가 접근 → 홈으로
  if (isAdmin && token) {
    const user = await verifyTokenFromCookie(token)
    if (user?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // 이미 로그인된 사용자가 로그인/회원가입 페이지 접근 → 대시보드로
  if (isAuth && token) {
    const user = await verifyTokenFromCookie(token)
    if (user) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/auth/:path*'],
}
