/**
 * 114114kr.com 구인공고 크롤러
 *
 * 사용법:
 *   node scripts/crawl-114kr.mjs           # 크롤링 실행
 *   node scripts/crawl-114kr.mjs --inspect  # 페이지 구조 탐색 (디버그용)
 *   node scripts/crawl-114kr.mjs --dry-run  # DB 저장 없이 파싱 결과만 출력
 *
 * 사전 설치: pnpm add -D puppeteer @supabase/supabase-js
 * 환경변수: .env.local에서 NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY 사용
 *
 * 114114kr.com 사이트 구조 (2026-03-04 확인):
 *   - Next.js 기반 (#__next)
 *   - 목록: ul.JobList_listWrap > li.JobList_jobItem > a[href="/jd/{id}"]
 *   - 상세: .JobDetail_articleTitle (제목), .JobDetail_salaryWorkValue (급여/시간)
 *   - 상세: .JobDetail_seekerInfoSection (채용조건), .JobDetail_articleBody (본문)
 */

import puppeteer from 'puppeteer'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// === 설정 ===
const BASE_URL = 'https://114114kr.com'
const BOARD_URL = `${BASE_URL}/board?board_type=0` // 채용정보 탭
const CRAWLED_COMPANY_ID = 'c0000000-0000-4000-a000-000000000000'
const REQUEST_DELAY_MS = 5000
const MAX_PAGES = 5

// === 환경변수 로드 (.env.local에서) ===
const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '..', '.env.local')

function loadEnv() {
  try {
    const content = readFileSync(envPath, 'utf-8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx === -1) continue
      const key = trimmed.slice(0, eqIdx).trim()
      const value = trimmed.slice(eqIdx + 1).trim()
      if (!process.env[key]) process.env[key] = value
    }
  } catch {
    console.error('.env.local 파일을 찾을 수 없습니다.')
    process.exit(1)
  }
}

loadEnv()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase 환경변수가 설정되지 않았습니다.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// === CLI 옵션 ===
const args = process.argv.slice(2)
const isInspect = args.includes('--inspect')
const isDryRun = args.includes('--dry-run')

// === 유틸 ===
function delay(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function log(msg) {
  const time = new Date().toLocaleTimeString('ko-KR')
  console.log(`[${time}] ${msg}`)
}

// === 업종 매핑 (114114kr.com 직종 텍스트 → k114 업종 코드) ===
function mapIndustry(text) {
  const t = text.toLowerCase()
  if (t.includes('생산') || t.includes('제조') || t.includes('공장') || t.includes('반도체') || t.includes('사출')) return 'PRODUCTION'
  if (t.includes('건설') || t.includes('현장') || t.includes('철근') || t.includes('용접') || t.includes('토목')) return 'CONSTRUCTION'
  if (t.includes('물류') || t.includes('운송') || t.includes('택배') || t.includes('배송') || t.includes('운전')) return 'LOGISTICS'
  if (t.includes('식당') || t.includes('외식') || t.includes('주방') || t.includes('음식') || t.includes('조리')) return 'FOOD'
  if (t.includes('매장') || t.includes('판매') || t.includes('마트') || t.includes('편의점') || t.includes('서비스')) return 'RETAIL'
  if (t.includes('사무') || t.includes('영업') || t.includes('경리') || t.includes('회계') || t.includes('통역')) return 'OFFICE'
  if (t.includes('숙박') || t.includes('호텔') || t.includes('청소') || t.includes('모텔') || t.includes('관리')) return 'LODGING'
  if (t.includes('농') || t.includes('축산') || t.includes('어업') || t.includes('농장') || t.includes('원예')) return 'AGRICULTURE'
  return 'PRODUCTION'
}

// === 급여 파싱 ===
function parseSalary(typeText, valueText) {
  const type = (typeText || '').trim()
  const value = (valueText || '').replace(/,/g, '').replace(/원/g, '').trim()
  const amount = parseInt(value, 10) || 0

  if (type.includes('시급')) return { salary_type: 'HOURLY', salary_amount: amount }
  if (type.includes('일급') || type.includes('일당')) return { salary_type: 'DAILY', salary_amount: amount }
  if (type.includes('월급') || type.includes('월')) return { salary_type: 'MONTHLY', salary_amount: amount }

  // 타입 텍스트 없으면 금액 크기로 추정
  if (amount > 500000) return { salary_type: 'MONTHLY', salary_amount: amount }
  if (amount > 50000) return { salary_type: 'DAILY', salary_amount: amount }
  if (amount > 5000) return { salary_type: 'HOURLY', salary_amount: amount }

  return { salary_type: 'NEGOTIABLE', salary_amount: 0 }
}

// === 지역 파싱 ===
function parseRegion(text) {
  const regionMap = {
    '서울': '서울', '경기': '경기', '인천': '인천', '부산': '부산',
    '대구': '대구', '대전': '대전', '광주': '광주', '울산': '울산',
    '세종': '세종', '강원': '강원', '충북': '충북', '충남': '충남',
    '전북': '전북', '전남': '전남', '경북': '경북', '경남': '경남',
    '제주': '제주',
  }

  for (const [key, city] of Object.entries(regionMap)) {
    if (text.includes(key)) {
      const distMatch = text.match(new RegExp(`${key}\\s*([가-힣]+(?:시|군|구))`))
      return { region_city: city, region_district: distMatch?.[1] ?? '' }
    }
  }

  return { region_city: '경기', region_district: '' }
}

// === 비자 추출 ===
function parseVisaTypes(text) {
  const visas = []
  const visaPatterns = ['E-9', 'E-7', 'F-2', 'F-4', 'F-5', 'F-6', 'H-2']
  for (const v of visaPatterns) {
    if (text.includes(v) || text.includes(v.replace('-', ''))) visas.push(v)
  }
  if (visas.length === 0) return ['E-9', 'H-2']
  return visas
}

// === 태그 추출 ===
function parseTags(text) {
  const tags = []
  if (text.includes('숙소') || text.includes('기숙사') || text.includes('기숙')) tags.push('DORMITORY')
  if (text.includes('식사') || text.includes('식대') || text.includes('중식')) tags.push('MEAL')
  if (text.includes('통근') || text.includes('셔틀') || text.includes('버스')) tags.push('SHUTTLE')
  if (text.includes('초보') || text.includes('미경험') || text.includes('경력무관') || text.includes('무관')) tags.push('BEGINNER_OK')
  if (text.includes('즉시') || text.includes('급구')) tags.push('IMMEDIATE')
  if (text.includes('4대보험') || text.includes('보험')) tags.push('INSURANCE')
  if (text.includes('퇴직금')) tags.push('SEVERANCE')
  if (text.includes('잔업') || text.includes('특근') || text.includes('야근')) tags.push('OVERTIME')
  if (text.includes('외국인')) tags.push('FOREIGNER_OK')
  return tags
}

// === 근무 형태 파싱 ===
function parseWorkShift(text) {
  if (text.includes('3교대') || text.includes('3조')) return 'THREE_SHIFT'
  if (text.includes('2교대') || text.includes('교대')) return 'TWO_SHIFT'
  if (text.includes('야간')) return 'NIGHT'
  if (text.includes('탄력') || text.includes('유연')) return 'FLEXIBLE'
  return 'DAY'
}

// === 페이지 구조 탐색 (--inspect 모드) ===
async function inspectPage(page) {
  log('=== 페이지 구조 탐색 모드 ===')
  await page.goto(BOARD_URL, { waitUntil: 'networkidle2', timeout: 30000 })
  await delay(3000)

  const structure = await page.evaluate(() => {
    const result = { title: document.title, url: location.href, bodyChildren: [], lists: [], links: [] }

    result.bodyChildren = Array.from(document.body.children).map((el) => ({
      tag: el.tagName, id: el.id,
      className: (el.className?.slice?.(0, 80)) || '',
      childCount: el.children?.length ?? 0,
    }))

    document.querySelectorAll('[class*="list"], [class*="item"], [class*="card"]').forEach((el, i) => {
      if (i < 5) {
        result.lists.push({
          tag: el.tagName, className: el.className,
          text: el.textContent?.trim().slice(0, 100),
          html: el.innerHTML?.slice(0, 300),
        })
      }
    })

    document.querySelectorAll('a[href*="/jd/"]').forEach((a) => {
      result.links.push({ href: a.getAttribute('href'), text: a.textContent?.trim().slice(0, 50) })
    })

    return result
  })

  console.log(JSON.stringify(structure, null, 2))

  const html = await page.content()
  const { writeFileSync } = await import('fs')
  const outPath = resolve(__dirname, 'inspect-output.html')
  writeFileSync(outPath, html, 'utf-8')
  log(`전체 HTML 저장: ${outPath}`)
}

// === 공고 목록 수집 (실제 셀렉터 사용) ===
async function collectJobLinks(page) {
  log('공고 목록 수집 시작...')
  const allLinks = []

  for (let pageNum = 1; pageNum <= MAX_PAGES; pageNum++) {
    const pageUrl = pageNum === 1 ? BOARD_URL : `${BOARD_URL}&page=${pageNum}`
    log(`페이지 ${pageNum} 로딩: ${pageUrl}`)

    await page.goto(pageUrl, { waitUntil: 'networkidle2', timeout: 30000 })
    await delay(3000)

    const links = await page.evaluate((baseUrl) => {
      const results = []

      // 114114kr.com 실제 셀렉터: a[href^="/jd/"]
      document.querySelectorAll('a[href^="/jd/"]').forEach((a) => {
        const href = a.getAttribute('href')
        if (!href) return
        const fullUrl = `${baseUrl}${href}`

        // 제목 텍스트 (titleText 클래스 또는 링크 자체)
        const titleEl = a.querySelector('[class*="titleText"]') || a.querySelector('[class*="jobCardTitle"]')
        const title = titleEl?.textContent?.trim() || a.textContent?.trim()

        if (title && title.length > 3 && !results.some((r) => r.url === fullUrl)) {
          // 목록에서 지역/급여 미리 수집
          const parent = a.closest('li') || a.closest('[class*="jobCard"]')
          const location = parent?.querySelector('[class*="location"]')?.textContent?.trim() ?? ''
          const salary = parent?.querySelector('[class*="salary"]')?.textContent?.trim() ?? ''

          results.push({ url: fullUrl, title: title.slice(0, 100), location, salary })
        }
      })

      return results
    }, BASE_URL)

    if (links.length === 0) {
      log(`페이지 ${pageNum}: 공고 없음, 수집 종료`)
      break
    }

    log(`페이지 ${pageNum}: ${links.length}개 공고 발견`)
    allLinks.push(...links)
    await delay(REQUEST_DELAY_MS)
  }

  // 중복 제거
  const unique = [...new Map(allLinks.map((l) => [l.url, l])).values()]
  log(`총 ${unique.length}개 고유 공고 링크 수집 완료`)
  return unique
}

// === 공고 상세 파싱 (실제 셀렉터 사용) ===
async function parseJobDetail(page, url) {
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })
    await delay(2000)

    const detail = await page.evaluate(() => {
      // 헬퍼: 특정 셀렉터의 텍스트 추출
      const getText = (sel) => document.querySelector(sel)?.textContent?.trim() ?? ''
      const getTexts = (sel) => Array.from(document.querySelectorAll(sel)).map((el) => el.textContent?.trim())

      // 제목: .JobDetail_articleTitle
      const title = getText('[class*="JobDetail_articleTitle"]')
        || getText('h1')

      // 급여: .JobDetail_salaryWorkItem 내부
      const salaryItems = document.querySelectorAll('[class*="JobDetail_salaryWorkItem"]')
      let salaryType = ''
      let salaryValue = ''
      let workHours = ''

      salaryItems.forEach((item) => {
        const label = item.querySelector('[class*="salaryWorkLabel"]')?.textContent?.trim() ?? ''
        const value = item.querySelector('[class*="salaryWorkValue"]')?.textContent?.trim() ?? ''
        if (label.includes('급') || label.includes('시급') || label.includes('일급') || label.includes('월급')) {
          salaryType = label
          salaryValue = value
        }
        if (label.includes('근무시간') || label.includes('시간')) {
          workHours = value
        }
      })

      // 채용조건 섹션: .JobDetail_seekerInfoSection 내부 라벨-값 쌍
      const info = {}
      document.querySelectorAll('[class*="JobDetail_seekerInfoSection"] [class*="InfoItem"], [class*="JobDetail_seekerInfoSection"] dt, [class*="JobDetail_seekerInfoSection"] dd').forEach((el) => {
        // 라벨-값 구조 추출 시도
      })

      // 라벨-값 쌍 추출 (bodyText에서)
      const bodyText = document.body?.innerText ?? ''

      // 직종 추출
      const jobTypeMatch = bodyText.match(/직종\s*\n?\s*(.+?)(?:\n|$)/)
      const jobType = jobTypeMatch?.[1]?.trim() ?? ''

      // 비자 추출
      const visaMatch = bodyText.match(/비자\s*\n?\s*(.+?)(?:\n|$)/)
      const visaText = visaMatch?.[1]?.trim() ?? ''

      // 지역 추출
      const regionMatch = bodyText.match(/지역\s*\n?\s*(.+?)(?:\n|$)/)
      const regionText = regionMatch?.[1]?.trim() ?? ''

      // 상세 내용: .JobDetail_articleBody 또는 본문 영역
      const descEl = document.querySelector('[class*="JobDetail_articleBody"]')
        || document.querySelector('[class*="articleContent"]')
        || document.querySelector('[class*="JobDetail_contentSection"]')
      let description = descEl?.innerText?.trim() ?? ''

      // 상세 내용이 없으면 "상세 내용" 이후 텍스트 추출
      if (!description) {
        const descIdx = bodyText.indexOf('상세 내용')
        const endIdx = bodyText.indexOf('채용담당자')
        if (descIdx !== -1) {
          description = bodyText.slice(descIdx + 5, endIdx !== -1 ? endIdx : descIdx + 1500).trim()
        }
      }

      // 연락처
      const phoneMatch = bodyText.match(/(?:010|011|02|031|032|033|041|042|043|044|051|052|053|054|055|061|062|063|064)[-.\s]?\d{3,4}[-.\s]?\d{4}/)
      const phone = phoneMatch?.[0] ?? ''

      // 업체명
      const companyMatch = bodyText.match(/업체명\s*\n?\s*(.+?)(?:\n|$)/)
      const companyName = companyMatch?.[1]?.trim() ?? ''

      return {
        title,
        salaryType,
        salaryValue,
        workHours,
        jobType,
        visaText,
        regionText,
        description: description.slice(0, 2000),
        phone,
        companyName,
        bodyText: bodyText.slice(0, 3000),
      }
    })

    return detail
  } catch (err) {
    log(`상세 페이지 파싱 실패: ${url} - ${err.message}`)
    return null
  }
}

// === k114 스키마로 변환 ===
function toJobRecord(detail, sourceUrl) {
  const fullText = `${detail.title} ${detail.description} ${detail.bodyText}`

  const title = detail.title || '구인공고'
  const industry = mapIndustry(detail.jobType || fullText)
  const { region_city, region_district } = parseRegion(detail.regionText || fullText)
  const { salary_type, salary_amount } = parseSalary(detail.salaryType, detail.salaryValue)
  const workHours = detail.workHours || '08:00~17:00'
  const work_shift = parseWorkShift(workHours + ' ' + fullText)
  const description = detail.description || ''
  const visa_types = parseVisaTypes(detail.visaText || fullText)
  const tags = parseTags(fullText)
  const dormitory = fullText.includes('숙소') || fullText.includes('기숙사')

  return {
    company_id: CRAWLED_COMPANY_ID,
    title: title.slice(0, 200),
    industry,
    region_city,
    region_district,
    salary_type,
    salary_amount,
    work_hours: workHours.slice(0, 50),
    work_shift,
    visa_types,
    tags,
    dormitory,
    description: description.slice(0, 2000),
    contact_phone: detail.phone || '',
    contact_kakao: '',
    is_vip: false,
    status: 'active',
    view_count: 0,
    source: 'crawled',
    source_url: sourceUrl,
    expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
  }
}

// === Supabase에 저장 ===
async function saveToSupabase(record) {
  const { data: existing } = await supabase
    .from('jobs')
    .select('id')
    .eq('source_url', record.source_url)
    .limit(1)

  if (existing && existing.length > 0) {
    return { skipped: true, id: existing[0].id }
  }

  const { data, error } = await supabase
    .from('jobs')
    .insert(record)
    .select('id')
    .single()

  if (error) {
    log(`DB 저장 실패: ${error.message}`)
    return { skipped: false, error: error.message }
  }

  return { skipped: false, id: data?.id }
}

// === 메인 실행 ===
async function main() {
  log('114114kr.com 크롤러 시작')

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const page = await browser.newPage()
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
  await page.setViewport({ width: 1280, height: 800 })

  try {
    if (isInspect) {
      await inspectPage(page)
      await browser.close()
      return
    }

    // 1. 공고 목록 수집
    const jobLinks = await collectJobLinks(page)

    if (jobLinks.length === 0) {
      log('수집된 공고가 없습니다. --inspect 모드로 페이지 구조를 확인하세요.')
      await browser.close()
      return
    }

    // 2. 각 공고 상세 파싱 + 저장
    let saved = 0
    let skipped = 0
    let failed = 0

    for (let i = 0; i < jobLinks.length; i++) {
      const link = jobLinks[i]
      log(`[${i + 1}/${jobLinks.length}] ${link.title?.slice(0, 40)}...`)

      const detail = await parseJobDetail(page, link.url)
      if (!detail || !detail.title) {
        log('  → 파싱 실패, 스킵')
        failed++
        await delay(REQUEST_DELAY_MS)
        continue
      }

      const record = toJobRecord(detail, link.url)

      if (isDryRun) {
        console.log('\n--- 파싱 결과 ---')
        console.log(JSON.stringify(record, null, 2))
        saved++
      } else {
        const result = await saveToSupabase(record)
        if (result.skipped) {
          log('  → 이미 존재 (스킵)')
          skipped++
        } else if (result.error) {
          log(`  → 저장 실패: ${result.error}`)
          failed++
        } else {
          log(`  → 저장 완료 (ID: ${result.id})`)
          saved++
        }
      }

      await delay(REQUEST_DELAY_MS)
    }

    log('\n=== 크롤링 완료 ===')
    log(`저장: ${saved}건 | 중복 스킵: ${skipped}건 | 실패: ${failed}건`)

  } catch (err) {
    log(`크롤러 오류: ${err.message}`)
    console.error(err)
  } finally {
    await browser.close()
  }
}

main()
