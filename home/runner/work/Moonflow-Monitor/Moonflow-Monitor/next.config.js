/** @type {import('next').NextConfig} */

const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https: http:;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https://placehold.co;
  connect-src *;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
`.replace(/\s{2,}/g, ' ').trim()

const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: ContentSecurityPolicy,
          },
        ],
      },
    ]
  },
};

module.exports = nextConfig;
