import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { createServerClient } from '@/lib/supabase/server'
import type { Company } from '@/types/job'
import type { AuthUser } from '@/types/auth'

export const AUTH_COOKIE_NAME = '114korea-auth'

const getJwtSecret = () =>
  new TextEncoder().encode(process.env.JWT_SECRET ?? 'default-jwt-secret-change-in-production!!')

// === JWT 토큰 ===

export async function createToken(user: AuthUser): Promise<string> {
  return new SignJWT({
    email: user.email,
    role: user.role,
    company: user.company,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getJwtSecret())
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
    return {
      id: payload.sub as string,
      email: payload.email as string,
      role: payload.role as 'company' | 'admin',
      company: payload.company as Company | undefined,
    }
  } catch {
    return null
  }
}

// === 현재 사용자 (Server Component / Route Handler) ===

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

// === 업체 조회 ===

export async function findCompanyByEmail(email: string) {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('companies')
    .select('*')
    .eq('email', email)
    .single()
  return data as (Company & { password_hash: string }) | null
}

export async function findCompanyById(id: string) {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('companies')
    .select('id, email, company_name, biz_number, rep_name, phone, address, status, created_at, updated_at')
    .eq('id', id)
    .single()
  return data as Company | null
}

export async function checkBizNumberExists(bizNumber: string, excludeEmail?: string) {
  const supabase = createServerClient()
  let query = supabase
    .from('companies')
    .select('id', { count: 'exact', head: true })
    .eq('biz_number', bizNumber)
  if (excludeEmail) {
    query = query.neq('email', excludeEmail)
  }
  const { count } = await query
  return (count ?? 0) > 0
}

export async function getAllCompanies(statusFilter?: string) {
  const supabase = createServerClient()
  let query = supabase
    .from('companies')
    .select('id, email, company_name, biz_number, rep_name, phone, address, status, created_at, updated_at')

  if (statusFilter) {
    query = query.eq('status', statusFilter)
  }

  const { data } = await query.order('created_at', { ascending: false })
  return (data ?? []) as Company[]
}

export async function createCompany(input: {
  email: string
  password: string
  company_name: string
  biz_number: string
  rep_name: string
  phone: string
  address: string
}) {
  const supabase = createServerClient()
  const passwordHash = await bcrypt.hash(input.password, 10)

  const { data, error } = await supabase
    .from('companies')
    .insert({
      email: input.email,
      password_hash: passwordHash,
      company_name: input.company_name,
      biz_number: input.biz_number,
      rep_name: input.rep_name,
      phone: input.phone,
      address: input.address,
      status: 'pending',
    })
    .select('id, email, company_name, status')
    .single()

  if (error) throw error
  return data
}

export async function updateCompanyStatus(id: string, status: string) {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('companies')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id, email, company_name, biz_number, rep_name, phone, address, status, created_at, updated_at')
    .single()

  if (error) throw error
  return data as Company
}

export async function updateCompanyProfile(
  id: string,
  updates: { company_name?: string; rep_name?: string; phone?: string; address?: string },
) {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('companies')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id, email, company_name, biz_number, rep_name, phone, address, status, created_at, updated_at')
    .single()

  if (error) throw error
  return data as Company
}

// === 관리자 조회 ===

export async function findAdminByEmail(email: string) {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('admins')
    .select('*')
    .eq('email', email)
    .single()
  return data as { id: string; email: string; password_hash: string; role: string } | null
}

// === 비밀번호 비교 ===

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

// === 업체 통계 (관리자용) ===

export async function getCompanyStats() {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('companies')
    .select('status')

  const companies = data ?? []
  return {
    total: companies.length,
    pending: companies.filter((c) => c.status === 'pending').length,
    approved: companies.filter((c) => c.status === 'approved').length,
    rejected: companies.filter((c) => c.status === 'rejected').length,
  }
}
