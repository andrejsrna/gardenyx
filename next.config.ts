import bundleAnalyzer from '@next/bundle-analyzer';
import { withSentryConfig } from '@sentry/nextjs';
import type { Configuration } from 'webpack';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const keepProductionConsole =
  process.env.NODE_ENV === 'production' &&
  process.env.ENABLE_RUNTIME_DEBUG_LOGS === 'true';

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    WP_API_URL: process.env.WP_API_URL,
  },
  images: {
    remotePatterns: [
      {
        hostname: 'www.gardenyx.eu',
        protocol: 'https' as const,
      },
      {
        hostname: 'cdn.gardenyx.eu',
        protocol: 'https' as const,
      },
      {
        hostname: '*.r2.cloudflarestorage.com',
        protocol: 'https' as const,
      },
      {
        hostname: 'www.facebook.com',
        protocol: 'https' as const,
      },
    ],
  },
  experimental: {
    serverActions: {},
  },
  async headers() {
    return [
      {
        source: '/logo.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ];
  },
  reactStrictMode: true,
  compiler: {
    // Keep runtime logs available when production debugging is explicitly enabled.
    removeConsole: process.env.NODE_ENV === 'production' && !keepProductionConsole,
  },
  webpack: (config: Configuration) => {
    config.infrastructureLogging = {
      ...(config.infrastructureLogging || {}),
      level: 'error',
    };
    return config;
  },
}

const sentryWebpackPluginOptions = {
  silent: true,
};

export default withNextIntl(withBundleAnalyzer(withSentryConfig(nextConfig, sentryWebpackPluginOptions)));
