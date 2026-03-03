'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/features/auth/store/authStore'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser } = useAuthStore()

  useEffect(() => {
    // 서버 쿠키와 클라이언트 상태 동기화
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data?.user ?? null))
      .catch(() => setUser(null))
  }, [setUser])

  return <>{children}</>
}
