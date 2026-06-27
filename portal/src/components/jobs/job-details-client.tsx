"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  ExternalLink,
  Loader2,
  Star,
  FileText,
  Target,
  Rocket,
  Lightbulb,
  Building2,
  Share2,
  CheckCircle,
  Briefcase,
  ListChecks,
  HelpCircle,
  ChevronDown,
  Globe,
} from "lucide-react"
import {
  Job,
  api,
  formatSalary,
  getJobTypeLabel,
  getWorkTypeLabel,
  getExperienceLabel,
} from "@/lib/api"
import { toast } from "sonner"
import { sanitizeHtml } from "@/lib/sanitize"
import { formatDate } from "@/lib/utils"

interface JobDetailsClientProps {
  job: Job
  hasApplied: boolean
}

export function JobDetailsClient({ job, hasApplied }: JobDetailsClientProps) {
  const { user, isAuthenticated } = useAuth()
  const [coverLetter, setCoverLetter] = useState("")
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false)
  const [isProfileIncompleteAlertOpen, setIsProfileIncompleteAlertOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const queryClient = useQueryClient()

  // Always start the job detail page at the top, regardless of prior scroll
  // position. The extra rAF reset overrides the browser/Next scroll restoration
  // that can otherwise run after mount (e.g. opening a job from far down a list).
  useEffect(() => {
    window.scrollTo(0, 0)
    const raf = requestAnimationFrame(() => window.scrollTo(0, 0))
    return () => cancelAnimationFrame(raf)
  }, [job.id])

  // FAQs auto-generated from the job's structured data — no extra content needed.
  const faqs = [
    {
      q: "What type of employment is this?",
      a: `This is a ${getJobTypeLabel(job.jobType).toLowerCase()} position in the ${job.category} category.`,
    },
    job.workLocationType && {
      q: "Is this a remote role?",
      a:
        job.workLocationType === "REMOTE"
          ? "Yes — this role is fully remote."
          : job.workLocationType === "HYBRID"
            ? `This is a hybrid role based in ${job.location}, combining on-site and remote work.`
            : `No — this is an on-site role based in ${job.location}.`,
    },
    {
      q: "What experience level is required?",
      a: `This role is suited for candidates at the "${getExperienceLabel(job.experienceLevel)}" level.`,
    },
    (job.salaryMin || job.salaryMax || job.salaryNegotiable) && {
      q: "What is the salary for this job?",
      a: `The offered compensation is ${formatSalary(job.salaryMin, job.salaryMax, job.salaryNegotiable)}${job.currency ? ` (${job.currency})` : ""}.`,
    },
    job.applicationDeadline && {
      q: "When is the application deadline?",
      a: `Applications close on ${formatDate(job.applicationDeadline)}. We recommend applying early.`,
    },
    {
      q: "How do I apply for this position?",
      a: `Click "Apply Now", complete your profile, and submit your application directly to ${job.companyName}.`,
    },
  ].filter(Boolean) as { q: string; a: string }[]

  const applyMutation = useMutation({
    mutationFn: (cover: string) => api.applyToJob(job.id, cover),
    onSuccess: (data) => {
      toast.success(data.message || "Application submitted successfully!")
      setIsApplyDialogOpen(false)
      setCoverLetter("")
      queryClient.invalidateQueries({ queryKey: ["my-applications"] })
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to submit application")
    },
  })

  const checkProfileCompletion = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to apply for jobs")
      return false
    }
    if (user?.profileCompleted === true) return true
    setIsProfileIncompleteAlertOpen(true)
    return false
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Left 2/3 */}
          <div className="lg:col-span-2 space-y-8">
            {/* Job Header */}
            <div className="pb-2">
              <div>
                <div className="flex items-start gap-5 mb-6">
                  {job.companyLogo ? (
                    <img src={job.companyLogo} alt="" className="w-16 h-16 rounded-xl object-cover border border-border/50 shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Building2 className="h-8 w-8 text-primary" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h1 className="text-2xl lg:text-3xl font-bold text-foreground leading-tight">{job.title}</h1>
                      {job.isFeatured && (
                        <Badge className="shrink-0 bg-warning/10 text-warning border-warning/20 rounded-lg text-xs font-semibold px-2.5 py-1">
                          <Star className="h-3 w-3 mr-1 fill-current" /> Featured
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      {job.companySlug ? (
                        <Link href={`/companies/${job.companySlug}`} className="font-semibold hover:text-primary transition-colors">
                          {job.companyName}
                        </Link>
                      ) : (
                        <span className="font-semibold">{job.companyName}</span>
                      )}
                      {job.companyWebsite && (
                        <Link href={job.companyWebsite} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* Badge Row */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <Badge variant="secondary" className="rounded-lg text-xs font-medium px-3 py-1.5">
                    <MapPin className="h-3 w-3 mr-1.5" /> {job.location}
                  </Badge>
                  <Badge variant="outline" className="rounded-lg text-xs font-medium px-3 py-1.5">
                    <Clock className="h-3 w-3 mr-1.5" /> {getJobTypeLabel(job.jobType)}
                  </Badge>
                  <Badge variant="outline" className="rounded-lg text-xs font-medium px-3 py-1.5">
                    {getWorkTypeLabel(job.workLocationType || '')}
                  </Badge>
                  <Badge variant="outline" className="rounded-lg text-xs font-medium px-3 py-1.5">
                    {getExperienceLabel(job.experienceLevel)}
                  </Badge>
                  <Badge variant="outline" className="rounded-lg text-xs font-medium px-3 py-1.5">
                    {job.category}
                  </Badge>
                </div>

                {/* Status + Deadline */}
                <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground border-t border-border/50 pt-5">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${job.isActive ? 'bg-success' : 'bg-muted-foreground'}`} />
                    <span>{job.isActive ? 'Active' : 'Closed'}</span>
                  </div>
                  {job.applicationDeadline && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Apply by {formatDate(job.applicationDeadline)}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Posted {formatDate(job.createdAt)}
                  </div>
                </div>
              </div>
            </div>

            {/* Job Description */}
            <section className="border-t border-border/60 pt-8">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-primary" />
                Job Description
              </h2>
              <div
                className="prose prose-sm max-w-none prose-headings:font-semibold prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-strong:text-foreground prose-ul:text-muted-foreground prose-li:text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(job.description) }}
              />
            </section>

            {/* Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <section className="border-t border-border/60 pt-8">
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <Target className="h-5 w-5 text-primary" />
                  Responsibilities
                </h2>
                <ul className="space-y-3">
                  {job.responsibilities.map((res, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                      {res}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <section className="border-t border-border/60 pt-8">
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <ListChecks className="h-5 w-5 text-primary" />
                  Job Requirements
                </h2>
                <ul className="space-y-3">
                  {job.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* About the Company */}
            <section className="border-t border-border/60 pt-8">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Building2 className="h-5 w-5 text-primary" />
                About {job.companyName}
              </h2>
              <div>
                <div className="flex items-start gap-4">
                  {job.companyLogo ? (
                    <img src={job.companyLogo} alt="" className="w-14 h-14 rounded-xl object-cover border border-border/50 shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Building2 className="h-7 w-7 text-primary" />
                    </div>
                  )}
                  <div className="min-w-0 space-y-1.5">
                    <p className="font-semibold text-foreground">{job.companyName}</p>
                    <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" /> {job.location}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      {job.companySlug && (
                        <Link href={`/companies/${job.companySlug}`} className="text-sm font-medium text-primary hover:underline">
                          View all jobs at {job.companyName}
                        </Link>
                      )}
                      {job.companyWebsite && (
                        <Link
                          href={job.companyWebsite}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                        >
                          <Globe className="h-3.5 w-3.5" /> Website
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* FAQs about this job */}
            {faqs.length > 0 && (
              <section className="border-t border-border/60 pt-8">
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-2">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  FAQs about this job
                </h2>
                <div className="divide-y divide-border/50">
                  {faqs.map((faq, idx) => (
                    <div key={idx} className="py-1">
                      <button
                        type="button"
                        onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                        className="flex w-full items-center justify-between gap-4 py-3 text-left"
                        aria-expanded={openFaq === idx}
                      >
                        <span className="text-sm font-medium text-foreground">{faq.q}</span>
                        <ChevronDown
                          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${openFaq === idx ? "rotate-180" : ""}`}
                        />
                      </button>
                      {openFaq === idx && (
                        <p className="pb-3 pr-8 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar - Right 1/3 */}
          <div className="lg:col-span-1 space-y-6">
            {/* Apply block (sticky) */}
            <div className="lg:sticky lg:top-24 divide-y divide-border/60">
              <div className="pb-6">
                {hasApplied ? (
                  <div className="text-center py-4">
                    <CheckCircle className="h-10 w-10 text-success mx-auto mb-3" />
                    <p className="font-semibold text-foreground">Application Submitted</p>
                    <p className="text-sm text-muted-foreground mt-1">You have already applied for this position.</p>
                  </div>
                ) : job.isActive ? (
                  <>
                    <h3 className="font-semibold text-foreground mb-2">Apply for this job</h3>
                    <p className="text-sm text-muted-foreground mb-5">
                      Submit your application to {job.companyName}.
                    </p>
                    <Button
                      className="w-full h-12 rounded-xl gradient-primary shadow-md hover:shadow-lg transition-all"
                      onClick={() => checkProfileCompletion() && setIsApplyDialogOpen(true)}
                    >
                      <Rocket className="h-4 w-4 mr-2" />
                      Apply Now
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <Briefcase className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="font-semibold text-foreground">Position Closed</p>
                    <p className="text-sm text-muted-foreground mt-1">This job is no longer accepting applications.</p>
                  </div>
                )}
              </div>

              {/* Salary */}
              {(job.salaryMin || job.salaryMax || job.salaryNegotiable) && (
                <div className="py-6">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Salary Range</p>
                  <p className="text-xl font-bold text-foreground">{formatSalary(job.salaryMin, job.salaryMax, job.salaryNegotiable)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{job.currency || 'NPR'}</p>
                </div>
              )}

              {/* Company */}
              <div className="py-6">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">About the Company</p>
                <div className="flex items-center gap-4 mb-4">
                  {job.companyLogo ? (
                    <img src={job.companyLogo} alt="" className="w-12 h-12 rounded-xl object-cover border border-border/50" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                  )}
                  <div>
                    {job.companySlug ? (
                      <Link href={`/companies/${job.companySlug}`} className="font-semibold text-foreground hover:text-primary transition-colors">
                        {job.companyName}
                      </Link>
                    ) : (
                      <p className="font-semibold text-foreground">{job.companyName}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{job.location}</p>
                  </div>
                </div>
                {job.companyWebsite && (
                  <Button variant="outline" size="sm" asChild className="w-full rounded-xl">
                    <Link href={job.companyWebsite} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visit Website
                    </Link>
                  </Button>
                )}
              </div>

              {/* Share */}
              <div className="pt-6">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full rounded-xl"
                  onClick={() => {
                    navigator.share?.({
                      title: job.title,
                      text: `Check out this job at ${job.companyName}`,
                      url: window.location.href,
                    })
                  }}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share This Job
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Dialog */}
      <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Apply for {job.title}</DialogTitle>
            <DialogDescription>
              Submit your application to {job.companyName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5">
            <div>
              <Label htmlFor="coverLetter" className="text-sm font-semibold text-foreground mb-2 block">
                Cover Letter
              </Label>
              <Textarea
                id="coverLetter"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={5}
                placeholder="Tell us why you're a great fit for this role..."
                className="rounded-xl border-2 resize-none"
              />
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                <Lightbulb className="h-3 w-3" />
                Mention relevant skills and experience
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => applyMutation.mutate(coverLetter)}
                disabled={applyMutation.isPending || !coverLetter.trim()}
                className="flex-1 h-12 rounded-xl gradient-primary"
              >
                {applyMutation.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                ) : (
                  <><Rocket className="mr-2 h-4 w-4" /> Submit Application</>
                )}
              </Button>
              <Button variant="outline" onClick={() => setIsApplyDialogOpen(false)} className="rounded-xl h-12">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile Incomplete Alert */}
      <AlertDialog open={isProfileIncompleteAlertOpen} onOpenChange={setIsProfileIncompleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Your Profile</AlertDialogTitle>
            <AlertDialogDescription>
              You need to complete your profile before applying. This helps employers learn about you.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction asChild>
              <Link href="/dashboard/profile">Complete Profile</Link>
            </AlertDialogAction>
            <AlertDialogCancel>Maybe Later</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mobile Apply Button */}
      {job.isActive && !hasApplied && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border md:hidden z-50">
          <Button
            className="w-full h-14 rounded-xl gradient-primary shadow-lg"
            onClick={() => checkProfileCompletion() && setIsApplyDialogOpen(true)}
          >
            Apply Now <Rocket className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
