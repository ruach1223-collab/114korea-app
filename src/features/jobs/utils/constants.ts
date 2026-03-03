import type { Industry, SalaryType, WorkShift, VisaType, JobTag } from '@/types/job'

// === 업종 라벨 ===
export const INDUSTRY_LABELS: Record<Industry, string> = {
  PRODUCTION: '생산/제조',
  CONSTRUCTION: '건설/현장',
  LOGISTICS: '물류/운송',
  FOOD: '외식/식당',
  RETAIL: '매장/판매',
  OFFICE: '사무/영업',
  LODGING: '숙박/청소',
  AGRICULTURE: '농축산/어업',
}

export const INDUSTRY_ICONS: Record<Industry, string> = {
  PRODUCTION: '🏭',
  CONSTRUCTION: '🏗️',
  LOGISTICS: '🚚',
  FOOD: '🍳',
  RETAIL: '🏪',
  OFFICE: '💼',
  LODGING: '🏨',
  AGRICULTURE: '🌾',
}

// === 급여 유형 라벨 ===
export const SALARY_TYPE_LABELS: Record<SalaryType, string> = {
  HOURLY: '시급',
  DAILY: '일급',
  MONTHLY: '월급',
  NEGOTIABLE: '협의',
}

// === 근무 형태 라벨 ===
export const WORK_SHIFT_LABELS: Record<WorkShift, string> = {
  DAY: '주간',
  NIGHT: '야간',
  TWO_SHIFT: '2교대',
  THREE_SHIFT: '3교대',
  FLEXIBLE: '탄력근무',
}

// === 비자 유형 라벨 ===
export const VISA_TYPE_LABELS: Record<VisaType, string> = {
  'E-9': 'E-9 (비전문취업)',
  'E-7': 'E-7 (특정활동)',
  'F-2': 'F-2 (거주)',
  'F-4': 'F-4 (재외동포)',
  'F-5': 'F-5 (영주)',
  'F-6': 'F-6 (결혼이민)',
  'H-2': 'H-2 (방문취업)',
}

// === 근무조건 태그 라벨 ===
export const JOB_TAG_LABELS: Record<JobTag, string> = {
  DORMITORY: '숙소제공',
  MEAL: '식사제공',
  SHUTTLE: '통근버스',
  BEGINNER_OK: '초보가능',
  IMMEDIATE: '즉시출근',
  WEEKLY_PAY: '주급가능',
  DAILY_PAY: '당일지급',
  NIGHT_BONUS: '야간수당',
  INSURANCE: '4대보험',
  SEVERANCE: '퇴직금',
  OVERTIME: '잔업많음',
  FOREIGNER_OK: '외국인가능',
  NO_KOREAN: '한국어불필요',
  COUPLE_OK: '부부가능',
  VEHICLE: '차량지원',
}

// === 지역 (시/도) ===
export const REGION_CITIES = [
  '서울', '경기', '인천', '부산', '대구',
  '대전', '광주', '울산', '세종',
  '강원', '충북', '충남', '전북', '전남',
  '경북', '경남', '제주',
] as const

// === 지역 (시/군/구) 주요 목록 ===
export const REGION_DISTRICTS: Record<string, string[]> = {
  서울: ['강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'],
  경기: ['수원시', '성남시', '고양시', '용인시', '부천시', '안산시', '안양시', '남양주시', '화성시', '평택시', '의정부시', '시흥시', '파주시', '김포시', '광명시', '광주시', '군포시', '이천시', '양주시', '오산시', '구리시', '안성시', '포천시', '의왕시', '하남시', '여주시', '동두천시', '과천시'],
  인천: ['중구', '동구', '미추홀구', '연수구', '남동구', '부평구', '계양구', '서구', '강화군', '옹진군'],
  부산: ['중구', '서구', '동구', '영도구', '부산진구', '동래구', '남구', '북구', '해운대구', '사하구', '금정구', '강서구', '연제구', '수영구', '사상구', '기장군'],
  대구: ['중구', '동구', '서구', '남구', '북구', '수성구', '달서구', '달성군'],
  대전: ['동구', '중구', '서구', '유성구', '대덕구'],
  광주: ['동구', '서구', '남구', '북구', '광산구'],
  울산: ['중구', '남구', '동구', '북구', '울주군'],
  세종: ['세종시'],
  강원: ['춘천시', '원주시', '강릉시', '동해시', '태백시', '속초시', '삼척시'],
  충북: ['청주시', '충주시', '제천시', '음성군', '진천군', '괴산군', '증평군'],
  충남: ['천안시', '공주시', '보령시', '아산시', '서산시', '논산시', '계룡시', '당진시'],
  전북: ['전주시', '군산시', '익산시', '정읍시', '남원시', '김제시'],
  전남: ['목포시', '여수시', '순천시', '나주시', '광양시'],
  경북: ['포항시', '경주시', '김천시', '안동시', '구미시', '영주시', '영천시', '상주시'],
  경남: ['창원시', '진주시', '통영시', '사천시', '김해시', '밀양시', '거제시', '양산시'],
  제주: ['제주시', '서귀포시'],
}

// === 급여 포맷 ===
export function formatSalary(type: SalaryType, amount: number): string {
  if (type === 'NEGOTIABLE') return '급여 협의'
  const label = SALARY_TYPE_LABELS[type]
  if (amount >= 10000) {
    const man = Math.floor(amount / 10000)
    const remainder = amount % 10000
    if (remainder === 0) return `${label} ${man}만원`
    return `${label} ${man}만 ${remainder.toLocaleString()}원`
  }
  return `${label} ${amount.toLocaleString()}원`
}

// === 날짜 포맷 ===
export function formatTimeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`
  if (hours < 24) return `${hours}시간 전`
  if (days < 7) return `${days}일 전`
  return date.toLocaleDateString('ko-KR')
}
