import path from "node:path";

import dotenv from "dotenv";
import type { NextConfig } from "next";

// Monorepo: `next dev` cwd is LiNKaios/linkaios-web; repo `.env` is two levels up.
dotenv.config({ path: path.resolve(process.cwd(), "..", "..", ".env") });

const nextConfig: NextConfig = {
  /** Docker / `next start` in minimal images: trace server deps into `.next/standalone`. */
  output: "standalone",
  /** Monorepo: trace workspace packages from repo root (matches Docker pruned layout under `/app`). */
  outputFileTracingRoot: path.join(process.cwd(), "../.."),
  devIndicators: false,
  async redirects() {
    return [
      { source: "/missions", destination: "/projects", permanent: false },
      { source: "/missions/:path*", destination: "/projects/:path*", permanent: false },
      { source: "/modules/my-modules", destination: "/suites/my-suites", permanent: false },
      { source: "/modules/marketplace", destination: "/suites/marketplace", permanent: false },
      { source: "/modules/project-types/:path*", destination: "/suites/project-types/:path*", permanent: false },
      { source: "/modules/linkapps/:path*", destination: "/suites/linkapps/:path*", permanent: false },
      { source: "/modules/:suiteId", destination: "/suites/:suiteId", permanent: false },
      { source: "/modules", destination: "/suites/my-suites", permanent: false },
    ];
  },
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
