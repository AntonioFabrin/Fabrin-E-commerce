/** @type {import('next').NextConfig} */
const nextConfig = {
  // Desabilita exportação estática — necessário pois o app usa hooks de cliente
  // e contextos dinâmicos (CartContext, useAuth) incompatíveis com pre-render
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },

  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/:path*`,
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
};

export default nextConfig;
