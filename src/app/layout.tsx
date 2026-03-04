import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { AuthProvider } from '@/features/auth/components/AuthProvider'
import './globals.css'

const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'K114 - 외국인 근로자 구인구직',
    template: '%s | K114',
  },
  description: '검증된 아웃소싱 업체의 안전한 일자리를 찾아보세요. 지역별, 업종별, 비자별 구인정보를 무료로 제공합니다.',
  keywords: '외국인 구인구직, k114, 외국인 근로자, 아웃소싱, 구인, 구직, 일자리, E-9, F-4, H-2, 비자',
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: 'K114',
    title: 'K114 - 외국인 근로자 구인구직',
    description: '검증된 아웃소싱 업체의 안전한 일자리를 찾아보세요.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className={`${geist.variable} font-sans antialiased bg-gray-50 min-h-screen flex flex-col`}>
        <AuthProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}
