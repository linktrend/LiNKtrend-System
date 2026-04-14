import path from "node:path";

import dotenv from "dotenv";
import type { NextConfig } from "next";

// Monorepo: `next dev` cwd is apps/linkaios-web; repo `.env` is two levels up.
dotenv.config({ path: path.resolve(process.cwd(), "..", "..", ".env") });

const nextConfig: NextConfig = {
  transpilePackages: [
    "@linktrend/ui",
    "@linktrend/shared-config",
    "@linktrend/shared-types",
    "@linktrend/db",
    "@linktrend/observability",
    "@linktrend/linklogic-sdk",
    "@linktrend/auth",
  ],
};

export default nextConfig;
