'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { registerSchema, type RegisterFormData } from '../validators'

export function RegisterForm() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        setError(result.message || '회원가입에 실패했습니다')
        return
      }

      setSuccess(true)
    } catch {
      setError('서버 오류가 발생했습니다')
    }
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <span className="text-4xl mb-4 block">✅</span>
        <h2 className="text-xl font-bold text-gray-900 mb-2">회원가입 완료</h2>
        <p className="text-sm text-gray-500 mb-6">
          관리자 승인 후 공고 등록이 가능합니다.
          <br />
          승인까지 1~2 영업일 소요됩니다.
        </p>
        <Button onClick={() => router.push('/auth/login')}>
          로그인 페이지로
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* 계정 정보 */}
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
        placeholder="영문+숫자 8자 이상"
        error={errors.password?.message}
        required
        {...register('password')}
      />

      <Input
        label="비밀번호 확인"
        type="password"
        placeholder="비밀번호를 다시 입력하세요"
        error={errors.password_confirm?.message}
        required
        {...register('password_confirm')}
      />

      {/* 구분선 */}
      <div className="border-t border-gray-200 pt-4">
        <p className="text-sm font-medium text-gray-700 mb-4">업체 정보</p>
      </div>

      <Input
        label="회사명"
        placeholder="ABC아웃소싱"
        error={errors.company_name?.message}
        required
        {...register('company_name')}
      />

      <Input
        label="사업자등록번호"
        placeholder="000-00-00000"
        error={errors.biz_number?.message}
        required
        {...register('biz_number')}
      />

      <Input
        label="대표자명"
        placeholder="홍길동"
        error={errors.rep_name?.message}
        required
        {...register('rep_name')}
      />

      <Input
        label="연락처"
        placeholder="010-1234-5678"
        error={errors.phone?.message}
        required
        {...register('phone')}
      />

      <Input
        label="주소"
        placeholder="경기도 화성시 동탄대로 123"
        error={errors.address?.message}
        required
        {...register('address')}
      />

      <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
        회원가입
      </Button>

      <p className="text-xs text-gray-500 text-center">
        * 회원가입 후 관리자 승인이 필요합니다
      </p>
    </form>
  )
}
