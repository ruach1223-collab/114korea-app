'use client'

type ContactButtonsProps = {
  phone: string
  kakao?: string
}

export function ContactButtons({ phone, kakao }: ContactButtonsProps) {
  return (
    <div className="flex gap-3">
      <a
        href={`tel:${phone}`}
        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
        전화하기
      </a>
      {kakao && (
        <a
          href={`https://open.kakao.com/o/${kakao}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-yellow-400 text-yellow-900 rounded-lg font-medium hover:bg-yellow-500 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3C6.5 3 2 6.58 2 11c0 2.84 1.87 5.33 4.68 6.72l-.96 3.57c-.08.3.26.53.52.35L10.2 18.6c.59.08 1.19.12 1.8.12 5.5 0 10-3.58 10-8s-4.5-8-10-8z" />
          </svg>
          카카오톡
        </a>
      )}
    </div>
  )
}
