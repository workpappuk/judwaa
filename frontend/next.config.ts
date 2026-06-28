import type { NextConfig } from "next";

const apiTargets = {
  development: "http://localhost:8080",
  staging: "https://staging-api.yourdomain.com",
  production: "https://api.yourdomain.com",
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
