'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useEffect, useState } from 'react'

const adminNav = [
  { href: '/admin', label: '대시보드', icon: '📊' },
  { href: '/admin/companies', label: '업체 관리', icon: '🏢' },
  { href: '/admin/jobs', label: '공고 관리', icon: '📋' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuthStore()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    // 관리자가 아니면 홈으로
    if (user && user.role !== 'admin') {
      router.replace('/')
    }
    setChecked(true)
  }, [user, router])

  if (!checked) return null

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* 상단 네비게이션 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">관리자</h1>
        <Link href="/" className="text-sm text-gray-500 hover:text-blue-600">
          사이트로 돌아가기 →
        </Link>
      </div>

      {/* 탭 네비게이션 */}
      <nav className="flex gap-1 mb-6 border-b border-gray-200">
        {adminNav.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {item.icon} {item.label}
            </Link>
          )
        })}
      </nav>

      {children}
    </div>
  )
}
