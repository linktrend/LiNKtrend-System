#!/usr/bin/env node
/**
 * Proof: bootstrap one Calusa LinkSites project in live Plane.
 * Usage (from repo root, with .env or deploy/prod/.env.runtime):
 *   node scripts/proof-plane-calusa-sync.mjs
 *
 * Prints plane project id + URL (no secrets).
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  const text = readFileSync(path, "utf8");
  for (const line of text.split("\n")) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const idx = line.indexOf("=");
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

const root = resolve(import.meta.dirname, "..");
loadEnvFile(resolve(root, ".env"));
loadEnvFile(resolve(root, "deploy/prod/.env.runtime"));
loadEnvFile("/opt/linktrend/runtime/linkaios/prod.env.runtime");

const base = process.env.PLANE_API_BASE_URL?.replace(/\/$/, "");
const slug = process.env.PLANE_WORKSPACE_SLUG;
const key = process.env.PLANE_API_KEY;

if (!base || !slug || !key) {
  console.error("Missing PLANE_API_BASE_URL, PLANE_WORKSPACE_SLUG, or PLANE_API_KEY");
  process.exit(1);
}

const headers = {
  "x-api-key": key,
  "Content-Type": "application/json",
  "X-Workspace-Slug": slug,
};

async function main() {
  const listRes = await fetch(`${base}/api/v1/workspaces/${encodeURIComponent(slug)}/projects/`, { headers });
  console.log("GET v1 projects:", listRes.status, listRes.ok ? "ok" : "fail");
  if (listRes.status === 401) {
    console.error(await listRes.text());
    process.exit(2);
  }

  const stamp = Date.now().toString(36).toUpperCase();
  const createRes = await fetch(`${base}/api/v1/workspaces/${encodeURIComponent(slug)}/projects/`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      name: `Calusa LinkSites proof ${stamp}`,
      identifier: `CAL${stamp}`.slice(0, 12),
      description: "LiNKaios MVO Plane live proof",
    }),
  });
  const body = await createRes.json().catch(() => ({}));
  console.log("POST project:", createRes.status);
  if (!createRes.ok) {
    console.error(JSON.stringify(body, null, 2));
    process.exit(3);
  }

  const projectId = body.id;
  const identifier = body.identifier ?? body.id;
  const publicBase = process.env.NEXT_PUBLIC_PLANE_URL?.replace(/\/$/, "") ?? base;
  const publicSlug = process.env.NEXT_PUBLIC_PLANE_WORKSPACE_SLUG ?? slug;
  const url = `${publicBase}/${publicSlug}/projects/${encodeURIComponent(identifier)}/`;

  console.log(JSON.stringify({ plane_project_id: projectId, plane_project_identifier: identifier, plane_url: url }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(99);
});
