'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useQuery } from '@tanstack/react-query'
import { api, Job } from '@/lib/api'
import { PopularSearches } from '@/components/home/popular-searches'
import { MobileJobSearch } from '@/components/home/mobile-job-search'
import {
  Search,
  MapPin,
  Clock,
  Users,
  TrendingUp,
  Briefcase,
  Star,
  ArrowRight,
  CheckCircle,
  Zap,
  Rocket,
  Target,
  Building2,
  ChevronRight,
  Quote,
  Eye,
  FileSearch,
  UserCheck,
  Mail,
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

function AnimatedCounter({ value, suffix = '' }: { value: string; suffix?: string }) {
  const [display, setDisplay] = useState('0')
  const ref = useRef<HTMLSpanElement>(null)
  const numValue = parseInt(value.replace(/[+,]/g, ''))

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0
          const duration = 1500
          const step = Math.ceil(numValue / (duration / 16))
          const timer = setInterval(() => {
            start += step
            if (start >= numValue) {
              setDisplay(value)
              clearInterval(timer)
            } else {
              setDisplay(start.toLocaleString() + suffix)
            }
          }, 16)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [numValue, value, suffix])

  return <span ref={ref}>{display}</span>
}

export default function HomePage() {
  const { data: featuredJobsData, isLoading, error } = useQuery({
    queryKey: ['featured-jobs'],
    queryFn: () => api.getFeaturedJobs(),
    retry: 1,
    staleTime: 5 * 60 * 1000,
  })
  const [searchQuery, setSearchQuery] = useState('')

  const featuredJobs = Array.isArray(featuredJobsData) ? featuredJobsData : []

  const stats = [
    { label: 'Active Jobs', value: '1,200+', icon: Briefcase },
    { label: 'Companies', value: '500+', icon: Building2 },
    { label: 'Success Stories', value: '10,000+', icon: Users },
    { label: 'Growth Rate', value: '25%', icon: TrendingUp },
  ]

  const steps = [
    { icon: FileSearch, title: 'Search Jobs', description: 'Browse thousands of opportunities from leading companies across industries.' },
    { icon: UserCheck, title: 'Apply Instantly', description: 'Submit your application with a single click. No繁琐 forms, just your profile.' },
    { icon: Star, title: 'Get Hired', description: 'Connect with employers and land your dream role faster than ever.' },
  ]

  const testimonials = [
    { name: 'Sarah Chen', role: 'Software Engineer at Google', quote: 'Found my dream job within two weeks of signing up. The platform made it incredibly easy to connect with top companies.' },
    { name: 'James Wilson', role: 'Product Manager at Microsoft', quote: 'The quality of job listings is unmatched. Every company on the platform is verified and legitimate.' },
    { name: 'Priya Patel', role: 'Marketing Director at Spotify', quote: 'As an employer, we found the perfect candidate in days. The filtering and matching tools are excellent.' },
  ]

  return (
    <div className="min-h-screen">
      {/* ===== HERO ===== */}
      <section className="relative min-h-[680px] overflow-hidden bg-cream-paper dark:bg-background">
        <Image
          src="/images/job-portal-hero-v1.png"
          alt="Two young professionals ready to find their next career opportunity"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[68%_center] transition-[filter] dark:brightness-[0.42] dark:saturate-75"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-cream-paper via-cream-paper/95 to-cream-paper/20 dark:from-background dark:via-background/95 dark:to-background/35 lg:via-cream-paper/75 lg:to-transparent lg:dark:via-background/85 lg:dark:to-background/10" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex min-h-[680px] max-w-3xl flex-col justify-center py-20 lg:max-w-2xl lg:py-28">
            <h1 className="mb-6 text-5xl font-bold leading-[1.05] tracking-tight text-foreground md:text-6xl lg:text-7xl">
              Find Your{' '}
              <span className="gradient-primary bg-clip-text text-transparent">
                Dream Job
              </span>
              <br />
              <span className="text-foreground/80">Without the Drama</span>
            </h1>

            <p className="mb-10 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              Connect with verified companies, apply with your profile, and land the career you deserve.
            </p>

            {/* Search Bar */}
            <div className="mb-8 w-full max-w-xl">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for jobs, companies, or keywords..."
                  className="pl-14 pr-36 h-16 text-base rounded-2xl border-2 border-border bg-background/80 backdrop-blur-sm shadow-xl shadow-primary/5 focus-visible:ring-primary/30 dark:bg-card/85 dark:border-primary/25 dark:text-foreground dark:placeholder:text-muted-foreground"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      window.location.href = `/jobs?search=${encodeURIComponent(searchQuery.trim())}`
                    }
                  }}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <Button
                    asChild
                    className="h-12 px-6 rounded-xl gradient-primary text-white shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <Link href={searchQuery.trim() ? `/jobs?search=${encodeURIComponent(searchQuery.trim())}` : '/jobs'}>
                      Search <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="flex max-w-xl flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Verified Companies</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>No Spam</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Free to Join</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Private & Secure</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="py-16 lg:py-20 -mt-8 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {stats.map((stat, i) => {
              const Icon = stat.icon
              return (
                <Card key={i} className="border border-border/60 bg-card shadow-sm hover:shadow-md transition-all duration-200">
                  <CardContent className="p-6 lg:p-8 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <div className="text-3xl lg:text-4xl font-bold text-foreground mb-1">
                      <AnimatedCounter value={stat.value} />
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* ===== TRUSTED BY ===== */}
      <section className="py-16 lg:py-20 border-y border-border/40 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Trusted by leading companies</p>
          </div>
          <div className="relative overflow-hidden">
            <div className="flex gap-16 animate-marquee">
              {[...Array(2)].map((_, groupIdx) => (
                <div key={groupIdx} className="flex gap-16 shrink-0 items-center">
                  <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-background border border-border/50">
                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">T</div>
                    <span className="font-semibold text-foreground text-sm whitespace-nowrap">TechHub</span>
                  </div>
                  <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-background border border-border/50">
                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">G</div>
                    <span className="font-semibold text-foreground text-sm whitespace-nowrap">GrowthCorp</span>
                  </div>
                  <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-background border border-border/50">
                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">N</div>
                    <span className="font-semibold text-foreground text-sm whitespace-nowrap">Nexus Labs</span>
                  </div>
                  <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-background border border-border/50">
                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm">S</div>
                    <span className="font-semibold text-foreground text-sm whitespace-nowrap">StellarAI</span>
                  </div>
                  <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-background border border-border/50">
                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white font-bold text-sm">C</div>
                    <span className="font-semibold text-foreground text-sm whitespace-nowrap">CloudPeak</span>
                  </div>
                  <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-background border border-border/50">
                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm">M</div>
                    <span className="font-semibold text-foreground text-sm whitespace-nowrap">Meridian</span>
                  </div>
                  <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-background border border-border/50">
                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">D</div>
                    <span className="font-semibold text-foreground text-sm whitespace-nowrap">DataForge</span>
                  </div>
                  <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-background border border-border/50">
                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white font-bold text-sm">P</div>
                    <span className="font-semibold text-foreground text-sm whitespace-nowrap">PulseStack</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Three simple steps to land your next role. No fluff, just results.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
            {steps.map((step, i) => {
              const Icon = step.icon
              return (
                <div key={i} className="text-center relative">
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px border-t-2 border-dashed border-border" />
                  )}
                  <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/10 border border-primary/20 relative">
                    <Icon className="h-10 w-10 text-primary" />
                    <div className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">{step.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ===== FEATURED JOBS ===== */}
      <section className="py-20 lg:py-28 bg-muted/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
            <div>
              <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-3">
                Featured <span className="gradient-primary bg-clip-text text-transparent">Opportunities</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl">
                Hand-picked positions from our most trusted employers.
              </p>
            </div>
            <Button variant="outline" asChild className="mt-4 md:mt-0 rounded-xl">
              <Link href="/jobs">
                View All Jobs <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse border border-border/60">
                  <CardContent className="p-6">
                    <div className="h-5 bg-muted rounded-lg w-3/4 mb-3" />
                    <div className="h-4 bg-muted rounded w-1/2 mb-6" />
                    <div className="space-y-3">
                      <div className="h-4 bg-muted rounded w-2/3" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                      <div className="h-10 bg-muted rounded-xl mt-4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error || featuredJobs.length === 0 ? (
            <div className="text-center py-16">
              <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                {error ? 'Unable to load featured jobs.' : 'No featured jobs right now.'}
              </p>
              <Button asChild>
                <Link href="/jobs">Browse All Jobs</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredJobs.slice(0, 6).map((job: Job) => (
                <Link key={job.id} href={`/jobs/${job.slug}`} className="group block">
                  <Card className="h-full border border-border/60 bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {job.companyLogo ? (
                            <img src={job.companyLogo} alt="" className="w-10 h-10 rounded-xl object-cover border border-border/50" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-primary" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-foreground group-hover:text-primary transition-colors leading-tight line-clamp-1">
                              {job.title}
                            </p>
                            <p className="text-sm text-muted-foreground">{job.companyName}</p>
                          </div>
                        </div>
                        {job.isFeatured && (
                          <Star className="h-4 w-4 text-warning fill-warning shrink-0" />
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="secondary" className="rounded-lg text-xs font-medium px-2.5 py-1">
                          {job.location}
                        </Badge>
                        <Badge variant="outline" className="rounded-lg text-xs font-medium px-2.5 py-1">
                          {job.jobType?.replace('_', ' ')}
                        </Badge>
                        {job.workLocationType && (
                          <Badge variant="outline" className="rounded-lg text-xs font-medium px-2.5 py-1">
                            {job.workLocationType}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold text-primary">
                          {job.salaryMin
                            ? `$${job.salaryMin.toLocaleString()}${job.salaryMax ? ` - $${job.salaryMax.toLocaleString()}` : ''}`
                            : 'Salary not specified'}
                        </div>
                        <div className="text-sm text-muted-foreground">{job.category}</div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== POPULAR SEARCHES ===== */}
      <PopularSearches />

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
              What Our Users Say
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Real stories from real people who found success on NayaJagir.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <Card key={i} className="border border-border/60 bg-card relative">
                <CardContent className="p-8">
                  <Quote className="h-8 w-8 text-primary/20 mb-4" />
                  <p className="text-foreground/80 leading-relaxed mb-6 text-sm">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                      {t.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-20 lg:py-28 relative overflow-hidden bg-muted/40">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-br from-primary/[0.03] to-accent/[0.03] rounded-full blur-3xl" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Ready to Take the{' '}
              <span className="gradient-primary bg-clip-text text-transparent">Next Step</span>?
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              Join thousands of professionals who have already found their dream jobs. Your next opportunity is just a click away.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-base px-10 h-14 rounded-xl gradient-primary shadow-lg hover:shadow-xl transition-all duration-200">
                <Link href="/auth/register">
                  Create Free Account <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base px-10 h-14 rounded-xl border-2">
                <Link href="/jobs">Browse Jobs</Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              No credit card required. Free to join, free to apply.
            </p>
          </div>
        </div>
      </section>

      {/* ===== MOBILE JOB SEARCH ===== */}
      <MobileJobSearch />
    </div>
  )
}
