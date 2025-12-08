import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
      {
        protocol: 'http',
        hostname: 'liquiditybars.com',
        port: '',
        pathname: '/canada/backend/assets/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'liquiditybars.com',
        port: '',
        pathname: '/canada/backend/assets/upload/**',
      },
    ],
  },
};

export default nextConfig;
