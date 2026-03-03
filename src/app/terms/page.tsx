import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '이용약관',
}

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-gray-900 mb-6">이용약관</h1>
      <div className="prose prose-sm text-gray-700 space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-gray-900">제1조 (목적)</h2>
          <p>
            이 약관은 114Korea(이하 &quot;서비스&quot;)가 제공하는 구인구직 정보 서비스의 이용에 관한
            기본 사항을 규정함을 목적으로 합니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">제2조 (서비스 내용)</h2>
          <p>서비스는 다음의 내용을 제공합니다:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>검증된 아웃소싱 업체의 구인정보 제공</li>
            <li>외국인 근로자를 위한 구직정보 열람</li>
            <li>업체 회원 가입 및 구인공고 등록</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">제3조 (회원가입)</h2>
          <p>
            업체 회원가입 시 사업자등록번호를 제출해야 하며, 관리자 승인 후 서비스를 이용할 수 있습니다.
            허위 정보 제출 시 서비스 이용이 제한될 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">제4조 (구인공고 등록)</h2>
          <p>
            하루 2건의 무료 공고를 등록할 수 있습니다. VIP 상위노출 서비스는 유료로 제공됩니다.
            불법적인 구인정보는 즉시 삭제되며, 반복 시 계정이 정지됩니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">제5조 (면책조항)</h2>
          <p>
            서비스는 업체와 구직자 간의 직접적인 고용 관계에 대해 책임을 지지 않습니다.
            채용 조건 및 근무환경에 대한 최종 확인은 구직자 본인의 책임입니다.
          </p>
        </section>

        <p className="text-xs text-gray-400 mt-8">시행일: 2026년 3월 1일</p>
      </div>
    </div>
  )
}
