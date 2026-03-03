import Link from 'next/link'
import { RegisterForm } from '@/features/auth/components/RegisterForm'

export default function RegisterPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">업체 회원가입</h1>
        <p className="text-sm text-gray-500 mt-2">
          구인공고를 등록하려면 업체 회원가입이 필요합니다
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <RegisterForm />
      </div>

      <div className="text-center mt-4">
        <p className="text-sm text-gray-500">
          이미 계정이 있으신가요?{' '}
          <Link href="/auth/login" className="text-blue-600 hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}
