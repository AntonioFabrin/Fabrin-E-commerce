/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        // O que você digita no frontend
        source: '/api/:path*', 
        // Para onde ele vai no backend (sem o /api no meio)
        destination: 'http://localhost:3333/:path*', 
      },
    ]
  },
};

export default nextConfig;