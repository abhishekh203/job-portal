/**
 * Shared job form schema (create + edit).
 *
 * Mirrors the backend `createEmployerJobSchema` so client and server validation
 * agree. Salary fields are strings here (that's what the number inputs produce);
 * `toEmployerJobInput` converts them to the numeric API payload at submit time.
 */
import { z } from 'zod'
import type { EmployerJobInput } from '@/lib/api'

export const JOB_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'] as const
export const WORK_TYPES = ['ONSITE', 'REMOTE', 'HYBRID'] as const
export const EXPERIENCE_LEVELS = [
  { value: 'STUDENT', label: 'Student' },
  { value: 'FRESHER', label: 'Fresher' },
  { value: 'INTERNSHIP_ONLY', label: 'Internship Only' },
  { value: 'ZERO_TO_ONE_YEAR', label: '0-1 Year' },
  { value: 'ONE_TO_THREE_YEARS', label: '1-3 Years' },
  { value: 'THREE_TO_FIVE_YEARS', label: '3-5 Years' },
  { value: 'FIVE_PLUS_YEARS', label: '5+ Years' },
] as const

export const jobFormSchema = z
  .object({
    title: z.string().trim().min(1, 'Job title is required'),
    description: z.string().trim().min(1, 'Job description is required'),
    category: z.string().min(1, 'Please select a category'),
    location: z.string().trim().min(1, 'Location is required'),
    jobType: z.enum(JOB_TYPES),
    workLocationType: z.enum(WORK_TYPES),
    experienceLevel: z.string().min(1, 'Please select an experience level'),
    // Strings because they come from <input type="number">; converted on submit.
    salaryMin: z.string().optional(),
    salaryMax: z.string().optional(),
    salaryNegotiable: z.boolean(),
    currency: z.string().trim().min(1, 'Currency is required'),
    applicationDeadline: z.string().optional(),
  })
  .refine(
    (v) => !v.salaryMin || !v.salaryMax || Number(v.salaryMax) >= Number(v.salaryMin),
    { path: ['salaryMax'], message: 'Maximum must be greater than or equal to minimum' }
  )

export type JobFormValues = z.infer<typeof jobFormSchema>

export const jobFormDefaults: JobFormValues = {
  title: '',
  description: '',
  category: '',
  location: '',
  jobType: 'FULL_TIME',
  workLocationType: 'ONSITE',
  experienceLevel: '',
  salaryMin: '',
  salaryMax: '',
  salaryNegotiable: false,
  currency: 'NPR',
  applicationDeadline: '',
}

/** Map validated form values to the API payload (string salaries -> numbers, empty -> undefined). */
export function toEmployerJobInput(values: JobFormValues): EmployerJobInput {
  return {
    title: values.title,
    description: values.description,
    category: values.category,
    location: values.location,
    jobType: values.jobType,
    workLocationType: values.workLocationType,
    experienceLevel: values.experienceLevel,
    currency: values.currency,
    salaryMin: values.salaryMin ? parseInt(values.salaryMin, 10) : undefined,
    salaryMax: values.salaryMax ? parseInt(values.salaryMax, 10) : undefined,
    salaryNegotiable: values.salaryNegotiable,
    applicationDeadline: values.applicationDeadline || undefined,
  }
}
