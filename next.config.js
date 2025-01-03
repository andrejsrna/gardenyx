/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    WP_API_URL: process.env.WP_API_URL,
  },
  images: {
    domains: ['najsilnejsiaklbovavyziva.sk', 'cdn.najsilnejsiaklbovavyziva.sk'],
  },
}

module.exports = nextConfig 