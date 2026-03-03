import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력해주세요'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
})

export const registerSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력해주세요'),
  password: z.string()
    .min(8, '비밀번호는 8자 이상이어야 합니다')
    .regex(/[a-zA-Z]/, '영문을 포함해야 합니다')
    .regex(/[0-9]/, '숫자를 포함해야 합니다'),
  password_confirm: z.string(),
  company_name: z.string().min(1, '회사명을 입력해주세요'),
  biz_number: z.string()
    .regex(/^\d{3}-\d{2}-\d{5}$/, '사업자등록번호 형식: 000-00-00000'),
  rep_name: z.string().min(1, '대표자명을 입력해주세요'),
  phone: z.string()
    .regex(/^[\d-]+$/, '올바른 연락처를 입력해주세요'),
  address: z.string().min(1, '주소를 입력해주세요'),
}).refine((data) => data.password === data.password_confirm, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['password_confirm'],
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
