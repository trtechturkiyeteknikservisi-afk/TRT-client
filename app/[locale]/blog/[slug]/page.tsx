import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogPostClient, { BlogPostData } from './blog-post-client';

const SITE_URL = 'https://www.trtservis.com';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const revalidate = 300;

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

function normalizeSlug(slug: string): string {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

function buildBlogUrl(
  locale: string,
  slug: string
): string {
  return `${SITE_URL}/${locale}/blog/${slug}`;
}

async function getBlog(
  slug: string,
  locale: string
): Promise<BlogPost | null> {
  const normalizedSlug = normalizeSlug(slug);

  /*
   * First attempt:
   * Fetch the requested blog directly by slug.
   */
  try {
    const response = await fetch(
      `${API_URL}/blogs/${encodeURIComponent(
        normalizedSlug
      )}?locale=${encodeURIComponent(locale)}`,
      {
        next: {
          revalidate: 300,
        },
      }
    );

    if (response.ok) {
      const data: unknown = await response.json();

      if (isBlogPost(data)) {
        return data;
      }

      console.error(
        'Invalid blog response format:',
        normalizedSlug,
        locale
      );
    } else {
      console.error(
        'Blog endpoint returned status:',
        response.status,
        normalizedSlug,
        locale
      );
    }
  } catch (error) {
    console.error(
      'Failed to fetch blog by slug:',
      normalizedSlug,
      locale,
      error
    );
  }

  /*
   * Fallback:
   * Fetch the blog list and find the requested slug.
   *
   * This also helps with older URLs containing
   * special characters such as ":".
   */
  try {
    const response = await fetch(
      `${API_URL}/blogs?locale=${encodeURIComponent(locale)}`,
      {
        next: {
          revalidate: 300,
        },
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

    const blog = blogs.find(
      (item): item is BlogPost =>
        isBlogPost(item) &&
        typeof item.slug === 'string' &&
        normalizeSlug(item.slug) === normalizedSlug
    );

    return blog || null;
  } catch (error) {
    console.error(
      'Failed to fetch blog list fallback:',
      normalizedSlug,
      locale,
      error
    );

    throw new Error(
      'Failed to fetch blog post from API',
      {
        cause: error,
      }
    );
  }
}

function createDescription(
  blog: BlogPost
): string {
  if (blog.description) {
    return blog.description
      .trim()
      .slice(0, 160);
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
  const {
    locale,
    slug: rawSlug,
  } = await params;

  const slug = normalizeSlug(rawSlug);

  /*
   * Build canonical and hreflang URLs independently
   * from the API response.
   */
  const canonicalUrl =
    buildBlogUrl(locale, slug);

  const turkishUrl =
    buildBlogUrl('tr', slug);

  const englishUrl =
    buildBlogUrl('en', slug);

  const arabicUrl =
    buildBlogUrl('ar', slug);

  const alternates: Metadata['alternates'] = {
    canonical: canonicalUrl,

    languages: {
      tr: turkishUrl,
      en: englishUrl,
      ar: arabicUrl,
      'x-default': turkishUrl,
    },
  };

  let blog: BlogPost | null;

  try {
    blog = await getBlog(
      slug,
      locale
    );
  } catch (error) {
    /*
     * Do not allow a temporary API problem during
     * metadata generation to crash the entire page.
     */
    console.error(
      'Metadata blog fetch failed:',
      slug,
      locale,
      error
    );

    return {
      title: 'TRT Teknik Servis',

      alternates,

      openGraph: {
        type: 'website',
        title: 'TRT Teknik Servis',
        url: canonicalUrl,
      },
    };
  }

  if (!blog) {
    return {
      title:
        'Post Not Found | TRT Teknik Servis',

      alternates,

      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const description =
    createDescription(blog);

  return {
    title:
      `${blog.title} | TRT Teknik Servis`,

    description,

    alternates,

    openGraph: {
      type: 'article',

      title:
        blog.title,

      description,

      url:
        canonicalUrl,

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
      card:
        'summary_large_image',

      title:
        blog.title,

      description,

      images: blog.image
        ? [blog.image]
        : undefined,
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
  const {
    locale,
    slug: rawSlug,
  } = await params;

  const slug =
    normalizeSlug(rawSlug);

  const blog =
    await getBlog(
      slug,
      locale
    );

  if (!blog) {
    notFound();
  }

  const canonicalUrl =
    buildBlogUrl(
      locale,
      slug
    );

  const articleJsonLd = {
    '@context':
      'https://schema.org',

    '@type':
      'BlogPosting',

    headline:
      blog.title,

    description:
      createDescription(blog),

    mainEntityOfPage: {
      '@type':
        'WebPage',

      '@id':
        canonicalUrl,
    },

    url:
      canonicalUrl,

    ...(blog.image
      ? {
          image: [
            blog.image,
          ],
        }
      : {}),

    ...(blog.date
      ? {
          datePublished:
            blog.date,
        }
      : {}),

    ...(blog.updatedAt
      ? {
          dateModified:
            blog.updatedAt,
        }
      : {}),

    author: {
      '@type':
        'Organization',

      name:
        blog.author ||
        'TRT Team',
    },

    publisher: {
      '@type':
        'Organization',

      name:
        'TRT Technical Service',

      logo: {
        '@type':
          'ImageObject',

        url:
          `${SITE_URL}/day-logo.png`,
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              articleJsonLd
            ).replace(
              /</g,
              '\\u003c'
            ),
        }}
      />

      <BlogPostClient
        blog={blog}
      />
    </>
  );
}
