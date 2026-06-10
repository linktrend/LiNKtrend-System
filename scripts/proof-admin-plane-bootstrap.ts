/**
 * Full live proof: create vendor admin project + Plane bootstrap (modules/issues/cycle).
 * Run from repo root: pnpm exec tsx scripts/proof-admin-plane-bootstrap.ts
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvFile(path: string) {
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

process.env.LINKSKILLS_PLANE_MODE ??= "live";
process.env.PLANE_WORKSPACE_SLUG ??= "linkprojects";
process.env.PLANE_API_BASE_URL ??= "https://plane.linktrend.internal";
process.env.NEXT_PUBLIC_PLANE_URL ??= process.env.PLANE_API_BASE_URL;
process.env.NEXT_PUBLIC_PLANE_WORKSPACE_SLUG ??= process.env.PLANE_WORKSPACE_SLUG;
process.env.LICENSOR_TENANT_ID ??= "da570876-176d-452a-a428-6536d48303e9";

async function main() {
  const { createAdminProjectPersisted } = await import(
    "../LiNKaios/linkaios-web/src/lib/admin-project-create.ts"
  );
  const { buildPlaneProjectUrl } = await import(
    "../LiNKaios/linkaios-web/src/lib/kernel/plane-project-sync.ts"
  );
  const { getSupabaseAdmin } = await import("../LiNKaios/linkaios-web/src/lib/supabase-admin.ts");

  const stamp = new Date().toISOString().slice(0, 16).replace(/[^\d]/g, "");
  const result = await createAdminProjectPersisted({
    name: `Admin Plane live ${stamp}`,
    projectType: "suite_gen",
    cadence: "continuous",
  });

  const supabase = getSupabaseAdmin();
  const tenantId = process.env.LICENSOR_TENANT_ID!;
  const { data: mapping } = await supabase
    .schema("linkskills")
    .from("plane_project_mappings")
    .select("plane_project_id")
    .eq("tenant_id", tenantId)
    .eq("lead_id", result.projectId)
    .maybeSingle();

  const planeProjectId = mapping?.plane_project_id ?? null;
  const planeUrl = planeProjectId ? buildPlaneProjectUrl(planeProjectId) : null;

  console.log(
    JSON.stringify(
      {
        admin_project_id: result.projectId,
        plane_bootstrap: result.planeBootstrap,
        plane_project_id: planeProjectId,
        plane_url: planeUrl,
        admin_detail_url: `/admin/projects/${result.projectId}`,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
