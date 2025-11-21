import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // typescript: {
  //   ignoreBuildErrors: true, 
  // },
  basePath: '/ecommerce',
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3341',
        pathname: '/public/**',
      },
      {
        protocol: 'http',
        hostname: '177.44.191.62',
        port: '3341',
        pathname: '/public/**',
      },
    ],
  },
};

export default nextConfig;
