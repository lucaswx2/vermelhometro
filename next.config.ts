import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  redirects: async () => [{ source: '/como-calculamos', destination: '/transparencia', permanent: true }],
}

export default nextConfig
