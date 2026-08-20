import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogPostClient, { BlogPostData } from './blog-post-client';

const SITE_URL = 'https://www.trtservis.com';
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

type BlogPost = BlogPostData & {
  updatedAt?: string;
  description?: string;
};

function isBlogPost(data: unknown): data is BlogPost {
  return Boolean(
    data &&
      typeof data === 'object' &&
      'title' in data &&
      typeof data.title === 'string' &&
      'content' in data &&
      typeof data.content === 'string'
  );
}

function hasBlogList(
  data: unknown
): data is { blogs: unknown[] } {
  return Boolean(
    data &&
      typeof data === 'object' &&
      'blogs' in data &&
      Array.isArray(data.blogs)
  );
}

async function getBlog(
  slug: string,
  locale: string
): Promise<BlogPost | null> {
  try {
    const response = await fetch(
      `${API_URL}/blogs/${encodeURIComponent(slug)}?locale=${locale}`,
      {
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(5000),
      }
    );

    if (response.ok) {
      const data = await response.json();

      if (isBlogPost(data)) {
        return data;
      }
    }
  } catch (error) {
    console.error('Failed to fetch blog by slug', error);
  }

  try {
    const response = await fetch(
      `${API_URL}/blogs?locale=${locale}`,
      {
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Blogs fallback request failed with status ${response.status}`
      );
    }

    const data: unknown = await response.json();
    const blogs: unknown[] = Array.isArray(data)
      ? data
      : hasBlogList(data)
        ? data.blogs
        : [];

    return (
      blogs.find(
        (blog): blog is BlogPost =>
          isBlogPost(blog) && blog.slug === slug
      ) || null
    );
  } catch (error) {
    throw new Error('Failed to fetch blog post', { cause: error });
  }
}

function createDescription(blog: BlogPost): string {
  if (blog.description) {
    return blog.description.trim().slice(0, 160);
  }

  if (!blog.content) {
    return blog.title;
  }

  return blog.content
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const blog = await getBlog(slug, locale);

  if (!blog) {
    return {
      title: 'Post Not Found | TRT Teknik Servis',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const description = createDescription(blog);
  const canonicalPath = `/${locale}/blog/${slug}`;

  return {
    title: `${blog.title} | TRT Teknik Servis`,
    description,

    alternates: {
      canonical: canonicalPath,
      languages: {
        tr: `/tr/blog/${slug}`,
        en: `/en/blog/${slug}`,
        ar: `/ar/blog/${slug}`,
        'x-default': `/tr/blog/${slug}`,
      },
    },

    openGraph: {
      type: 'article',
      title: blog.title,
      description,
      url: `${SITE_URL}${canonicalPath}`,
      images: blog.image
        ? [
            {
              url: blog.image,
              alt: blog.title,
            },
          ]
        : undefined,
    },

    twitter: {
      card: 'summary_large_image',
      title: blog.title,
      description,
      images: blog.image ? [blog.image] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}) {
  const { locale, slug } = await params;

  const blog = await getBlog(slug, locale);

  if (!blog) {
    notFound();
  }

  const canonicalUrl =
    `${SITE_URL}/${locale}/blog/${slug}`;

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    description: createDescription(blog),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    url: canonicalUrl,
    ...(blog.image
      ? {
          image: [blog.image],
        }
      : {}),
    ...(blog.date
      ? {
          datePublished: blog.date,
        }
      : {}),
    ...(blog.updatedAt
      ? {
          dateModified: blog.updatedAt,
        }
      : {}),
    author: {
      '@type': 'Organization',
      name: blog.author || 'TRT Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'TRT Technical Service',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/day-logo.png`,
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd).replace(
            /</g,
            '\\u003c'
          ),
        }}
      />

      <BlogPostClient blog={blog} />
    </>
  );
}
