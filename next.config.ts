import type { NextConfig } from "next";
import { resolve } from "node:path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  distDir: ".next-build",
  turbopack: { root: resolve(".") },
};

export default nextConfig;

