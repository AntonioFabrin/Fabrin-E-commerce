/** @type {import('next').NextConfig} */
const nextConfig = {
  // Em produção, as chamadas /api/* vão para o backend hospedado no Railway.
  // Em desenvolvimento, fazem proxy para localhost:3333.
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/:path*`,
      },
    ];
  },

  // Permite imagens vindas do backend (uploads)
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
