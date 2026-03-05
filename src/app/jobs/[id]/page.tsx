export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { JobTagBadge } from '@/components/job/JobTagBadge'
import { VisaBadge } from '@/components/job/VisaBadge'
import { ContactButtons } from '@/components/job/ContactButtons'
import { INDUSTRY_LABELS, WORK_SHIFT_LABELS, formatSalary } from '@/features/jobs/utils/constants'
import { getJobById, getCompanyName, incrementViewCount } from '@/lib/jobs'
import { findCompanyById } from '@/lib/auth'

type PageProps = {
  params: Promise<{ id: string }>
}

// 동적 SEO 메타데이터
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const job = await getJobById(id)

  if (!job || job.status !== 'active') {
    return { title: '공고를 찾을 수 없습니다' }
  }

  const companyName = await getCompanyName(job.company_id)
  const salary = formatSalary(job.salary_type, job.salary_amount)

  return {
    title: job.title,
    description: `${companyName} | ${job.region_city} ${job.region_district} | ${salary} | ${INDUSTRY_LABELS[job.industry]}`,
    openGraph: {
      title: `${job.title} - K114`,
      description: `${companyName} · ${salary} · ${job.region_city}`,
    },
  }
}

export default async function JobDetailPage({ params }: PageProps) {
  const { id } = await params
  const job = await getJobById(id)

  if (!job || job.status !== 'active') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <span className="text-4xl mb-4 block">😢</span>
        <h1 className="text-xl font-bold text-gray-900 mb-2">공고를 찾을 수 없습니다</h1>
        <p className="text-sm text-gray-500 mb-4">삭제되었거나 만료된 공고입니다.</p>
        <Link href="/jobs" className="text-blue-600 hover:underline text-sm">
          ← 채용정보 목록으로
        </Link>
      </div>
    )
  }

  // 조회수 증가 (비동기)
  incrementViewCount(id).catch(() => {})

  const companyName = await getCompanyName(job.company_id)

  // 업체 주소 조회
  const companyInfo = await findCompanyById(job.company_id)
  const companyAddress = companyInfo?.address ?? ''

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* 상단 네비게이션 */}
      <Link href="/jobs" className="text-sm text-gray-500 hover:text-blue-600 mb-4 inline-block">
        ← 목록으로
      </Link>

      {/* 제목 영역 */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          {job.is_vip && <Badge variant="vip">VIP</Badge>}
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">{job.title}</h1>
        </div>
        <p className="text-sm text-gray-500">
          {job.source === 'crawled' ? (
            <>
              <Badge variant="default">외부수집</Badge>
            </>
          ) : (
            <span className="flex items-center gap-1.5 flex-wrap">
              {companyName}
              <span className="mx-0.5">·</span>
              <Badge variant="success">✓ 사업자등록 검증</Badge>
            </span>
          )}
        </p>
      </div>

      {/* 기본정보 카드 */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">💰 급여</p>
            <p className="text-sm font-semibold text-blue-600">
              {formatSalary(job.salary_type, job.salary_amount)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">📍 근무지</p>
            <p className="text-sm font-medium">{job.region_city} {job.region_district}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">⏰ 근무시간</p>
            <p className="text-sm font-medium">{job.work_hours} ({WORK_SHIFT_LABELS[job.work_shift]})</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">📋 업종</p>
            <p className="text-sm font-medium">{INDUSTRY_LABELS[job.industry]}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">🏠 숙소</p>
            <p className="text-sm font-medium">{job.dormitory ? '제공' : '미제공'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">📄 비자</p>
            <div className="flex flex-wrap gap-1">
              {job.visa_types.map((visa) => (
                <VisaBadge key={visa} visa={visa} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 근무조건 태그 */}
      {job.tags.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">근무조건</h2>
          <div className="flex flex-wrap gap-2">
            {job.tags.map((tag) => (
              <JobTagBadge key={tag} tag={tag} />
            ))}
          </div>
        </div>
      )}

      {/* 상세 설명 */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-2">상세 설명</h2>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
            {job.description}
          </pre>
          {job.source === 'crawled' && job.source_url && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <a
                href={job.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                전체 내용은 원문에서 확인 →
              </a>
            </div>
          )}
        </div>
      </div>

      {/* 업체 정보 */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-2">업체 정보</h2>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          {job.source === 'crawled' ? (
            <>
              <div className="flex items-center gap-2 mb-2 text-sm text-amber-700 bg-amber-50 rounded-md px-3 py-2">
                <span>🔗</span>
                <span>이 공고는 외부 사이트에서 수집되었습니다</span>
              </div>
              {companyName && companyName !== 'K114 외부수집' && (
                <p className="text-sm"><span className="text-gray-500">업체명:</span> {companyName}</p>
              )}
            </>
          ) : (
            <>
              <p className="text-sm"><span className="text-gray-500">회사명:</span> {companyName}</p>
              {companyAddress && (
                <p className="text-sm mt-1"><span className="text-gray-500">주소:</span> {companyAddress}</p>
              )}
            </>
          )}
        </div>
      </div>

      {/* 연락 버튼 (하단 고정) - 크롤링 공고는 원문 보기 버튼 */}
      <div className="sticky bottom-0 bg-gray-50 py-4 -mx-4 px-4 border-t border-gray-200">
        {job.source === 'crawled' && job.source_url ? (
          <div className="space-y-2">
            <a
              href={job.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              원문에서 확인하기 ↗
            </a>
            <p className="text-xs text-center text-gray-400">
              연락처와 상세 내용은 원본 사이트에서 확인하세요
            </p>
          </div>
        ) : (
          <ContactButtons phone={job.contact_phone} kakao={job.contact_kakao} />
        )}
      </div>

      {/* 메타 정보 */}
      <div className="text-xs text-gray-400 text-center mt-4 pb-4">
        등록일: {new Date(job.created_at).toLocaleDateString('ko-KR')} ·
        조회: {job.view_count}회 ·
        마감일: {new Date(job.expires_at).toLocaleDateString('ko-KR')}
      </div>
    </div>
  )
}
