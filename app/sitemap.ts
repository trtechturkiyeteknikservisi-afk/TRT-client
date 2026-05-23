import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://trtservis.com';
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  
  const locales = ['ar', 'en', 'tr'];
  const sitemapData: MetadataRoute.Sitemap = [];

  const addRoute = (route: string, priority = 0.8) => {
    locales.forEach((locale) => {
      sitemapData.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority,
      });
    });
  };

  // Static Routes
  const staticRoutes = [
    { path: '', priority: 1.0 },
    { path: '/about-us', priority: 0.8 },
    { path: '/contact', priority: 0.9 },
    { path: '/portfolio', priority: 0.8 },
    { path: '/blog', priority: 0.8 },
    { path: '/services', priority: 0.9 },
    { path: '/policies', priority: 0.5 },
  ];

  staticRoutes.forEach(route => addRoute(route.path, route.priority));

  // Dynamic Services
  const services = ['phone', 'laptop', 'robot', 'watch', 'tablet', 'headphones'];
  services.forEach(service => addRoute(`/services/${service}`, 0.9));

  // Dynamic Policies
  const policies = ['privacy', 'terms', 'kvkk', 'warranty', 'shipping', 'custom'];
  policies.forEach(policy => addRoute(`/policies/${policy}`, 0.5));

  // Dynamic Blogs
  try {
    const res = await fetch(`${API_URL}/blogs`);
    if (res.ok) {
      const blogs = await res.json();
      if (Array.isArray(blogs)) {
        blogs.forEach((blog: any) => {
          if (blog.slug) {
            addRoute(`/blog/${blog.slug}`, 0.7);
          }
        });
      }
    }
  } catch (error) {
    console.error('Sitemap: Failed to fetch blogs', error);
  }

  return sitemapData;
}
