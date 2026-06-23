import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, BellRing, BriefcaseBusiness, Building2, Check } from 'lucide-react'

import { Button } from '@/components/ui/button'

const mobileBenefits = [
  'Search and filter jobs from any device',
  'Apply using your saved NayaJagir profile',
  'Track every application in one place',
]

export function MobileJobSearch() {
  return (
    <section className="bg-background py-20 lg:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-apricot-wash shadow-sm dark:bg-card">
          <div className="absolute -left-20 -top-28 h-72 w-72 rounded-full bg-white/50 blur-3xl dark:bg-primary/10" />
          <div className="grid min-h-[560px] lg:grid-cols-[1.1fr_0.9fr_0.55fr]">
            <div className="relative z-10 flex flex-col justify-center px-7 py-12 sm:px-12 lg:px-16">
              <div className="mb-6 flex w-fit items-center gap-2 rounded-full border border-primary/15 bg-white/65 px-4 py-2 text-sm font-semibold text-primary backdrop-blur-sm dark:bg-background/50">
                <BellRing className="h-4 w-4" />
                Job search in your pocket
              </div>

              <h2 className="max-w-xl text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                NayaJagir, wherever your career takes you
              </h2>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">
                Browse opportunities, apply faster, and keep track of your progress from your phone.
              </p>

              <ul className="mt-8 space-y-3">
                {mobileBenefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3 text-sm font-medium text-foreground/80">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    {benefit}
                  </li>
                ))}
              </ul>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-12 rounded-xl px-7 text-white gradient-primary">
                  <Link href="/jobs">
                    Browse jobs <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 rounded-xl border-primary/20 bg-white/60 px-7 dark:bg-background/40">
                  <Link href="/auth/register">Create your profile</Link>
                </Button>
              </div>
            </div>

            <div className="relative min-h-[420px] overflow-hidden lg:min-h-full">
              <Image
                src="/images/nayajagir-mobile-v1.png"
                alt="NayaJagir job search experience displayed on a mobile phone"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover object-center transition-transform duration-700 hover:scale-[1.025] dark:brightness-[0.58] dark:saturate-75"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-apricot-wash/50 dark:to-card/70 lg:bg-gradient-to-r lg:from-apricot-wash/35 lg:via-transparent lg:to-transparent lg:dark:from-card/40" />
            </div>

            <div className="relative z-10 grid grid-cols-2 border-t border-foreground/10 bg-white/25 backdrop-blur-sm dark:bg-background/20 lg:grid-cols-1 lg:border-l lg:border-t-0">
              <div className="flex flex-col justify-center px-6 py-8 lg:px-8">
                <BriefcaseBusiness className="mb-4 h-7 w-7 text-primary" />
                <strong className="text-3xl font-bold text-foreground">1,200+</strong>
                <span className="mt-1 text-sm text-muted-foreground">Active jobs</span>
              </div>
              <div className="flex flex-col justify-center border-l border-foreground/10 px-6 py-8 lg:border-l-0 lg:border-t lg:px-8">
                <Building2 className="mb-4 h-7 w-7 text-primary" />
                <strong className="text-3xl font-bold text-foreground">500+</strong>
                <span className="mt-1 text-sm text-muted-foreground">Companies hiring</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
