'use client'

type PaginationProps = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  // 표시할 페이지 번호 계산 (최대 5개)
  const getPageNumbers = () => {
    const pages: number[] = []
    let start = Math.max(1, page - 2)
    const end = Math.min(totalPages, start + 4)
    start = Math.max(1, end - 4)

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <nav className="flex items-center justify-center gap-1 mt-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="px-3 py-2 text-sm rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        이전
      </button>

      {pageNumbers[0] > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="px-3 py-2 text-sm rounded-lg hover:bg-gray-100"
          >
            1
          </button>
          {pageNumbers[0] > 2 && <span className="px-2 text-gray-400">...</span>}
        </>
      )}

      {pageNumbers.map((num) => (
        <button
          key={num}
          onClick={() => onPageChange(num)}
          className={`px-3 py-2 text-sm rounded-lg ${
            num === page
              ? 'bg-blue-600 text-white'
              : 'hover:bg-gray-100'
          }`}
        >
          {num}
        </button>
      ))}

      {pageNumbers[pageNumbers.length - 1] < totalPages && (
        <>
          {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
            <span className="px-2 text-gray-400">...</span>
          )}
          <button
            onClick={() => onPageChange(totalPages)}
            className="px-3 py-2 text-sm rounded-lg hover:bg-gray-100"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="px-3 py-2 text-sm rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        다음
      </button>
    </nav>
  )
}
