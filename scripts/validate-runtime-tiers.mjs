#!/usr/bin/env node
/**
 * Validate suite issue template runtime_tier declarations (Wave 5.4).
 * Run: node scripts/validate-runtime-tiers.mjs
 */

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const result = spawnSync(
  "pnpm",
  [
    "--filter",
    "@linktrend/linkaios-web",
    "exec",
    "vitest",
    "run",
    "src/lib/kernel/fleet/runtime-tier.test.ts",
  ],
  { cwd: root, stdio: "inherit", env: process.env },
);

process.exit(result.status === 0 ? 0 : 1);
