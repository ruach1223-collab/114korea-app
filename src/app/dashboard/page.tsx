import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/login')

  // 관리자는 관리자 페이지로
  if (user.role === 'admin') redirect('/admin')

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-900 mb-4">대시보드</h1>

      {/* 업체 상태 카드 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-gray-900">
              {user.company?.company_name ?? user.email}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {user.company?.biz_number} · {user.company?.rep_name}
            </p>
          </div>
          <span
            className={`px-3 py-1 text-xs font-medium rounded-full ${
              user.company?.status === 'approved'
                ? 'bg-green-100 text-green-700'
                : user.company?.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
            }`}
          >
            {user.company?.status === 'approved'
              ? '승인완료'
              : user.company?.status === 'pending'
                ? '승인대기'
                : '거부됨'}
          </span>
        </div>
      </div>

      {/* 승인 대기 안내 */}
      {user.company?.status === 'pending' && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
          <p className="text-sm font-medium text-yellow-800 mb-1">승인 대기 중</p>
          <p className="text-sm text-yellow-700">
            관리자 승인 후 공고 등록이 가능합니다. 승인까지 1~2 영업일 소요됩니다.
          </p>
        </div>
      )}

      {/* 승인된 업체 - 공고 관리 */}
      {user.company?.status === 'approved' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Link
            href="/dashboard/subscription"
            className="p-6 bg-amber-50 border border-amber-300 rounded-lg hover:bg-amber-100 transition-colors text-center"
          >
            <span className="text-2xl block mb-2">👑</span>
            <p className="font-medium text-amber-700">VIP 구독</p>
            <p className="text-xs text-amber-500 mt-1">월 10만원 · 상단고정노출</p>
          </Link>

          <Link
            href="/dashboard/jobs/new"
            className="p-6 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-center"
          >
            <span className="text-2xl block mb-2">📝</span>
            <p className="font-medium text-blue-700">공고 등록</p>
            <p className="text-xs text-blue-500 mt-1">오늘 0/2건 등록 가능</p>
          </Link>

          <Link
            href="/dashboard/jobs"
            className="p-6 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-center"
          >
            <span className="text-2xl block mb-2">📋</span>
            <p className="font-medium text-gray-700">내 공고 관리</p>
            <p className="text-xs text-gray-500 mt-1">등록한 공고 확인/수정</p>
          </Link>

          <Link
            href="/dashboard/profile"
            className="p-6 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-center"
          >
            <span className="text-2xl block mb-2">🏢</span>
            <p className="font-medium text-gray-700">업체 프로필</p>
            <p className="text-xs text-gray-500 mt-1">업체 정보 수정</p>
          </Link>
        </div>
      )}

      {/* TODO: Phase 3에서 내 공고 목록 표시 */}
      {user.company?.status === 'approved' && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">내 공고</h2>
          <div className="text-center py-8 text-gray-400">
            <span className="text-3xl block mb-2">📭</span>
            <p className="text-sm">등록된 공고가 없습니다</p>
            <Link
              href="/dashboard/jobs/new"
              className="text-sm text-blue-600 hover:underline mt-2 inline-block"
            >
              첫 공고 등록하기
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
