/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  images: {
    domains: ['images.unsplash.com', 'a.espncdn.com', 'assets.nhle.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'a.espncdn.com',
        port: '',
        pathname: '/i/headshots/nfl/players/full/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.nhle.com',
        port: '',
        pathname: '/mugs/nhl/**',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig
