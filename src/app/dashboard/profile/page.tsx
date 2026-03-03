'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/features/auth/store/authStore'
import type { Company } from '@/types/job'

export default function ProfilePage() {
  const router = useRouter()
  const { setUser } = useAuthStore()
  const [profile, setProfile] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  // 폼 상태
  const [companyName, setCompanyName] = useState('')
  const [repName, setRepName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')

  useEffect(() => {
    fetch('/api/dashboard/profile')
      .then((res) => res.json())
      .then((data) => {
        if (data.profile) {
          setProfile(data.profile)
          setCompanyName(data.profile.company_name)
          setRepName(data.profile.rep_name)
          setPhone(data.profile.phone)
          setAddress(data.profile.address)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      const res = await fetch('/api/dashboard/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: companyName,
          rep_name: repName,
          phone,
          address,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessage('프로필이 수정되었습니다')
        // 쿠키 업데이트됐으므로 auth 상태도 갱신
        const meRes = await fetch('/api/auth/me')
        if (meRes.ok) {
          const meData = await meRes.json()
          setUser(meData.user)
        }
      } else {
        setMessage(data.message || '수정에 실패했습니다')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500">프로필 정보를 불러올 수 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <button
        onClick={() => router.push('/dashboard')}
        className="text-sm text-gray-500 hover:text-blue-600 mb-4 inline-block"
      >
        ← 대시보드
      </button>

      <h1 className="text-xl font-bold text-gray-900 mb-6">업체 프로필</h1>

      <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
        {message && (
          <div className={`p-3 rounded-lg text-sm ${
            message.includes('실패') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
          }`}>
            {message}
          </div>
        )}

        {/* 수정 불가 필드 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
          <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500">
            {profile.email}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">사업자등록번호</label>
          <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500">
            {profile.biz_number}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">승인 상태</label>
          <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
            profile.status === 'approved'
              ? 'bg-green-100 text-green-700'
              : profile.status === 'pending'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
          }`}>
            {profile.status === 'approved' ? '승인완료' : profile.status === 'pending' ? '승인대기' : '거부됨'}
          </span>
        </div>

        {/* 수정 가능 필드 */}
        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm font-medium text-gray-700 mb-4">수정 가능 정보</p>
        </div>

        <Input
          label="회사명"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />

        <Input
          label="대표자명"
          value={repName}
          onChange={(e) => setRepName(e.target.value)}
        />

        <Input
          label="연락처"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <Input
          label="주소"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <Button onClick={handleSave} loading={saving} className="w-full">
          프로필 저장
        </Button>
      </div>
    </div>
  )
}
