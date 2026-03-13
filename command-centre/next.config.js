/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, '.'),
      '@/lib': require('path').resolve(__dirname, './lib'),
      '@/components': require('path').resolve(__dirname, './components'),
    };
    return config;
  },
};

module.exports = nextConfig;
