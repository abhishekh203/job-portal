'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/use-auth'
import { employerDashboardQuery } from '@/features/employer/queries'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Briefcase,
  CheckCircle,
  Clock,
  XCircle,
  Users,
  Plus,
  ArrowRight,
  Loader2,
  TrendingUp,
  FileText,
  Building2,
  Eye,
  Calendar,
  Activity,
  UserPlus,
} from 'lucide-react'

const statusConfig: Record<string, { label: string; class: string }> = {
  PENDING: { label: 'Pending', class: 'bg-warning/10 text-warning border-warning/20' },
  REVIEWED: { label: 'Reviewed', class: 'bg-primary/10 text-primary border-primary/20' },
  SHORTLISTED: { label: 'Shortlisted', class: 'bg-accent/10 text-accent border-accent/20' },
  ACCEPTED: { label: 'Accepted', class: 'bg-success/10 text-success border-success/20' },
  REJECTED: { label: 'Rejected', class: 'bg-destructive/10 text-destructive border-destructive/20' },
  HIRED: { label: 'Hired', class: 'bg-success/10 text-success border-success/20' },
}

function ApplicationStatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] || { label: status, class: 'bg-muted text-muted-foreground' }
  return (
    <Badge variant="outline" className={`text-xs rounded-lg px-2 py-0.5 ${cfg.class}`}>
      {cfg.label}
    </Badge>
  )
}

export default function EmployerDashboardPage() {
  const { user } = useAuth()
  const { data: stats, isLoading, isError } = useQuery(employerDashboardQuery())

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
        <p className="text-sm text-muted-foreground">Failed to load dashboard. Please try again.</p>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Jobs',
      value: stats?.totalJobs || 0,
      icon: Briefcase,
      color: 'bg-primary/10 text-primary',
    },
    {
      title: 'Active Jobs',
      value: stats?.activeJobs || 0,
      icon: CheckCircle,
      color: 'bg-success/10 text-success',
    },
    {
      title: 'Pending Approval',
      value: stats?.pendingJobs || 0,
      icon: Clock,
      color: 'bg-warning/10 text-warning',
    },
    {
      title: 'Rejected',
      value: stats?.rejectedJobs || 0,
      icon: XCircle,
      color: 'bg-destructive/10 text-destructive',
    },
    {
      title: 'Total Applicants',
      value: stats?.totalApplications || 0,
      icon: Users,
      color: 'bg-accent/10 text-accent',
    },
    {
      title: 'Total Views',
      value: stats?.totalViews || 0,
      icon: Eye,
      color: 'bg-primary/10 text-primary',
    },
    {
      title: 'Application Rate',
      value: stats?.applicationRate ? `${stats.applicationRate}%` : '0%',
      icon: Activity,
      color: 'bg-success/10 text-success',
    },
    {
      title: 'Expiring Soon',
      value: stats?.jobsExpiringSoon || 0,
      icon: Calendar,
      color: 'bg-warning/10 text-warning',
    },
  ]

  const breakdownEntries = stats?.applicationBreakdown || []
  const totalApps = breakdownEntries.reduce((sum, b) => sum + b._count.id, 0)

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Welcome back, {user?.companyName || 'Employer'}!
        </h2>
        <p className="text-muted-foreground mt-1">
          Here&rsquo;s an overview of your job listings and applicants.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title} className="border border-border/60">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{card.title}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{card.value}</p>
                  </div>
                  <div className={`h-10 w-10 rounded-xl ${card.color} flex items-center justify-center`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Application Breakdown + Recent Applicants */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Application Breakdown */}
        <Card className="border border-border/60">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Application Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {breakdownEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No applications yet</p>
            ) : (
              <div className="space-y-3">
                {breakdownEntries.map((entry) => {
                  const cfg = statusConfig[entry.status] || { label: entry.status, class: 'bg-muted text-muted-foreground' }
                  const pct = totalApps > 0 ? Math.round((entry._count.id / totalApps) * 100) : 0
                  return (
                    <div key={entry.status} className="flex items-center gap-3">
                      <Badge variant="outline" className={`w-24 text-xs rounded-lg px-2 py-0.5 ${cfg.class}`}>
                        {cfg.label}
                      </Badge>
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${cfg.class.split(' ')[0]}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-foreground w-8 text-right">{entry._count.id}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Applicants */}
        <Card className="border border-border/60">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-primary" />
              Recent Applicants
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!stats?.recentApplicants?.length ? (
              <p className="text-sm text-muted-foreground text-center py-6">No recent applications</p>
            ) : (
              <div className="space-y-4">
                {stats.recentApplicants.map((app) => (
                  <div key={app.id} className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={app.applicantAvatar || ''} />
                      <AvatarFallback className="text-xs bg-muted">
                        {app.applicantName?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{app.applicantName}</p>
                      <p className="text-xs text-muted-foreground truncate">{app.jobTitle}</p>
                    </div>
                    <div className="text-right">
                      <ApplicationStatusBadge status={app.status} />
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions + Tips */}
      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="border border-border/60">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="default" asChild className="w-full justify-between rounded-xl h-12">
              <Link href="/dashboard/employer/jobs/new">
                <span className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Post a New Job
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full justify-between rounded-xl h-12">
              <Link href="/dashboard/employer/jobs">
                <span className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  View My Jobs
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full justify-between rounded-xl h-12">
              <Link href="/dashboard/employer/company">
                <span className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Edit Company Profile
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border border-border/60">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Tips & Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-warning/10 flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="h-3 w-3 text-warning" />
              </div>
              <p>Jobs require admin approval before going live</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <FileText className="h-3 w-3 text-primary" />
              </div>
              <p>You&rsquo;ll receive an email when your job is approved or rejected</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-success/10 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle className="h-3 w-3 text-success" />
              </div>
              <p>If rejected, you can edit and resubmit your job for re-review</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                <Users className="h-3 w-3 text-accent" />
              </div>
              <p>Review and update applicant statuses to keep track</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Building2 className="h-3 w-3 text-primary" />
              </div>
              <p>Keep your company profile up to date</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
