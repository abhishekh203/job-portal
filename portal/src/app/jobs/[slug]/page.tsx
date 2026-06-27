import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { JobDetailsClient } from '@/components/jobs/job-details-client'
import { api } from '@/lib/api'

interface JobPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: JobPageProps): Promise<Metadata> {
  const resolvedParams = await params
  console.log(resolvedParams.slug)
  try {
    const jobData = await api.getJob(resolvedParams.slug)
    const job = jobData?.job
    console.log(job)

    return {
      title: `${job.title} at ${job.companyName} | DarbarJob`,
      description: job.description.replace(/<[^>]*>/g, '').substring(0, 160),
      keywords: [job.title, job.companyName, job.category, job.location, 'job', 'career'],
      openGraph: {
        title: `${job.title} at ${job.companyName}`,
        description: job.description.replace(/<[^>]*>/g, '').substring(0, 160),
        type: 'article',
        locale: 'en_US',
        images: job.companyLogo ? [{ url: job.companyLogo }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${job.title} at ${job.companyName}`,
        description: job.description.replace(/<[^>]*>/g, '').substring(0, 160),
        images: job.companyLogo ? [job.companyLogo] : [],
      },
      alternates: {
        canonical: `/jobs/${job.slug}`,
      },
    }
  } catch {
    return {
      title: 'Job Not Found | DarbarJob',
      description: 'The job you are looking for could not be found.',
    }
  }
}

export default async function JobPage({ params }: JobPageProps) {
  try {
    const resolvedParams = await params
    const jobData = await api.getJob(resolvedParams.slug)
    console.log(jobData?.hasApplied)
    const job = jobData?.job

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'JobPosting',
      title: job.title,
      description: job.description.replace(/<[^>]*>/g, ''),
      identifier: {
        '@type': 'PropertyValue',
        name: job.companyName,
        value: job.id,
      },
      datePosted: job.createdAt,
      validThrough: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      employmentType: job.jobType.toUpperCase().replace('-', '_'),
      hiringOrganization: {
        '@type': 'Organization',
        name: job.companyName,
        logo: job.companyLogo,
      },
      jobLocation: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressLocality: job.location,
        },
      },
      baseSalary: job.salaryMin && job.salaryMax ? {
        '@type': 'MonetaryAmount',
        currency: 'NPR',
        value: {
          '@type': 'QuantitativeValue',
          minValue: job.salaryMin,
          maxValue: job.salaryMax,
          unitText: 'YEAR',
        },
      } : undefined,
      workHours: job.jobType === 'FULL_TIME' ? '40 hours per week' : undefined,
    }

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <JobDetailsClient job={job} hasApplied={jobData?.hasApplied} />
      </>
    )
  } catch {
    notFound()
  }
}
