'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { type ApplicationStatus } from '@/lib/api'
import {
  employerJobQuery,
  employerApplicationsQuery,
  useToggleEmployerJobFeatured,
  useUpdateApplicationStatus,
} from '@/features/employer/queries'
import { handleApiError } from '@/lib/error-handler'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  Edit,
  Loader2,
  MapPin,
  Clock,
  Users,
  Star,
  Briefcase,
  DollarSign,
  Calendar,
  ChevronDown,
  ChevronUp,
  FileText,
  Eye,
} from 'lucide-react'
import { toast } from 'sonner'

const STATUS_OPTIONS = ['PENDING', 'REVIEWED', 'SHORTLISTED', 'ACCEPTED', 'REJECTED', 'HIRED'] as const

export default function EmployerJobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.id as string
  const [expandedApp, setExpandedApp] = useState<string | null>(null)

  const jobQuery = useQuery(employerJobQuery(jobId))
  const appsQuery = useQuery(employerApplicationsQuery(jobId, { limit: 100 }))

  const job = jobQuery.data?.job
  const applications = appsQuery.data?.data ?? []

  const toggleFeatured = useToggleEmployerJobFeatured()
  const updateStatus = useUpdateApplicationStatus(jobId)

  // Preserve original UX: bounce back to the list if the job fails to load.
  useEffect(() => {
    if (jobQuery.isError) {
      toast.error('Failed to load job details')
      router.push('/dashboard/employer/jobs')
    }
  }, [jobQuery.isError, router])

  const handleStatusChange = (applicationId: string, status: ApplicationStatus) => {
    updateStatus.mutate(
      { applicationId, status },
      {
        onSuccess: () => toast.success('Application status updated'),
        onError: (error) => handleApiError(error, 'Failed to update status'),
      }
    )
  }

  const handleToggleFeatured = () => {
    if (!job) return
    toggleFeatured.mutate(job.id, {
      onSuccess: (res) => toast.success(res.message),
      onError: (error) => handleApiError(error, 'Failed to toggle featured'),
    })
  }

  if (jobQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!job) return null

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED': return { label: 'Approved', class: 'bg-success/10 text-success border-success/20' }
      case 'REJECTED': return { label: 'Rejected', class: 'bg-destructive/10 text-destructive border-destructive/20' }
      case 'RESUBMITTED': return { label: 'Resubmitted', class: 'bg-primary/10 text-primary border-primary/20' }
      default: return { label: 'Pending', class: 'bg-warning/10 text-warning border-warning/20' }
    }
  }

  const jobStatus = getStatusBadge(job.status)

  const getAppStatusColor = (status: string) => {
    switch (status) {
      case 'HIRED': return 'border-success bg-success/5'
      case 'ACCEPTED': return 'border-success bg-success/5'
      case 'SHORTLISTED': return 'border-primary bg-primary/5'
      case 'REVIEWED': return 'border-warning bg-warning/5'
      case 'REJECTED': return 'border-destructive bg-destructive/5'
      default: return 'border-muted-foreground/20 bg-muted/30'
    }
  }

  const statusCounts = {
    PENDING: applications.filter((a) => a.status === 'PENDING').length,
    REVIEWED: applications.filter((a) => a.status === 'REVIEWED').length,
    SHORTLISTED: applications.filter((a) => a.status === 'SHORTLISTED').length,
    ACCEPTED: applications.filter((a) => a.status === 'ACCEPTED').length,
    REJECTED: applications.filter((a) => a.status === 'REJECTED').length,
    HIRED: applications.filter((a) => a.status === 'HIRED').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="rounded-lg">
            <Link href="/dashboard/employer/jobs">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl font-bold text-foreground">{job.title}</h2>
              <Badge variant="outline" className={`text-xs rounded-lg px-2 py-0.5 ${jobStatus.class}`}>
                {jobStatus.label}
              </Badge>
              {job.isFeatured && (
                <Badge className="text-xs rounded-lg px-2 py-0.5 bg-warning/10 text-warning border-warning/20 flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current" /> Featured
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{job.companyName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleToggleFeatured} className="rounded-lg">
            <Star className={`h-4 w-4 mr-1.5 ${job.isFeatured ? 'fill-warning text-warning' : ''}`} />
            {job.isFeatured ? 'Unfeature' : 'Feature'}
          </Button>
          <Button variant="outline" size="sm" asChild className="rounded-lg">
            <Link href={`/dashboard/employer/jobs/${job.id}/edit`}>
              <Edit className="h-4 w-4 mr-1.5" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      {/* Rejection Reason Banner */}
      {job.status === 'REJECTED' && job.rejectionReason && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
              <span className="text-destructive text-sm font-bold">!</span>
            </div>
            <div>
              <p className="text-sm font-medium text-destructive">Job Rejected</p>
              <p className="text-sm text-destructive mt-0.5">{job.rejectionReason}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Job Details + Applicants */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left - Job Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Job Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>{job.jobType.replace('_', ' ')} &middot; {job.workLocationType}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Eye className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>{job.viewCount || 0} views</span>
              </div>
              {job.salaryMin && (
                <div className="flex items-center gap-3 text-sm">
                  <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{job.currency} {job.salaryMin.toLocaleString()}{job.salaryMax ? ` - ${job.salaryMax.toLocaleString()}` : ''}</span>
                </div>
              )}
              {job.applicationDeadline && (
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}</span>
                </div>
              )}
              <Separator />
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline" className="text-xs rounded-lg">{job.category}</Badge>
                <Badge variant="outline" className="text-xs rounded-lg">{job.experienceLevel}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{job.description}</p>
            </CardContent>
          </Card>

          <Card className="border border-border/60">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                Applicant Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(statusCounts).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground capitalize">{status.toLowerCase()}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right - Applicants */}
        <div className="lg:col-span-2">
          <Card className="border border-border/60">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">
                Applicants <span className="text-muted-foreground font-normal">({applications.length})</span>
              </CardTitle>
              {applications.length > 0 && (
                <Badge variant="secondary" className="text-xs rounded-lg">
                  {statusCounts.PENDING} pending
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <div className="text-center py-12">
                  <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">No applications yet</p>
                  <p className="text-xs text-muted-foreground mt-1">When candidates apply, they&rsquo;ll appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {applications.map((app) => (
                    <div
                      key={app.id}
                      className={`rounded-xl border p-4 transition-all ${getAppStatusColor(app.status)}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <Avatar className="h-10 w-10 shrink-0">
                            <AvatarImage src={app.user?.profilePicture} />
                            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                              {app.user?.firstName?.charAt(0) || app.user?.email?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">
                              {app.user?.firstName && app.user?.lastName
                                ? `${app.user.firstName} ${app.user.lastName}`
                                : app.user?.email}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">{app.user?.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Select
                            value={app.status}
                            onValueChange={(v) => handleStatusChange(app.id, v as ApplicationStatus)}
                            disabled={updateStatus.isPending && updateStatus.variables?.applicationId === app.id}
                          >
                            <SelectTrigger className={`w-32 h-8 text-xs rounded-lg ${
                              app.status === 'HIRED' ? 'border-success text-success' :
                              app.status === 'ACCEPTED' ? 'border-success text-success' :
                              app.status === 'REJECTED' ? 'border-destructive text-destructive' :
                              app.status === 'SHORTLISTED' ? 'border-primary text-primary' : ''
                            }`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUS_OPTIONS.map((s) => (
                                <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg"
                            onClick={() => setExpandedApp(expandedApp === app.id ? null : app.id)}
                          >
                            {expandedApp === app.id ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {expandedApp === app.id && (
                        <div className="mt-4 pt-3 border-t border-border/50 space-y-3">
                          {app.user?.skills && app.user.skills.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1.5">Skills</p>
                              <div className="flex flex-wrap gap-1">
                                {app.user.skills.map((skill: string) => (
                                  <Badge key={skill} variant="secondary" className="text-xs rounded-lg">{skill}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                            {app.user?.location && (
                              <div className="flex items-center gap-1.5">
                                <MapPin className="h-3 w-3" />
                                {app.user.location}
                              </div>
                            )}
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3 w-3" />
                              Applied {new Date(app.appliedAt).toLocaleDateString()}
                            </div>
                          </div>
                          {app.user?.resume && (
                            <Button variant="outline" size="sm" asChild className="w-full rounded-lg h-9 text-xs">
                              <a href={app.user.resume} target="_blank" rel="noopener noreferrer">
                                <FileText className="h-3.5 w-3.5 mr-1.5" />
                                View Resume
                              </a>
                            </Button>
                          )}
                          {app.message && (
                            <div className="bg-background rounded-lg p-3 border border-border/50">
                              <p className="text-xs font-medium text-muted-foreground mb-1">Cover Letter</p>
                              <p className="text-xs text-foreground/80 italic leading-relaxed">&ldquo;{app.message}&rdquo;</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
