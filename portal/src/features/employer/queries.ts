/**
 * Employer dashboard — TanStack Query foundation.
 *
 * This is the single source of truth for how employer data is read and mutated.
 * Pages must NOT call `api.getEmployerX()` inside `useEffect`; instead:
 *   - reads  → `useQuery(employerXQuery(...))`
 *   - writes → the `useXxx()` mutation hooks below (they invalidate the right keys)
 *
 * Query keys all derive from `employerKeys` so invalidation stays consistent and
 * a mutation can refresh exactly what changed via prefix matching.
 */
import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  api,
  type ApplicationStatus,
  type EmployerApplicationsParams,
  type EmployerJobInput,
  type EmployerJobsParams,
  type EmployerProfileInput,
} from '@/lib/api'

// ── Query-key factory ─────────────────────────────────────────
// Hierarchical so a broad key invalidates everything beneath it
// (e.g. invalidating `jobs()` refreshes every list + detail + applications).
export const employerKeys = {
  all: ['employer'] as const,
  dashboard: () => [...employerKeys.all, 'dashboard'] as const,
  jobs: () => [...employerKeys.all, 'jobs'] as const,
  jobList: (params: EmployerJobsParams = {}) => [...employerKeys.jobs(), 'list', params] as const,
  jobDetail: (id: string) => [...employerKeys.jobs(), 'detail', id] as const,
  applications: (jobId: string, params: EmployerApplicationsParams = {}) =>
    [...employerKeys.jobDetail(jobId), 'applications', params] as const,
  plans: () => [...employerKeys.all, 'plans'] as const,
  subscription: () => [...employerKeys.all, 'subscription'] as const,
  jobCategories: () => [...employerKeys.all, 'job-categories'] as const,
}

// ── Queries (reusable, typed configs) ─────────────────────────
export const employerDashboardQuery = () =>
  queryOptions({
    queryKey: employerKeys.dashboard(),
    queryFn: () => api.getEmployerDashboard(),
  })

export const employerJobsQuery = (params: EmployerJobsParams = {}) =>
  queryOptions({
    queryKey: employerKeys.jobList(params),
    queryFn: () => api.getEmployerJobs(params),
  })

export const employerJobQuery = (id: string) =>
  queryOptions({
    queryKey: employerKeys.jobDetail(id),
    queryFn: () => api.getEmployerJob(id),
    enabled: !!id,
  })

export const employerApplicationsQuery = (jobId: string, params: EmployerApplicationsParams = {}) =>
  queryOptions({
    queryKey: employerKeys.applications(jobId, params),
    queryFn: () => api.getEmployerApplications(jobId, params),
    enabled: !!jobId,
  })

export const employerPlansQuery = () =>
  queryOptions({
    queryKey: employerKeys.plans(),
    queryFn: () => api.getEmployerPlans(),
  })

export const employerSubscriptionQuery = () =>
  queryOptions({
    queryKey: employerKeys.subscription(),
    queryFn: () => api.getEmployerSubscription(),
  })

export const jobCategoriesQuery = () =>
  queryOptions({
    queryKey: employerKeys.jobCategories(),
    queryFn: () => api.getJobCategories(),
    staleTime: 60 * 60 * 1000, // categories rarely change
  })

// ── Mutations (invalidate exactly what changed) ───────────────
export function useCreateEmployerJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: EmployerJobInput) => api.createEmployerJob(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: employerKeys.jobs() })
      qc.invalidateQueries({ queryKey: employerKeys.dashboard() })
    },
  })
}

export function useUpdateEmployerJob(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<EmployerJobInput>) => api.updateEmployerJob(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: employerKeys.jobDetail(id) })
      qc.invalidateQueries({ queryKey: employerKeys.jobList() })
    },
  })
}

export function useDeleteEmployerJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteEmployerJob(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: employerKeys.jobs() })
      qc.invalidateQueries({ queryKey: employerKeys.dashboard() })
    },
  })
}

export function useToggleEmployerJobFeatured() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (jobId: string) => api.toggleEmployerJobFeatured(jobId),
    onSuccess: (_res, jobId) => {
      qc.invalidateQueries({ queryKey: employerKeys.jobDetail(jobId) })
      qc.invalidateQueries({ queryKey: employerKeys.jobList() })
    },
  })
}

/** Update an application's status. `jobId` scopes cache invalidation to that job's detail + applications. */
export function useUpdateApplicationStatus(jobId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ applicationId, status }: { applicationId: string; status: ApplicationStatus }) =>
      api.updateEmployerApplicationStatus(applicationId, status),
    onSuccess: () => {
      // jobDetail(jobId) is a prefix of the applications key, so this refreshes both.
      qc.invalidateQueries({ queryKey: employerKeys.jobDetail(jobId) })
    },
  })
}

/**
 * Update the employer's company profile. The canonical profile lives in `useAuth`,
 * so the calling component should refresh the auth user on success; there is no
 * server-state cache entry to invalidate here yet.
 */
export function useUpdateEmployerProfile() {
  return useMutation({
    mutationFn: (data: EmployerProfileInput) => api.updateEmployerProfile(data),
  })
}

export function useSubscribeToPlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (planId: string) => api.subscribeToPlan(planId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: employerKeys.subscription() })
    },
  })
}
