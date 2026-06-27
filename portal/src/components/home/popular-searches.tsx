import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

type PopularSearch = {
  rank: number
  title: string
  href: string
  image: string
  accent: string
}

// Hardcoded for the initial homepage launch. This array can later be replaced
// by an API response without changing the section markup.
const popularSearches: PopularSearch[] = [
  {
    rank: 1,
    title: 'Jobs for Freshers',
    href: '/jobs?experienceLevel=FRESHER',
    image: '/images/popular-searches/fresher-jobs.png',
    accent: 'group-hover:border-apricot-wash',
  },
  {
    rank: 2,
    title: 'Remote Jobs',
    href: '/jobs?workLocationType=REMOTE',
    image: '/images/popular-searches/remote-jobs.png',
    accent: 'group-hover:border-sky-tile',
  },
  {
    rank: 3,
    title: 'Part-time Jobs',
    href: '/jobs?jobType=PART_TIME',
    image: '/images/popular-searches/part-time-jobs.png',
    accent: 'group-hover:border-mint-glow',
  },
  {
    rank: 4,
    title: 'Internships',
    href: '/jobs?jobType=INTERNSHIP',
    // TODO: replace with a dedicated internships image (reusing old asset as placeholder)
    image: '/images/popular-searches/jobs-for-women.png',
    accent: 'group-hover:border-sky-tile',
  },
  {
    rank: 5,
    title: 'Full-time Jobs',
    href: '/jobs?jobType=FULL_TIME',
    image: '/images/popular-searches/full-time-jobs.png',
    accent: 'group-hover:border-apricot-wash',
  },
  {
    rank: 6,
    title: 'Contract Jobs',
    href: '/jobs?jobType=CONTRACT',
    // TODO: replace with a dedicated contract-jobs image (placeholder for now)
    image: '/images/popular-searches/full-time-jobs.png',
    accent: 'group-hover:border-mint-glow',
  },
  {
    rank: 7,
    title: 'Hybrid Jobs',
    href: '/jobs?workLocationType=HYBRID',
    // TODO: replace with a dedicated hybrid-jobs image (placeholder for now)
    image: '/images/popular-searches/remote-jobs.png',
    accent: 'group-hover:border-sky-tile',
  },
]

export function PopularSearches() {
  return (
    <section className="border-y border-border/50 bg-warm-sand/45 py-20 lg:py-28 dark:bg-card/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex min-h-64 flex-col justify-center py-6 lg:pr-12">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Trending now
            </p>
            <h2 className="max-w-sm text-4xl font-bold leading-[1.05] tracking-tight text-foreground lg:text-6xl">
              Popular searches on DarbarJob
            </h2>
            <p className="mt-5 max-w-sm text-base leading-relaxed text-muted-foreground">
              Start with the roles job seekers across Nepal are exploring most.
            </p>
          </div>

          {popularSearches.map((search) => (
            <Link
              key={search.rank}
              href={search.href}
              aria-label={`Browse ${search.title}`}
              className="group relative isolate min-h-72 overflow-hidden rounded-[1.75rem] border border-border/70 bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Image
                src={search.image}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition duration-500 group-hover:scale-[1.03] dark:brightness-[0.42] dark:saturate-75"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/65 to-transparent dark:from-card dark:via-card/85 dark:to-transparent" />
              <div
                className={`absolute inset-0 rounded-[1.75rem] border border-transparent transition-colors duration-300 ${search.accent}`}
              />

              <div className="relative z-10 flex h-full min-h-72 max-w-[62%] flex-col p-7">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Trending at #{search.rank}
                </span>
                <h3 className="mt-5 text-2xl font-bold leading-tight text-foreground">
                  {search.title}
                </h3>
                <span className="mt-auto flex w-fit items-center gap-2 text-sm font-semibold text-primary">
                  Explore jobs
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
