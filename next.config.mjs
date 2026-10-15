import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

// Keep TRT's CDN available when a hosting project omits the optional public override.
// Never copy storage credentials here.
const bunnyPullZone = process.env.BUNNY_PULL_ZONE_URL?.trim() || 'https://trtech-cdn.b-cdn.net';
const bunnyRemotePatterns = [];
if (bunnyPullZone) {
  const url = new URL(bunnyPullZone);
  if (url.protocol !== 'https:' || url.port || url.username || url.password || url.search || url.hash || url.pathname !== '/') {
    throw new Error('BUNNY_PULL_ZONE_URL must be an HTTPS origin without a path or query');
  }
  bunnyRemotePatterns.push({ protocol: 'https', hostname: url.hostname, port: '', pathname: '/**', search: '' });
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      ...bunnyRemotePatterns,
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    qualities: [70, 75],
    minimumCacheTTL: 86400,
  },

  experimental: {
    optimizePackageImports: [
      'framer-motion',
      'lucide-react',
      'swiper',
    ],
  },

  async headers() {
    return [
      {
        source: '/(.*)\\.(webp|png|jpg|jpeg|gif|svg|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/(.*)\\.(woff|woff2|ttf|otf)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
      {
        source: '/:locale(ar|en|tr)/sitemap.xml',
        destination: '/sitemap.xml',
        permanent: true,
      },
      {
        source: '/blog',
        destination: '/tr/blog',
        permanent: true,
      },
      {
        source: '/blog/:slug*',
        destination: '/tr/blog/:slug*',
        permanent: true,
      },
      {
        source: '/portfolio',
        destination: '/our-works',
        permanent: true,
      },
      {
        source: '/:locale(ar|en|tr)/portfolio',
        destination: '/:locale/our-works',
        permanent: true,
      },
      {
        source: '/:locale(ar|en|tr)/privacy',
        destination: '/:locale/policies/privacy',
        permanent: true,
      },
      {
        source: '/:locale(ar|en|tr)/terms',
        destination: '/:locale/policies/terms',
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
