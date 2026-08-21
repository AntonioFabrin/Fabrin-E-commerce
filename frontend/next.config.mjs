/** @type {import('next').NextConfig} */
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const resolveLegacyBackendUrl = () => {
  const configuredUrl = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL;
  if (configuredUrl && /^https?:\/\//i.test(configuredUrl)) {
    return configuredUrl;
  }
  return 'http://127.0.0.1:3333';
};

const resolveIdentityBackendUrl = () => {
  const configuredUrl = process.env.IDENTITY_BACKEND_INTERNAL_URL;
  if (configuredUrl && /^https?:\/\//i.test(configuredUrl)) {
    return configuredUrl;
  }
  return 'http://127.0.0.1:8080';
};

const resolveCatalogBackendUrl = () => {
  const configuredUrl = process.env.CATALOG_BACKEND_INTERNAL_URL
    || process.env.IDENTITY_BACKEND_INTERNAL_URL;
  if (configuredUrl && /^https?:\/\//i.test(configuredUrl)) {
    return configuredUrl;
  }
  return 'http://127.0.0.1:8080';
};

const legacyBackendUrl = resolveLegacyBackendUrl();
const identityBackendUrl = resolveIdentityBackendUrl();
const catalogBackendUrl = resolveCatalogBackendUrl();
const apiUrl = new URL(legacyBackendUrl);

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
        source: '/api/register',
        destination: `${identityBackendUrl}/api/register`,
      },
      {
        source: '/api/login',
        destination: `${identityBackendUrl}/api/login`,
      },
      {
        source: '/api/me',
        destination: `${identityBackendUrl}/api/me`,
      },
      {
        source: '/api/users',
        destination: `${identityBackendUrl}/api/users`,
      },
      {
        source: '/api/users/:path*',
        destination: `${identityBackendUrl}/api/users/:path*`,
      },
      {
        source: '/api/products',
        destination: `${catalogBackendUrl}/api/products`,
      },
      {
        source: '/api/products/:path*',
        destination: `${catalogBackendUrl}/api/products/:path*`,
      },
      {
        source: '/uploads/products/:path*',
        destination: `${catalogBackendUrl}/uploads/products/:path*`,
      },
      {
        source: '/api/:path*',
        destination: `${legacyBackendUrl}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${legacyBackendUrl}/uploads/:path*`,
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
