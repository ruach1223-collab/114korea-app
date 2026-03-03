import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getJobsByCompany, getTodayJobCount } from '@/lib/jobs'

// GET /api/dashboard/jobs - 내 공고 목록 (모든 상태)
export async function GET() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'company') {
    return NextResponse.json({ message: '로그인이 필요합니다' }, { status: 401 })
  }

  const [jobs, todayCount] = await Promise.all([
    getJobsByCompany(user.id),
    getTodayJobCount(user.id),
  ])

  return NextResponse.json({
    jobs,
    todayCount,
    dailyLimit: 2,
  })
}
