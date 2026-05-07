/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/dmuniz-dashboard',
  assetPrefix: '/dmuniz-dashboard',
  images: { unoptimized: true },
  trailingSlash: true,
};

module.exports = nextConfig;
