import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Building2, MapPin, Star, ArrowUpRight } from 'lucide-react'
import { Job, formatSalary, getJobTypeLabel } from '@/lib/api'

interface JobCardProps {
  job: Job
}

export function JobCard({ job }: JobCardProps) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5">
      {/* Featured accent strip */}
      {job.isFeatured && (
        <span className="absolute inset-x-0 top-0 h-1 gradient-primary" aria-hidden />
      )}

      {/* Stretched link — makes the whole card clickable */}
      <Link href={`/jobs/${job.slug}`} className="absolute inset-0 z-0" aria-label={`View ${job.title}`}>
        <span className="sr-only">View {job.title}</span>
      </Link>

      <div className="flex h-full flex-col p-5">
        {/* Header: Logo + Title + Company */}
        <div className="flex items-start gap-4">
          {job.companyLogo ? (
            <img
              src={job.companyLogo}
              alt=""
              className="h-14 w-14 shrink-0 rounded-2xl border border-border/50 object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
              <Building2 className="h-7 w-7 text-primary" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-start justify-between gap-2">
              {job.isFeatured && (
                <Badge className="z-10 shrink-0 gap-1 rounded-full border-0 bg-warning/15 px-2 py-0.5 text-[11px] font-semibold text-warning">
                  <Star className="h-3 w-3 fill-warning" /> Featured
                </Badge>
              )}
            </div>
            <h3 className="line-clamp-2 text-base font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
              {job.title}
            </h3>
            {job.companySlug ? (
              <Link
                href={`/companies/${job.companySlug}`}
                className="relative z-10 mt-1 inline-block truncate text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                {job.companyName}
              </Link>
            ) : (
              <p className="mt-1 truncate text-sm text-muted-foreground">{job.companyName}</p>
            )}
          </div>
        </div>

        {/* Badge Row */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium">
            <MapPin className="h-3 w-3" />
            {job.location}
          </Badge>
          <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-xs font-medium">
            {getJobTypeLabel(job.jobType)}
          </Badge>
          {job.workLocationType && (
            <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-xs font-medium capitalize">
              {job.workLocationType.toLowerCase()}
            </Badge>
          )}
        </div>

        {/* Description Preview */}
        {job.description && (
          <p className="mt-4 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {job.description.replace(/<[^>]*>/g, '').substring(0, 150)}…
          </p>
        )}

        {/* Footer: Salary pill + Category + arrow */}
        <div className="mt-auto flex items-end justify-between gap-3 border-t border-border/50 pt-4">
          <div className="min-w-0">
            {job.salaryMin ? (
              <span className="inline-block rounded-lg bg-primary/10 px-2.5 py-1 text-sm font-semibold text-primary">
                {formatSalary(job.salaryMin, job.salaryMax, job.salaryNegotiable)}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">Salary not disclosed</span>
            )}
            {job.category && (
              <p className="mt-1.5 truncate text-xs text-muted-foreground">{job.category}</p>
            )}
          </div>

          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition-all duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground"
            aria-hidden
          >
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </article>
  )
}
