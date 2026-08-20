import type { MetadataRoute } from 'next';

const SITE_URL = 'https://www.trtservis.com';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const LOCALES = ['ar', 'en', 'tr'] as const;

const STATIC_ROUTES: Array<{
  path: string;
  priority: number;
  changefreq: MetadataRoute.Sitemap[0]['changeFrequency'];
}> = [
  { path: '', priority: 1.0, changefreq: 'daily' },
  { path: '/about-us', priority: 0.8, changefreq: 'monthly' },
  { path: '/contact', priority: 0.9, changefreq: 'monthly' },
  { path: '/our-works', priority: 0.8, changefreq: 'weekly' },
  { path: '/blog', priority: 0.8, changefreq: 'daily' },
  { path: '/policies', priority: 0.5, changefreq: 'yearly' },
];

const SERVICE_TYPES = [
  'phone',
  'laptop',
  'robot',
  'watch',
  'tablet',
  'headphones',
];

const POLICY_TYPES = [
  'privacy',
  'terms',
  'kvkk',
  'warranty',
  'shipping',
  'custom',
];

const TEST_SLUGS = ['test', 'fgrt'];

type BlogEntry = {
  slug: string;
  updatedAt?: string;
  date?: string;
};

async function fetchBlogs(): Promise<BlogEntry[]> {
  try {
    const res = await fetch(`${API_URL}/blogs`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      console.error(`[Sitemap] Blogs request failed: ${res.status}`);
      return [];
    }

    const data = await res.json();

    if (Array.isArray(data)) {
      return data;
    }

    if (data && Array.isArray(data.blogs)) {
      return data.blogs;
    }

    return [];
  } catch (error) {
    console.error('[Sitemap] Failed to fetch blogs:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  const addRoute = (
    path: string,
    options: {
      priority?: number;
      changeFrequency?: MetadataRoute.Sitemap[0]['changeFrequency'];
      lastModified?: string;
    } = {}
  ) => {
    for (const locale of LOCALES) {
      entries.push({
        url: `${SITE_URL}/${locale}${path}`,
        ...(options.lastModified
          ? { lastModified: options.lastModified }
          : {}),
        changeFrequency: options.changeFrequency || 'monthly',
        priority: options.priority ?? 0.8,
      });
    }
  };

  for (const route of STATIC_ROUTES) {
    addRoute(route.path, {
      priority: route.priority,
      changeFrequency: route.changefreq,
    });
  }

  for (const service of SERVICE_TYPES) {
    addRoute(`/services/${service}`, {
      priority: 0.9,
      changeFrequency: 'monthly',
    });
  }

  for (const policy of POLICY_TYPES) {
    addRoute(`/policies/${policy}`, {
      priority: 0.5,
      changeFrequency: 'yearly',
    });
  }

  const blogs = await fetchBlogs();

  for (const blog of blogs) {
    if (
      !blog.slug ||
      TEST_SLUGS.includes(blog.slug.toLowerCase())
    ) {
      continue;
    }

    addRoute(`/blog/${blog.slug}`, {
      priority: 0.7,
      changeFrequency: 'weekly',
      lastModified: blog.updatedAt || blog.date,
    });
  }

  return entries;
}
