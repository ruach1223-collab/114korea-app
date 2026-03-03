'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { loginSchema, type LoginFormData } from '../validators'
import { useAuthStore } from '../store/authStore'

export function LoginForm() {
  const router = useRouter()
  const { setUser } = useAuthStore()
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        setError(result.message || '로그인에 실패했습니다')
        return
      }

      setUser(result.user)

      // 관리자는 관리자 페이지로, 업체는 대시보드로
      if (result.user.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
      router.refresh()
    } catch {
      setError('서버 오류가 발생했습니다')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      <Input
        label="이메일"
        type="email"
        placeholder="company@example.com"
        error={errors.email?.message}
        required
        {...register('email')}
      />

      <Input
        label="비밀번호"
        type="password"
        placeholder="비밀번호를 입력하세요"
        error={errors.password?.message}
        required
        {...register('password')}
      />

      <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
        로그인
      </Button>
    </form>
  )
}
