import { NextResponse } from 'next/server'
import { getCurrentUser, getCompanyStats } from '@/lib/auth'
import { getJobStats } from '@/lib/jobs'

// 관리자 대시보드 통계
export async function GET() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ message: '관리자 권한이 필요합니다' }, { status: 403 })
  }

  const [companies, jobStats] = await Promise.all([
    getCompanyStats(),
    getJobStats(),
  ])

  const stats = {
    companies,
    jobs: {
      total: jobStats.total,
      active: jobStats.active,
      pending: jobStats.pending,
      hidden: jobStats.hidden,
      expired: jobStats.expired,
      vip: jobStats.vip,
    },
    views: {
      total: jobStats.totalViews,
    },
  }

  return NextResponse.json({ stats })
}
