import { db, logAuditAction } from '../lib/db';
import { createError } from '../middleware/errorHandler';
import { generateUniqueSlug, createPaginationResult } from '../lib/utils';
import { sanitizeRichText, sanitizeTextOnly } from '../lib/sanitize';

type PaginationParams = { page: number; limit: number; skip: number };

// ── Public ──────────────────────────────────────────────────────

export const listBlogs = async (filters: any, { page, limit, skip }: PaginationParams) => {
  const where: any = { isPublished: true };

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { excerpt: { contains: filters.search, mode: 'insensitive' } },
      { content: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const [blogs, total] = await Promise.all([
    db.blog.findMany({
      where,
      select: {
        id: true, title: true, slug: true, excerpt: true,
        featuredImage: true, publishedAt: true, createdAt: true,
      },
      orderBy: { publishedAt: 'desc' },
      skip, take: limit,
    }),
    db.blog.count({ where }),
  ]);

  return createPaginationResult(blogs, total, page, limit);
};

export const getLatestBlogs = async (limit: number) => {
  const blogs = await db.blog.findMany({
    where: { isPublished: true },
    select: {
      id: true, title: true, slug: true, excerpt: true,
      featuredImage: true, publishedAt: true,
    },
    orderBy: { publishedAt: 'desc' },
    take: limit,
  });
  return blogs;
};

export const getBlogBySlug = async (slug: string) => {
  const blog = await db.blog.findUnique({
    where: { slug, isPublished: true },
  });
  if (!blog) {
    throw createError('Blog not found', 404);
  }

  const relatedBlogs = await db.blog.findMany({
    where: {
      isPublished: true,
      id: { not: blog.id },
    },
    select: {
      id: true, title: true, slug: true, excerpt: true,
      featuredImage: true, publishedAt: true,
    },
    take: 3,
    orderBy: { publishedAt: 'desc' },
  });

  return { blog, relatedBlogs };
};

// ── Admin ──────────────────────────────────────────────────────

export const adminListBlogs = async (filters: any, { page, limit, skip }: PaginationParams) => {
  const where: any = {};

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { excerpt: { contains: filters.search, mode: 'insensitive' } },
      { content: { contains: filters.search, mode: 'insensitive' } },
    ];
  }
  if (filters.isPublished !== undefined) {
    where.isPublished = filters.isPublished;
  }

  const [blogs, total] = await Promise.all([
    db.blog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip, take: limit,
    }),
    db.blog.count({ where }),
  ]);

  return createPaginationResult(blogs, total, page, limit);
};

export const adminCreateBlog = async (data: any, actorId: string, ip?: string, ua?: string) => {
  const blog = await db.blog.create({
    data: {
      title: sanitizeTextOnly(data.title),
      slug: generateUniqueSlug(data.title),
      content: sanitizeRichText(data.content),
      excerpt: data.excerpt ? sanitizeTextOnly(data.excerpt) : null,
      featuredImage: data.featuredImage || null,
      metaTitle: data.metaTitle || null,
      metaDescription: data.metaDescription || null,
      metaKeywords: data.metaKeywords || [],
      structuredData: data.structuredData || buildBlogStructuredData(data.title, data.excerpt, data.metaDescription),
      isPublished: data.isPublished || false,
      publishedAt: data.isPublished ? new Date() : null,
    },
  });

  logAuditAction({
    actorId, action: 'BLOG_CREATED', entity: 'Blog',
    entityId: blog.id, metadata: { title: blog.title },
    ipAddress: ip, userAgent: ua,
  }).catch(() => {});

  return blog;
};

export const adminGetBlogById = async (blogId: string) => {
  const blog = await db.blog.findUnique({ where: { id: blogId } });
  if (!blog) {
    throw createError('Blog not found', 404);
  }
  return blog;
};

export const adminUpdateBlog = async (blogId: string, data: any, actorId: string, ip?: string, ua?: string) => {
  const existing = await db.blog.findUnique({ where: { id: blogId } });
  if (!existing) {
    throw createError('Blog not found', 404);
  }

  const updateData: any = {};
  if (data.title !== undefined) {
    updateData.title = sanitizeTextOnly(data.title);
    if (data.title !== existing.title) {
      updateData.slug = generateUniqueSlug(data.title);
    }
  }
  if (data.content !== undefined) {
    updateData.content = sanitizeRichText(data.content);
  }
  if (data.excerpt !== undefined) {
    updateData.excerpt = data.excerpt ? sanitizeTextOnly(data.excerpt) : null;
  }
  if (data.featuredImage !== undefined) updateData.featuredImage = data.featuredImage;
  if (data.metaTitle !== undefined) updateData.metaTitle = sanitizeTextOnly(data.metaTitle || '') || null;
  if (data.metaDescription !== undefined) updateData.metaDescription = sanitizeTextOnly(data.metaDescription || '') || null;
  if (data.metaKeywords !== undefined) updateData.metaKeywords = data.metaKeywords;
  if (data.isPublished !== undefined) updateData.isPublished = data.isPublished;

  if (data.isPublished && !existing.publishedAt) {
    updateData.publishedAt = new Date();
  }
  if (data.isPublished === false) {
    updateData.publishedAt = null;
  }

  updateData.structuredData = buildBlogStructuredData(
    data.title || existing.title,
    data.excerpt || existing.excerpt || undefined,
    data.metaDescription || existing.metaDescription || undefined,
  );

  const blog = await db.blog.update({
    where: { id: blogId },
    data: updateData,
  });

  logAuditAction({
    actorId, action: 'BLOG_UPDATED', entity: 'Blog',
    entityId: blogId, metadata: { title: blog.title },
    ipAddress: ip, userAgent: ua,
  }).catch(() => {});

  return blog;
};

export const adminDeleteBlog = async (blogId: string, actorId: string, ip?: string, ua?: string) => {
  const blog = await db.blog.findUnique({ where: { id: blogId }, select: { id: true, title: true } });
  if (!blog) {
    throw createError('Blog not found', 404);
  }

  await db.blog.delete({ where: { id: blogId } });

  logAuditAction({
    actorId, action: 'BLOG_DELETED', entity: 'Blog',
    entityId: blogId, metadata: { title: blog.title },
    ipAddress: ip, userAgent: ua,
  }).catch(() => {});
};

// ── Helpers ────────────────────────────────────────────────────

const buildBlogStructuredData = (title: string, excerpt?: string, description?: string): Record<string, any> => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: title,
  description: excerpt || description || title,
  datePublished: new Date().toISOString(),
  author: { '@type': 'Organization', name: process.env.FROM_NAME || 'DarbarJob' },
});
