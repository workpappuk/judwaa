import type { NextConfig } from "next";

const apiTargets = {
  development: "http://localhost:8080",
  staging: "http://backend:8080",
  production: "http://backend:8080",
} as const;


const proxyTarget = apiTargets[process.env.NODE_ENV as keyof typeof apiTargets] 

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${proxyTarget}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
