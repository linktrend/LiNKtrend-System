#!/usr/bin/env node
/**
 * Prove LinkSkills lease + audit for Plane and Zulip (wrapper).
 *
 * Usage:
 *   LINKSKILLS_LIVE_OPS=1 pnpm --filter @linktrend/linkskills-logic-engine prove:live
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const logicEngine = path.join(root, "LiNKskills/services/logic-engine");
const result = spawnSync("pnpm", ["prove:live"], {
  cwd: logicEngine,
  stdio: "inherit",
  env: { ...process.env, LINKSKILLS_LIVE_OPS: process.env.LINKSKILLS_LIVE_OPS ?? "1" },
});
process.exit(result.status ?? 1);
