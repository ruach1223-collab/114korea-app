import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '개인정보처리방침',
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-gray-900 mb-6">개인정보처리방침</h1>
      <div className="prose prose-sm text-gray-700 space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-gray-900">1. 수집하는 개인정보</h2>
          <p>서비스는 업체 회원가입 시 다음 정보를 수집합니다:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>이메일 주소</li>
            <li>회사명, 대표자명</li>
            <li>사업자등록번호</li>
            <li>연락처 (전화번호)</li>
            <li>사업장 주소</li>
          </ul>
          <p className="mt-2">구직자(외국인 근로자)는 별도의 회원가입 없이 서비스를 이용할 수 있으며, 개인정보를 수집하지 않습니다.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">2. 개인정보 이용 목적</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>업체 인증 및 서비스 제공</li>
            <li>구인공고 등록 및 관리</li>
            <li>서비스 관련 안내 및 공지</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">3. 개인정보 보유 기간</h2>
          <p>
            회원 탈퇴 시 즉시 파기합니다. 단, 관련 법령에 따라 보존이 필요한 경우
            해당 기간 동안 보관합니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">4. 개인정보의 제3자 제공</h2>
          <p>
            서비스는 이용자의 개인정보를 원칙적으로 제3자에게 제공하지 않습니다.
            단, 법령에 의한 요청이 있는 경우는 예외로 합니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">5. 문의</h2>
          <p>
            개인정보 관련 문의사항은 아래로 연락해주세요.
          </p>
          <p>이메일: admin@114korea.com</p>
        </section>

        <p className="text-xs text-gray-400 mt-8">시행일: 2026년 3월 1일</p>
      </div>
    </div>
  )
}
