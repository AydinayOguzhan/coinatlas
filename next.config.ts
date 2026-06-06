import type { NextConfig } from "next";

const maxUploadSizeMb = Number(process.env.MAX_UPLOAD_SIZE_MB ?? "10");

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: `${maxUploadSizeMb}mb`
    }
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**"
      }
    ]
  }
};

export default nextConfig;
