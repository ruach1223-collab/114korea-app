'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/features/auth/store/authStore'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const { user, isLoading } = useAuthStore()

  const isLoggedIn = !!user

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    useAuthStore.getState().logout()
    setMobileMenuOpen(false)
    router.push('/')
    router.refresh()
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-blue-600">K114</span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-medium text-green-700 bg-green-100 rounded">검증된 공고</span>
          </Link>

          {/* 데스크탑 메뉴 */}
          <nav className="hidden md:flex items-center gap-4">
            <Link
              href="/jobs"
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              채용정보
            </Link>
            {!isLoading && isLoggedIn ? (
              <>
                {user?.role === 'admin' ? (
                  <Link
                    href="/admin"
                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    관리자
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/dashboard"
                      className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      대시보드
                    </Link>
                    <Link
                      href="/dashboard/jobs/new"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      공고등록
                    </Link>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-600 hover:text-red-600 transition-colors"
                >
                  로그아웃
                </button>
              </>
            ) : !isLoading ? (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  업체 로그인
                </Link>
                <Link
                  href="/dashboard/jobs/new"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  공고등록
                </Link>
              </>
            ) : null}
          </nav>

          {/* 모바일 메뉴 버튼 */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600"
            aria-label="메뉴"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* 모바일 메뉴 */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col gap-3">
              <Link
                href="/jobs"
                className="text-sm text-gray-600 hover:text-blue-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                채용정보
              </Link>
              {isLoggedIn ? (
                <>
                  {user?.role === 'admin' ? (
                    <Link
                      href="/admin"
                      className="text-sm text-gray-600 hover:text-blue-600"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      관리자
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/dashboard"
                        className="text-sm text-gray-600 hover:text-blue-600"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        대시보드
                      </Link>
                      <Link
                        href="/dashboard/jobs/new"
                        className="inline-block text-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        공고등록
                      </Link>
                    </>
                  )}
                  <button
                    onClick={handleLogout}
                    className="text-sm text-red-600 text-left"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="text-sm text-gray-600 hover:text-blue-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    업체 로그인
                  </Link>
                  <Link
                    href="/dashboard/jobs/new"
                    className="inline-block text-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    공고등록
                  </Link>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
