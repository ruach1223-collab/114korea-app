'use client'

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <p className="text-6xl mb-4">!</p>
      <h1 className="text-xl font-bold text-gray-900 mb-2">오류가 발생했습니다</h1>
      <p className="text-sm text-gray-500 mb-6">
        잠시 후 다시 시도해주세요.
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
      >
        다시 시도
      </button>
    </div>
  )
}
