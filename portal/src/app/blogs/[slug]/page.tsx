import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BlogDetailsClient } from '@/components/blog/blog-details-client'
import { api } from '@/lib/api'

interface BlogPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  try {
    const { slug } = await params
    const blog = await api.getBlog(slug)

    return {
      title: `${blog.title} | NayaJagir Blog`,
      description: blog.excerpt,
      keywords: ['career', 'job', 'advice', 'professional development', blog.title],
      authors: blog.author ? [{ name: blog.author }] : undefined,
      openGraph: {
        title: blog.title,
        description: blog.excerpt,
        type: 'article',
        locale: 'en_US',
        publishedTime: blog.createdAt,
        authors: blog.author ? [blog.author] : undefined,
        images: blog.featuredImage ? [{ url: blog.featuredImage }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: blog.title,
        description: blog.excerpt,
        images: blog.featuredImage ? [blog.featuredImage] : [],
      },
      alternates: {
        canonical: `/blogs/${blog.slug}`,
      },
    }
  } catch {
    return {
      title: 'Blog Post Not Found | NayaJagir',
      description: 'The blog post you are looking for could not be found.',
    }
  }
}

export default async function BlogPage({ params }: BlogPageProps) {
  try {
    const { slug } = await params
    const blog = await api.getBlog(slug)

    // Add structured data for SEO
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: blog.title,
      description: blog.excerpt,
      image: blog.featuredImage,
      author: blog.author ? {
        '@type': 'Person',
        name: blog.author,
      } : undefined,
      publisher: {
        '@type': 'Organization',
        name: 'NayaJagir',
        logo: {
          '@type': 'ImageObject',
          url: '/logo.png',
        },
      },
      datePublished: blog.createdAt,
      dateModified: blog.updatedAt,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `/blogs/${slug}`,
      },
    }

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <BlogDetailsClient blog={blog} />
      </>
    )
  } catch {
    notFound()
  }
}
