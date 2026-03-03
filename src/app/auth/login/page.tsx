import Link from 'next/link'
import { LoginForm } from '@/features/auth/components/LoginForm'

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">업체 로그인</h1>
        <p className="text-sm text-gray-500 mt-2">
          114Korea에 등록된 업체 계정으로 로그인하세요
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <LoginForm />
      </div>

      <div className="text-center mt-4">
        <p className="text-sm text-gray-500">
          아직 계정이 없으신가요?{' '}
          <Link href="/auth/register" className="text-blue-600 hover:underline">
            회원가입
          </Link>
        </p>
      </div>

      {/* 개발용 테스트 계정 안내 */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-xs font-medium text-yellow-800 mb-1">테스트 계정 (개발용)</p>
        <p className="text-xs text-yellow-700">
          승인 업체: test@abc.com / test1234
          <br />
          대기 업체: pending@xyz.com / test1234
          <br />
          관리자: admin@114korea.com / admin1234
        </p>
      </div>
    </div>
  )
}
