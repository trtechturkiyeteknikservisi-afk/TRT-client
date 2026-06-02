import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable compression
  compress: true,

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
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

  // Tree-shake heavy packages
  experimental: {
    optimizePackageImports: [
      'framer-motion',
      'lucide-react',
      'swiper',
    ],
  },

  // Cache headers for static assets
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

  // Global Redirects for sitemaps and portfolio paths
  async redirects() {
    return [
      {
        source: '/:locale(ar|en|tr)/sitemap.xml',
        destination: '/sitemap.xml',
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
    ];
  },
};

export default withNextIntl(nextConfig);
