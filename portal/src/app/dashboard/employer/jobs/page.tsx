'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { type EmployerJob } from '@/lib/api'
import { employerJobsQuery, useDeleteEmployerJob } from '@/features/employer/queries'
import { handleApiError } from '@/lib/error-handler'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Loader2,
  MapPin,
  Users,
  Search,
  SlidersHorizontal,
  Star,
} from 'lucide-react'
import { toast } from 'sonner'

const STATUS_FILTERS = [
  { value: 'all', label: 'All Status' },
  { value: 'APPROVED', label: 'Active' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'RESUBMITTED', label: 'Resubmitted' },
  { value: 'REJECTED', label: 'Rejected' },
]

export default function EmployerJobsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const { data, isLoading, isError } = useQuery(employerJobsQuery({ limit: 100 }))
  const jobs = useMemo(() => data?.data ?? [], [data])

  const deleteJob = useDeleteEmployerJob()

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return
    deleteJob.mutate(id, {
      onSuccess: () => toast.success('Job deleted successfully'),
      onError: (error) => handleApiError(error, 'Failed to delete job'),
    })
  }

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch = !search || 
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.location?.toLowerCase().includes(search.toLowerCase()) ||
        job.category?.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [jobs, search, statusFilter])

  const getStatusBadge = (job: EmployerJob) => {
    switch (job.status) {
      case 'APPROVED': return { label: 'Active', class: 'bg-success/10 text-success border-success/20' }
      case 'REJECTED': return { label: 'Rejected', class: 'bg-destructive/10 text-destructive border-destructive/20' }
      case 'RESUBMITTED': return { label: 'Resubmitted', class: 'bg-primary/10 text-primary border-primary/20' }
      default: return { label: 'Pending', class: 'bg-warning/10 text-warning border-warning/20' }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-muted-foreground">Failed to load jobs. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">My Jobs</h2>
          <p className="text-muted-foreground mt-1">Manage your job listings</p>
        </div>
        <Button asChild className="rounded-xl">
          <Link href="/dashboard/employer/jobs/new">
            <Plus className="h-4 w-4 mr-2" />
            Post New Job
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs by title, location, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40 rounded-xl">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((f) => (
              <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <Card className="border border-border/60">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <BriefcaseIcon />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No jobs found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {jobs.length === 0
                ? 'Post your first job to start receiving applications'
                : 'Try adjusting your search or filters'}
            </p>
            {jobs.length === 0 && (
              <Button className="mt-4 rounded-xl" asChild>
                <Link href="/dashboard/employer/jobs/new">Post a Job</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredJobs.map((job) => {
            const status = getStatusBadge(job)
            return (
              <Card key={job.id} className="border border-border/60 hover:border-border transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/dashboard/employer/jobs/${job.id}`}
                          className="text-base font-semibold text-foreground hover:text-primary transition-colors truncate"
                        >
                          {job.title}
                        </Link>
                        <Badge variant="outline" className={`text-xs rounded-lg px-2 py-0.5 ${status.class}`}>
                          {status.label}
                        </Badge>
                        {job.isFeatured && (
                          <Badge className="text-xs rounded-lg px-2 py-0.5 bg-warning/10 text-warning border-warning/20">
                            <Star className="h-3 w-3 mr-1 fill-current" /> Featured
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {job._count?.applications || 0} applicants
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" />
                          {job.viewCount || 0} views
                        </span>
                        <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                        <span className="text-xs text-muted-foreground/60">{job.jobType} &middot; {job.workLocationType}</span>
                      </div>
                      {job.status === 'REJECTED' && job.rejectionReason && (
                        <p className="text-xs text-destructive mt-2 flex items-center gap-1">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-destructive" />
                          Rejected: {job.rejectionReason}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg" asChild>
                        <Link href={`/dashboard/employer/jobs/${job.id}`} title="View details & applicants">
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg" asChild>
                        <Link href={`/dashboard/employer/jobs/${job.id}/edit`} title="Edit job">
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(job.id)}
                        disabled={deleteJob.isPending && deleteJob.variables === job.id}
                        title="Delete job"
                      >
                        {deleteJob.isPending && deleteJob.variables === job.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

function BriefcaseIcon() {
  return (
    <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )
}
