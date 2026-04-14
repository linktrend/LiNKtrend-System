import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@linktrend/ui",
    "@linktrend/shared-config",
    "@linktrend/shared-types",
    "@linktrend/db",
    "@linktrend/observability",
    "@linktrend/linklogic-sdk",
  ],
};

export default nextConfig;
