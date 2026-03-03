import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <p className="text-6xl mb-4">404</p>
      <h1 className="text-xl font-bold text-gray-900 mb-2">페이지를 찾을 수 없습니다</h1>
      <p className="text-sm text-gray-500 mb-6">
        요청하신 페이지가 존재하지 않거나 이동되었습니다.
      </p>
      <div className="flex justify-center gap-3">
        <Link
          href="/"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          홈으로
        </Link>
        <Link
          href="/jobs"
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          채용정보 보기
        </Link>
      </div>
    </div>
  )
}
