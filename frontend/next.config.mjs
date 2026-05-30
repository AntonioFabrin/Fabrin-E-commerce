/** @type {import('next').NextConfig} */
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const resolveBackendUrl = () => {
  const configuredUrl = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL;
  if (configuredUrl && /^https?:\/\//i.test(configuredUrl)) {
    return configuredUrl;
  }
  return 'http://127.0.0.1:3333';
};

const backendUrl = resolveBackendUrl();
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
  allowedDevOrigins: ['localhost', '127.0.0.1', '26.36.11.61'],

  turbopack: {
    root: __dirname,
  },

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${backendUrl}/uploads/:path*`,
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
