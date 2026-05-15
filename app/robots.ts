import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/trt-secure-panel-2026/', '/api/'],
    },
    sitemap: 'https://elektrofoni.com.tr/sitemap.xml',
  };
}
