import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    // a stray package-lock.json lives further up the tree; keep the root here
    root: __dirname,
  },
};

export default nextConfig;
