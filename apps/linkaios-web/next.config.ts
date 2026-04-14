import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@linktrend/ui",
    "@linktrend/shared-config",
    "@linktrend/shared-types",
    "@linktrend/db",
    "@linktrend/observability",
  ],
};

export default nextConfig;
