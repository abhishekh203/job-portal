import { api } from '@/lib/api'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.darbarjob.com'

export default async function sitemap() {
  const [jobsRes, blogsRes] = await Promise.allSettled([
    api.getJobs({}, 1, 1000),
    api.getBlogs(1, 1000),
  ])

  const jobs = jobsRes.status === 'fulfilled' ? jobsRes.value.jobs || [] : []
  const blogs = blogsRes.status === 'fulfilled' ? blogsRes.value.blogs || [] : []

  const staticPages = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1 },
    { url: `${BASE_URL}/jobs`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${BASE_URL}/blogs`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
  ]

  const jobPages = jobs.map((job: any) => ({
    url: `${BASE_URL}/jobs/${job.slug}`,
    lastModified: new Date(job.updatedAt || job.createdAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const blogPages = blogs.map((blog: any) => ({
    url: `${BASE_URL}/blogs/${blog.slug}`,
    lastModified: new Date(blog.updatedAt || blog.publishedAt || blog.createdAt),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...jobPages, ...blogPages]
}