import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @twy/core ships raw TypeScript from the monorepo; let Next compile it.
  transpilePackages: ["@twy/core"],
};

export default nextConfig;
