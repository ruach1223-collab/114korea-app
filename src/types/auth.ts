import type { Company } from './job'

// 인증된 사용자
export type AuthUser = {
  id: string
  email: string
  role: 'company' | 'admin'
  company?: Company
}

// 로그인 요청
export type LoginRequest = {
  email: string
  password: string
}

// 회원가입 요청
export type RegisterRequest = {
  email: string
  password: string
  password_confirm: string
  company_name: string
  biz_number: string
  rep_name: string
  phone: string
  address: string
}

// 인증 응답
export type AuthResponse = {
  user: AuthUser
  message?: string
}
