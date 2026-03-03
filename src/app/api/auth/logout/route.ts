import { NextResponse } from 'next/server'
import { AUTH_COOKIE_NAME } from '@/lib/auth'

export async function POST() {
  const response = NextResponse.json({ message: '로그아웃되었습니다' })
  response.cookies.set(AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0, // 즉시 만료
    path: '/',
  })
  return response
}
