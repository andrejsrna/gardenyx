import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    WP_API_URL: process.env.WP_API_URL,
    REDIS_URL: process.env.REDIS_URL,
  },
  images: {
    domains: ['najsilnejsiaklbovavyziva.sk', 'cdn.najsilnejsiaklbovavyziva.sk'],
  },
  experimental: {
    serverActions: true,
    runtime: 'edge',
    allowedHeaders: ['x-forwarded-for', 'cf-connecting-ip'],
    env: ['REDIS_URL', 'WP_API_URL', 'WC_CONSUMER_KEY', 'WC_CONSUMER_SECRET', 'WORDPRESS_URL'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
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
          /*
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self' https:",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.google-analytics.com https://*.googletagmanager.com https://connect.facebook.net https://*.facebook.net https://maps.googleapis.com https://js.stripe.com https://*.sentry.io https://cdn.jsdelivr.net/npm/@widgetbot/crate@^3",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net/npm/@widgetbot/crate@^3",
              "img-src 'self' data: blob: https://*.stripe.com https://*.facebook.com https://www.facebook.com https://facebook.com https: https://www.google-analytics.com https://www.googletagmanager.com",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://*.google-analytics.com https://*.googletagmanager.com https://connect.facebook.net https://*.facebook.net https://maps.googleapis.com https://api.stripe.com https://*.sentry.io wss://*.widgetbot.io https://api.packetery.com https://najsilnejsiaklbovavyziva.sk",
              "frame-src 'self' https://js.stripe.com https://www.facebook.com https://facebook.com https://widgetbot.io",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'"
            ].join('; ')
          },
          */
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ];
  },
}

const sentryWebpackPluginOptions = {
  silent: true,
};

export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);
