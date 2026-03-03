import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getTodayJobCount } from '@/lib/jobs'
import { JobForm } from '@/components/job/JobForm'

export default async function NewJobPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/login')
  if (user.role !== 'company') redirect('/')

  if (user.company?.status !== 'approved') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <span className="text-4xl mb-4 block">⏳</span>
        <h1 className="text-xl font-bold text-gray-900 mb-2">승인 대기 중</h1>
        <p className="text-sm text-gray-500">
          관리자 승인 후 공고 등록이 가능합니다.
        </p>
      </div>
    )
  }

  const todayCount = await getTodayJobCount(user.id)

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-900 mb-6">구인공고 등록</h1>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <JobForm mode="create" todayCount={todayCount} />
      </div>
    </div>
  )
}
