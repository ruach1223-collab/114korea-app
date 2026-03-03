import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { getJobById } from '@/lib/jobs'
import { JobForm } from '@/components/job/JobForm'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function EditJobPage({ params }: PageProps) {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/login')
  if (user.role !== 'company') redirect('/')

  const { id } = await params
  const job = await getJobById(id)

  if (!job) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <span className="text-4xl mb-4 block">😢</span>
        <h1 className="text-xl font-bold text-gray-900 mb-2">공고를 찾을 수 없습니다</h1>
        <Link href="/dashboard/jobs" className="text-blue-600 hover:underline text-sm">
          ← 내 공고 목록으로
        </Link>
      </div>
    )
  }

  if (job.company_id !== user.id) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <span className="text-4xl mb-4 block">🚫</span>
        <h1 className="text-xl font-bold text-gray-900 mb-2">권한이 없습니다</h1>
        <p className="text-sm text-gray-500">본인의 공고만 수정할 수 있습니다.</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Link
        href="/dashboard/jobs"
        className="text-sm text-gray-500 hover:text-blue-600 mb-4 inline-block"
      >
        ← 내 공고 목록
      </Link>

      <h1 className="text-xl font-bold text-gray-900 mb-6">공고 수정</h1>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <JobForm mode="edit" initialData={job} />
      </div>
    </div>
  )
}
