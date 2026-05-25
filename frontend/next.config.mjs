/** @type {import('next').NextConfig} */
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendUrl = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
const apiUrl = new URL(backendUrl);

const apiRemotePattern = {
  protocol: apiUrl.protocol.replace(':', ''),
  hostname: apiUrl.hostname,
  pathname: '/uploads/**',
};

if (apiUrl.port) {
  apiRemotePattern.port = apiUrl.port;
}

const nextConfig = {
  turbopack: {
    root: __dirname,
  },

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },

  images: {
    remotePatterns: [
      apiRemotePattern,
    ],
  },
};

export default nextConfig;
