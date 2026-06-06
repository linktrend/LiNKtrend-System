#!/usr/bin/env node
/**
 * Verify LinkSites MVO manifest reports 13/13 succeeded stages.
 * Usage: node scripts/verify-mvo-13-stages.mjs [path-to-mvo-latest-run.json]
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { LINKSITES_MVO_STAGE_IDS } from "./lib/linksites-mvo-stage-ids.mjs";

const defaultPath = resolve(
  "LiNKdev/product/reports/linktrend-system/mvo-latest-run.json",
);
const manifestPath = resolve(process.argv[2] ?? process.env.MVO_LATEST_RUN_PATH ?? defaultPath);

if (!existsSync(manifestPath)) {
  console.error(`ERROR: MVO manifest not found: ${manifestPath}`);
  console.error("Run ./scripts/run-mvo-linksites-acceptance.sh or ./scripts/run-mvo-linksites-live.sh first.");
  process.exit(1);
}

let manifest;
try {
  manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
} catch (err) {
  console.error(`ERROR: Invalid JSON in ${manifestPath}:`, err.message);
  process.exit(1);
}

const timeline = manifest.phase_timeline ?? manifest.stages ?? [];
if (!Array.isArray(timeline) || timeline.length === 0) {
  console.error("ERROR: manifest missing phase_timeline (or stages) array");
  process.exit(1);
}

const byStage = new Map(timeline.map((row) => [row.stage_id, row]));
const missing = [];
const failed = [];

for (const stageId of LINKSITES_MVO_STAGE_IDS) {
  const row = byStage.get(stageId);
  if (!row) {
    missing.push(stageId);
    continue;
  }
  if (row.status !== "succeeded") {
    failed.push(`${stageId}:${row.status}`);
  }
}

const extra = timeline
  .map((r) => r.stage_id)
  .filter((id) => !LINKSITES_MVO_STAGE_IDS.includes(id));

if (missing.length > 0) {
  console.error("FAIL: missing stages:", missing.join(", "));
  process.exit(1);
}
if (failed.length > 0) {
  console.error("FAIL: non-succeeded stages:", failed.join(", "));
  process.exit(1);
}
if (manifest.status && manifest.status !== "succeeded") {
  console.error(`FAIL: run status is ${manifest.status}, expected succeeded`);
  process.exit(1);
}

console.log(`PASS: LinkSites MVO 13/13 stages succeeded`);
console.log(`  manifest: ${manifestPath}`);
console.log(`  run_id: ${manifest.run_id ?? "(none)"}`);
if (extra.length > 0) {
  console.log(`  note: ${extra.length} extra timeline row(s) ignored`);
}
