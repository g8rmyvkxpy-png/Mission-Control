/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['ppventures.tech'],
  },
  async redirects() {
    return [
      {
        source: '/services',
        destination: '/pricing',
        permanent: true,
      },
      {
        source: '/automation',
        destination: '/',
        permanent: true,
      },
      {
        source: '/ai-agents',
        destination: '/agents',
        permanent: true,
      },
      {
        source: '/careers',
        destination: '/about',
        permanent: true,
      },
      {
        source: '/mission-control',
        destination: '/pricing',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
