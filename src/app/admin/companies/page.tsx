'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import type { Company, CompanyStatus } from '@/types/job'

const STATUS_LABELS: Record<CompanyStatus, string> = {
  pending: '승인 대기',
  approved: '승인 완료',
  rejected: '거부됨',
}

const STATUS_COLORS: Record<CompanyStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
}

export default function AdminCompaniesPage() {
  const searchParams = useSearchParams()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState(searchParams.get('status') || '')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchCompanies = useCallback(async () => {
    setLoading(true)
    const params = filter ? `?status=${filter}` : ''
    const res = await fetch(`/api/admin/companies${params}`)
    const data = await res.json()
    setCompanies(data.data ?? [])
    setLoading(false)
  }, [filter])

  useEffect(() => {
    fetchCompanies()
  }, [fetchCompanies])

  const handleStatusChange = async (companyId: string, newStatus: CompanyStatus) => {
    setActionLoading(companyId)
    try {
      const res = await fetch(`/api/admin/companies/${companyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        await fetchCompanies()
      }
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div>
      {/* 필터 */}
      <div className="flex gap-2 mb-4">
        {(['', 'pending', 'approved', 'rejected'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {status === '' ? '전체' : STATUS_LABELS[status]}
          </button>
        ))}
      </div>

      {/* 업체 목록 */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : companies.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <span className="text-3xl block mb-2">🏢</span>
          <p>업체가 없습니다</p>
        </div>
      ) : (
        <div className="space-y-3">
          {companies.map((company) => (
            <div
              key={company.id}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{company.company_name}</h3>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_COLORS[company.status]}`}>
                      {STATUS_LABELS[company.status]}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 space-y-0.5">
                    <p>대표: {company.rep_name} | 사업자번호: {company.biz_number}</p>
                    <p>이메일: {company.email} | 연락처: {company.phone}</p>
                    <p>주소: {company.address}</p>
                    <p className="text-xs text-gray-400">
                      가입일: {new Date(company.created_at).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex gap-2 ml-4 shrink-0">
                  {company.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(company.id, 'approved')}
                        loading={actionLoading === company.id}
                      >
                        승인
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleStatusChange(company.id, 'rejected')}
                        loading={actionLoading === company.id}
                      >
                        거부
                      </Button>
                    </>
                  )}
                  {company.status === 'approved' && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleStatusChange(company.id, 'rejected')}
                      loading={actionLoading === company.id}
                    >
                      정지
                    </Button>
                  )}
                  {company.status === 'rejected' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(company.id, 'approved')}
                      loading={actionLoading === company.id}
                    >
                      재승인
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
