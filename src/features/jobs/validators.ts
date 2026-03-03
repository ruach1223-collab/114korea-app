import { z } from 'zod'

export const jobFormSchema = z.object({
  title: z.string()
    .min(1, '공고 제목을 입력해주세요')
    .max(100, '100자 이내로 입력해주세요'),
  industry: z.string().min(1, '업종을 선택해주세요'),
  region_city: z.string().min(1, '지역(시/도)을 선택해주세요'),
  region_district: z.string(),
  salary_type: z.string().min(1, '급여 유형을 선택해주세요'),
  salary_amount: z.number().min(0),
  work_hours: z.string().min(1, '근무시간을 입력해주세요'),
  work_shift: z.string().min(1, '근무형태를 선택해주세요'),
  visa_types: z.array(z.string()).min(1, '비자 유형을 1개 이상 선택해주세요'),
  tags: z.array(z.string()),
  dormitory: z.boolean(),
  description: z.string()
    .min(10, '상세 설명을 10자 이상 입력해주세요')
    .max(3000, '3000자 이내로 입력해주세요'),
  contact_phone: z.string()
    .regex(/^[\d-]+$/, '올바른 전화번호를 입력해주세요'),
  contact_kakao: z.string(),
})

export type JobFormData = z.infer<typeof jobFormSchema>
