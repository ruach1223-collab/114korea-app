import { NextResponse } from 'next/server'
import { getCurrentUser, getCompanyStats } from '@/lib/auth'
import { getJobStats } from '@/lib/jobs'
import { getSubscriptionStats } from '@/lib/subscription'

// 관리자 대시보드 통계
export async function GET() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ message: '관리자 권한이 필요합니다' }, { status: 403 })
  }

  const [companies, jobStats, subStats] = await Promise.all([
    getCompanyStats(),
    getJobStats(),
    getSubscriptionStats(),
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
      crawled: jobStats.crawled,
    },
    views: {
      total: jobStats.totalViews,
    },
    subscriptions: subStats,
  }

  return NextResponse.json({ stats })
}
