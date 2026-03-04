import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="text-lg font-bold text-blue-600">K114</span>
            <p className="text-sm text-gray-500 mt-1">
              검증된 업체, 안전한 일자리
            </p>
          </div>

          <nav className="flex flex-wrap gap-4 text-sm text-gray-500">
            <Link href="/terms" className="hover:text-gray-700">
              이용약관
            </Link>
            <Link href="/privacy" className="hover:text-gray-700 font-medium">
              개인정보처리방침
            </Link>
          </nav>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 text-xs text-gray-400">
          <p>&copy; {new Date().getFullYear()} K114. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
