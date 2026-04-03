import bundleAnalyzer from '@next/bundle-analyzer';
import { withSentryConfig } from '@sentry/nextjs';
import type { Configuration } from 'webpack';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    WP_API_URL: process.env.WP_API_URL,
  },
  images: {
    remotePatterns: [
      {
        hostname: 'najsilnejsiaklbovavyziva.sk',
        protocol: 'https' as const,
      },
      {
        hostname: 'cdn.najsilnejsiaklbovavyziva.sk',
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
    // Strip all console.* calls in production builds
    removeConsole: process.env.NODE_ENV === 'production',
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

export default withBundleAnalyzer(withSentryConfig(nextConfig, sentryWebpackPluginOptions));
