const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Types
export interface User {
  id: string
  email: string
  role?: string
  phone?: string
  experienceLevel?: 'STUDENT' | 'FRESHER' | 'INTERNSHIP_ONLY' | 'ZERO_TO_ONE_YEAR' | 'ONE_TO_THREE_YEARS' | 'THREE_TO_FIVE_YEARS' | 'FIVE_PLUS_YEARS' | 'THREE_PLUS_YEARS'
  profileCompleted: boolean
  // Flat structure from API
  firstName?: string
  lastName?: string
  bio?: string
  skills?: string[]
  experience?: string
  education?: string
  location?: string
  website?: string
  linkedin?: string
  github?: string
  profilePicture?: string
  resume?: string
  // Employer fields
  companyName?: string
  companyDescription?: string
  companyLogo?: string
  companyWebsite?: string
  companySize?: string
  industry?: string
  // Legacy nested structure for backward compatibility
  profile?: UserProfile
  createdAt: string
  updatedAt: string
}

export interface UserProfile {
  id?: string
  userId?: string
  firstName?: string
  lastName?: string
  phone?: string
  bio?: string
  skills?: string[]
  experience?: string
  education?: string
  location?: string
  website?: string
  linkedin?: string
  github?: string
  resume?: string
  profilePicture?: string
  resumeUrl?: string
  profilePictureUrl?: string
  createdAt?: string
  updatedAt?: string
}

export interface Job {
  id: string
  title: string
  slug: string
  description: string
  requirements?: string[]
  responsibilities?: string[]
  category: string
  location: string
  workLocationType?: 'ONSITE' | 'REMOTE' | 'HYBRID'
  jobType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP'
  experienceLevel: 'STUDENT' | 'FRESHER' | 'INTERNSHIP_ONLY' | 'ZERO_TO_ONE_YEAR' | 'ONE_TO_THREE_YEARS' | 'THREE_TO_FIVE_YEARS' | 'FIVE_PLUS_YEARS' | 'THREE_PLUS_YEARS'
  salaryMin?: number
  salaryMax?: number
  salaryNegotiable?: boolean
  currency?: string
  companyName: string
  companySlug?: string
  companyLogo?: string
  companyWebsite?: string
  isFeatured?: boolean
  isActive?: boolean
  applicationDeadline?: string
  createdAt: string
  updatedAt?: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  content?: string
  excerpt?: string
  featuredImage?: string
  author?: string
  published?: boolean
  publishedAt?: string
  createdAt: string
  updatedAt?: string
}

export interface JobApplication {
  id: string
  jobId: string
  userId: string
  status: 'PENDING' | 'REVIEWED' | 'SHORTLISTED' | 'ACCEPTED' | 'REJECTED' | 'HIRED'
  message?: string
  coverLetter?: string // For backward compatibility
  job: Job
  createdAt: string
  updatedAt: string
}

export interface StatusHistoryEntry {
  id: string
  oldStatus: string
  newStatus: string
  changedBy: string | null
  changedAt: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface JobsResponse {
  jobs: Job[]
  pagination: PaginationInfo
}

export interface BlogsResponse {
  blogs: BlogPost[]
  pagination: PaginationInfo
}

export interface CompanyProfile {
  id: string
  companyName: string
  companySlug?: string
  companyDescription?: string
  companyLogo?: string
  companyWebsite?: string
  companySize?: string
  industry?: string
  location?: string
}

export interface CompanyProfileResponse {
  company: CompanyProfile
  jobs: Job[]
  totalJobs: number
}

export interface JobFilters {
  search?: string
  category?: string
  location?: string
  workLocationType?: string
  jobType?: string
  experienceLevel?: string
  salaryMin?: number
  salaryMax?: number
}

// ── Shared status enums (mirror Prisma) ───────────────────────
export type JobStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'RESUBMITTED'
export type ApplicationStatus = 'PENDING' | 'REVIEWED' | 'SHORTLISTED' | 'ACCEPTED' | 'REJECTED' | 'HIRED'
export type SubscriptionStatus = 'PENDING' | 'TRIALING' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED'

// Generic `{ data, pagination }` envelope returned by employer/admin list endpoints
export interface PaginatedData<T> {
  data: T[]
  pagination: PaginationInfo
}

// ── Employer: jobs ────────────────────────────────────────────
export interface EmployerJob extends Job {
  status: JobStatus
  source?: 'ADMIN' | 'EMPLOYER'
  viewCount?: number
  rejectionReason?: string | null
  postedById?: string | null
  isApproved?: boolean
  _count?: { applications: number }
}

// Payload sent to create/update a job. Salary fields are numbers here
// (the form collects strings and converts before calling the API).
export interface EmployerJobInput {
  title: string
  description: string
  category: string
  location: string
  jobType: string
  workLocationType: string
  experienceLevel: string
  currency?: string
  salaryMin?: number
  salaryMax?: number
  salaryNegotiable?: boolean
  applicationDeadline?: string
  requirements?: string[]
  responsibilities?: string[]
}

export interface EmployerJobsParams {
  page?: number
  limit?: number
  search?: string
  status?: string
}

// ── Employer: applications ────────────────────────────────────
export interface EmployerApplicant {
  id: string
  firstName?: string
  lastName?: string
  email: string
  profilePicture?: string
  resume?: string
  skills?: string[]
  experience?: string
  education?: string
  location?: string
  linkedin?: string
  github?: string
  website?: string
}

export interface EmployerApplication {
  id: string
  message?: string
  status: ApplicationStatus
  appliedAt: string
  updatedAt: string
  userId: string
  jobId: string
  user: EmployerApplicant
}

export interface EmployerApplicationsParams {
  page?: number
  limit?: number
  status?: string
}

// ── Employer: dashboard ───────────────────────────────────────
export interface EmployerRecentApplicant {
  id: string
  applicantName: string
  applicantAvatar?: string | null
  jobTitle: string
  jobSlug: string
  status: ApplicationStatus
  appliedAt: string
}

export interface EmployerApplicationBreakdown {
  status: ApplicationStatus
  _count: { id: number }
}

export interface EmployerDashboardStats {
  totalJobs: number
  activeJobs: number
  pendingJobs: number
  rejectedJobs: number
  totalApplications: number
  jobsExpiringSoon: number
  totalViews: number
  applicationRate: number
  applicationBreakdown: EmployerApplicationBreakdown[]
  recentApplicants: EmployerRecentApplicant[]
}

// ── Employer: profile ─────────────────────────────────────────
export interface EmployerProfileInput {
  companyName?: string
  companyDescription?: string
  companyWebsite?: string
  companySize?: string
  industry?: string
  companyLogo?: string
}

// ── Subscription plans ────────────────────────────────────────
export interface SubscriptionPlan {
  id: string
  name: string
  slug: string
  description?: string | null
  price: number
  duration: 'MONTHLY' | 'YEARLY'
  features: string[]
  jobLimit: number | null
  featuredJobLimit: number | null
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface SubscriptionUsage {
  jobLimit: number | null
  jobsUsed: number
  jobsRemaining: number | null
  featuredJobLimit: number | null
  featuredUsed: number
  featuredRemaining: number | null
  features: string[]
}

export interface EmployerSubscription {
  id: string
  employerId: string
  planId: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  currentPeriodStart: string
  currentPeriodEnd: string
  trialEndsAt?: string | null
  autoRenew: boolean
  cancelledAt?: string | null
  createdAt: string
  updatedAt: string
  usage?: SubscriptionUsage
}

export interface EmployerSubscriptionResponse {
  subscribed: boolean
  subscription?: EmployerSubscription
}

// API Client Class
class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    // Initialize token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }
  }

  getToken(): string | null {
    return this.token
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: response.status === 404 ? 'Resource not found' : 'Network error',
          status: response.status
        }))

        const error = new Error(errorData.message || `HTTP ${response.status}`)
        ;(error as any).status = response.status
        ;(error as any).code = errorData.code
        throw error
      }

      return response.json()
    } catch (error) {
      // Handle network errors
      if (error instanceof TypeError || !navigator.onLine) {
        const networkError = new Error('Network error. Please check your internet connection.')
        ;(networkError as any).status = 0
        throw networkError
      }
      throw error
    }
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async register(data: {
    fullName: string
    email: string
    password: string
    phone?: string
    experienceLevel?: string
  }): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async employerRegister(data: {
    fullName: string
    email: string
    password: string
    phone?: string
    companyName: string
    companyDescription?: string
    companyWebsite?: string
    companySize?: string
    industry?: string
  }): Promise<any> {
    return this.request<any>('/auth/employer/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getProfile(): Promise<User> {
    const response = await this.request<{ user: User }>('/auth/me')
    return response.user
  }

  async updateProfile(data: Partial<UserProfile>): Promise<{ user: User; message: string }> {
    return this.request<{ user: User; message: string }>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // Jobs endpoints
  async getJobs(
    filters: JobFilters = {},
    page = 1,
    limit = 12
  ): Promise<JobsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== undefined && value !== '')
      ),
    })

    return this.request<JobsResponse>(`/jobs?${params}`)
  }

  async getJob(slug: string): Promise<{ job: Job; hasApplied: boolean }> {
    return this.request<{ job: Job; hasApplied: boolean }>(`/jobs/${slug}`)
  }

  async getFeaturedJobs(): Promise<Job[]> {
    try {
      const result = await this.request<{ jobs: Job[] }>('/jobs/featured')
      return Array.isArray(result.jobs) ? result.jobs : []
    } catch (error) {
      console.warn('Failed to fetch featured jobs:', error)
      return []
    }
  }

  async applyToJob(jobId: string, coverLetter?: string): Promise<{ application: JobApplication; message: string }> {
    return this.request<{ application: JobApplication; message: string }>(`/jobs/${jobId}/apply`, {
      method: 'POST',
      body: JSON.stringify({ message: coverLetter }),
    })
  }

  async getMyApplications(): Promise<{ applications: JobApplication[]; pagination: PaginationInfo }> {
    return this.request<{ applications: JobApplication[]; pagination: PaginationInfo }>('/user/applications')
  }

  async getApplicationHistory(applicationId: string): Promise<{ history: StatusHistoryEntry[] }> {
    return this.request<{ history: StatusHistoryEntry[] }>(`/user/applications/${applicationId}/history`)
  }

  async getJobCategories(): Promise<{ categories: string[]; total: number }> {
    return this.request<{ categories: string[]; total: number }>('/jobs/categories')
  }

  // Employer endpoints
  async getEmployerDashboard(): Promise<EmployerDashboardStats> {
    return this.request<EmployerDashboardStats>('/employer/dashboard/stats')
  }

  async getEmployerJobs(params: EmployerJobsParams = {}): Promise<PaginatedData<EmployerJob>> {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value))
      }
    })
    return this.request<PaginatedData<EmployerJob>>(`/employer/jobs?${searchParams}`)
  }

  async createEmployerJob(data: EmployerJobInput): Promise<{ message: string; job: EmployerJob }> {
    return this.request<{ message: string; job: EmployerJob }>('/employer/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getEmployerJob(id: string): Promise<{ job: EmployerJob }> {
    return this.request<{ job: EmployerJob }>(`/employer/jobs/${id}`)
  }

  async updateEmployerJob(id: string, data: Partial<EmployerJobInput>): Promise<{ message: string; job: EmployerJob }> {
    return this.request<{ message: string; job: EmployerJob }>(`/employer/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteEmployerJob(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/employer/jobs/${id}`, {
      method: 'DELETE',
    })
  }

  async getEmployerApplications(jobId: string, params: EmployerApplicationsParams = {}): Promise<PaginatedData<EmployerApplication>> {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value))
      }
    })
    return this.request<PaginatedData<EmployerApplication>>(`/employer/jobs/${jobId}/applications?${searchParams}`)
  }

  async updateEmployerApplicationStatus(applicationId: string, status: ApplicationStatus): Promise<{ message: string; application: EmployerApplication }> {
    return this.request<{ message: string; application: EmployerApplication }>(`/employer/applications/${applicationId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
  }

  async updateEmployerProfile(data: EmployerProfileInput): Promise<{ message: string; user: User }> {
    return this.request<{ message: string; user: User }>('/employer/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // Company endpoints
  // Subscription / Plan endpoints
  async getEmployerPlans(): Promise<SubscriptionPlan[]> {
    return this.request<SubscriptionPlan[]>('/employer/plans')
  }

  async subscribeToPlan(planId: string): Promise<{ message: string; sub: EmployerSubscription }> {
    return this.request<{ message: string; sub: EmployerSubscription }>('/employer/subscribe', {
      method: 'POST',
      body: JSON.stringify({ planId }),
    })
  }

  async getEmployerSubscription(): Promise<EmployerSubscriptionResponse> {
    return this.request<EmployerSubscriptionResponse>('/employer/subscription')
  }

  async toggleEmployerJobFeatured(jobId: string): Promise<{ message: string; job: EmployerJob }> {
    return this.request<{ message: string; job: EmployerJob }>(`/employer/jobs/${jobId}/toggle-featured`, {
      method: 'PUT',
    })
  }

  // Company endpoints
  async getCompany(companySlug: string): Promise<CompanyProfileResponse> {
    return this.request<CompanyProfileResponse>(`/companies/${companySlug}`)
  }

  // Blog endpoints
  async getBlogs(page = 1, limit = 10): Promise<BlogsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })

    return this.request<BlogsResponse>(`/blogs?${params}`)
  }

  async getBlog(slug: string): Promise<BlogPost> {
    return this.request<BlogPost>(`/blogs/${slug}`)
  }

  async uploadCompanyLogo(file: File): Promise<{ url: string }> {
    const formData = new FormData()
    formData.append('file', file)
    return this.request<{ url: string }>('/upload/company-logo', {
      method: 'POST',
      body: formData,
      headers: {},
    })
  }

  // File upload
  async uploadFile(file: File, type: 'resume' | 'profile-picture'): Promise<{ url: string }> {
    const formData = new FormData()
    formData.append('file', file)

    const headers: Record<string, string> = {}
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    // Use specific endpoints based on type
    const endpoint = type === 'resume' ? '/upload/resume' : '/upload/profile-picture'

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }))
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    const result = await response.json()

    // Normalize response format - backend returns different field names
    if (type === 'resume') {
      return { url: result.resume }
    } else {
      return { url: result.profilePicture }
    }
  }

  // Contact form
  async submitContactForm(data: {
    name: string
    email: string
    subject: string
    message: string
  }): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Email verification
  async sendVerificationEmail(email: string): Promise<{ message: string; emailSent: boolean }> {
    return this.request<{ message: string; emailSent: boolean }>('/auth/send-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }

  async resendVerificationEmail(email: string): Promise<{ message: string; emailSent: boolean }> {
    return this.sendVerificationEmail(email)
  }

  async verifyEmail(token: string): Promise<{ message: string; user: any; token: string }> {
    return this.request<{ message: string; user: any; token: string }>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    })
  }

  // Password reset
  async forgotPassword(email: string): Promise<{ message: string; emailSent?: boolean }> {
    return this.request<{ message: string; emailSent?: boolean }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }

  async resetPassword(token: string, password: string): Promise<{ message: string; user: any; token: string }> {
    return this.request<{ message: string; user: any; token: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    })
  }
}

// Export singleton instance
export const api = new ApiClient(API_BASE_URL)

// Utility functions
export const formatSalary = (min?: number, max?: number, negotiable?: boolean): string => {
  if (negotiable) return 'Negotiable'
  if (!min && !max) return 'Not specified'
  if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`
  if (min) return `$${min.toLocaleString()}+`
  if (max) return `Up to $${max.toLocaleString()}`
  return 'Not specified'
}

// formatDate lives in '@/lib/utils' — the single canonical date formatter.

export const getJobTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    'FULL_TIME': 'Full Time',
    'PART_TIME': 'Part Time',
    'CONTRACT': 'Contract',
    'INTERNSHIP': 'Internship',
    // Legacy support
    'full-time': 'Full Time',
    'part-time': 'Part Time',
    'contract': 'Contract',
    'freelance': 'Freelance',
    'internship': 'Internship',
  }
  return labels[type] || type
}

export const getExperienceLabel = (level: string): string => {
  const labels: Record<string, string> = {
    'STUDENT': 'Student / Currently Studying',
    'FRESHER': 'Fresher',
    'INTERNSHIP_ONLY': 'Internship Experience Only',
    'ZERO_TO_ONE_YEAR': '0–1 Year',
    'ONE_TO_THREE_YEARS': '1–3 Years',
    'THREE_TO_FIVE_YEARS': '3–5 Years',
    'FIVE_PLUS_YEARS': '5+ Years',
    // Legacy support
    'THREE_PLUS_YEARS': '3+ Years',
    'entry': 'Entry Level',
    'mid': 'Mid Level',
    'senior': 'Senior Level',
    'lead': 'Lead',
    'executive': 'Executive',
  }
  return labels[level] || level
}

export const getWorkTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    'ONSITE': 'On-site',
    'REMOTE': 'Remote',
    'HYBRID': 'Hybrid',
    // Legacy support
    'onsite': 'On-site',
    'remote': 'Remote',
    'hybrid': 'Hybrid',
  }
  return labels[type] || type
}
