const fs = require('fs');
const path = require('path');

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://trtservis.com';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const locales = ['ar', 'en', 'tr'];

async function generateSitemap() {
  const urls = [];

  const addRoute = (route, priority = 0.8) => {
    locales.forEach((locale) => {
      urls.push({
        loc: `${baseUrl}/${locale}${route}`,
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: priority
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
        blogs.forEach((blog) => {
          if (blog.slug) {
            addRoute(`/blog/${blog.slug}`, 0.7);
          }
        });
      }
    }
  } catch (error) {
    console.error('Sitemap Generator: Failed to fetch blogs from API', error.message);
  }

  // Construct XML
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  urls.forEach(url => {
    xml += `  <url>\n`;
    xml += `    <loc>${url.loc}</loc>\n`;
    xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
    xml += `    <priority>${url.priority.toFixed(1)}</priority>\n`;
    xml += `  </url>\n`;
  });

  xml += `</urlset>\n`;

  const publicDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const outputPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(outputPath, xml, 'utf8');
  console.log(`Successfully generated and wrote sitemap.xml to ${outputPath} (${urls.length} URLs)`);
}

generateSitemap().catch(err => {
  console.error('Error generating sitemap:', err);
  process.exit(1);
});
