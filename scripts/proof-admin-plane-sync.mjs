#!/usr/bin/env node
/**
 * Proof: create one vendor Admin project with live Plane bootstrap.
 *
 * Usage (repo root, with Supabase + Plane env):
 *   node scripts/proof-admin-plane-sync.mjs
 *
 * Prints admin project id, Plane project id, and Plane URL (no secrets).
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";

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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const supabaseKey = process.env.SUPABASE_SECRET_KEY;
const planeBase = process.env.PLANE_API_BASE_URL?.replace(/\/$/, "");
const planeSlug = process.env.PLANE_WORKSPACE_SLUG;
const planeKey = process.env.PLANE_API_KEY;
const planeMode = process.env.LINKSKILLS_PLANE_MODE ?? "stub";
const licensorTenantId = process.env.LICENSOR_TENANT_ID;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY");
  process.exit(1);
}
if (!planeBase || !planeSlug || !planeKey) {
  console.error("Missing PLANE_API_BASE_URL, PLANE_WORKSPACE_SLUG, or PLANE_API_KEY");
  process.exit(2);
}
if (planeMode !== "live") {
  console.error(`LINKSKILLS_PLANE_MODE must be live (got ${planeMode})`);
  process.exit(3);
}

const planeHeaders = {
  "x-api-key": planeKey,
  "Content-Type": "application/json",
  "X-Workspace-Slug": planeSlug,
};

const supabaseHeaders = {
  apikey: supabaseKey,
  Authorization: `Bearer ${supabaseKey}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

async function resolveTenantId() {
  if (licensorTenantId) return licensorTenantId;
  const res = await fetch(`${supabaseUrl}/rest/v1/rpc/seed_demo_tenant`, {
    method: "POST",
    headers: {
      ...supabaseHeaders,
      "Accept-Profile": "linkaios_kernel",
      "Content-Profile": "linkaios_kernel",
    },
    body: JSON.stringify({ p_slug: "linktrend", p_display_name: "LiNKtrend" }),
  });
  const body = await res.json().catch(() => []);
  if (!res.ok || !Array.isArray(body) || !body[0]?.tenant_id) {
    throw new Error(`seed_demo_tenant failed: ${res.status} ${JSON.stringify(body)}`);
  }
  return body[0].tenant_id;
}

function slugifyIdentifier(title, projectId) {
  const fromTitle = title.toUpperCase().replace(/[^A-Z0-9]+/g, "").slice(0, 8);
  const suffix = projectId.replace(/-/g, "").slice(0, 4).toUpperCase();
  return `${fromTitle || "LINKAIOS"}${suffix}`.slice(0, 12);
}

const SUITE_GEN_MODULE = {
  name: "Suite catalogue pipeline",
  summary: "Author suite variants, validate bundles, and publish to the vendor marketplace.",
  workflows: [
    {
      name: "Catalogue intake",
      summary: "Define suite variant inputs and seed fixture sources for generation.",
      issues: [
        { title: "Define suite variant schema", description: "Capture variant metadata." },
        { title: "Seed fixture sources", description: "Populate fixture sources for bundle generation." },
      ],
    },
    {
      name: "Generate and validate",
      summary: "Run bundle generation and validate export artefacts.",
      issues: [
        { title: "Run bundle generator", description: "Execute LiNKsuitegen generate pipeline." },
        { title: "Validate export bundle", description: "Review bundle validation output before publish." },
      ],
    },
    {
      name: "Publish pipeline",
      summary: "Promote validated bundles to the vendor marketplace with audit.",
      issues: [
        { title: "Publish to marketplace", description: "Approve marketplace publish when gated." },
        { title: "Record audit trace", description: "Persist governed audit for publish step." },
      ],
    },
  ],
};

async function planeRequest(method, path, payload) {
  const res = await fetch(`${planeBase}${path}`, {
    method,
    headers: planeHeaders,
    body: payload ? JSON.stringify(payload) : undefined,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Plane ${method} ${path} failed: ${res.status} ${JSON.stringify(body)}`);
  }
  return body;
}

async function planePost(path, payload) {
  return planeRequest("POST", path, payload);
}

async function bootstrapPlaneProject(planeProjectId) {
  const v1 = `/api/v1/workspaces/${encodeURIComponent(planeSlug)}`;
  const module = await planePost(`${v1}/projects/${planeProjectId}/modules/`, {
    name: SUITE_GEN_MODULE.name,
    description: SUITE_GEN_MODULE.summary,
  });

  let issueCount = 0;
  for (const phase of SUITE_GEN_MODULE.workflows) {
    for (const issue of phase.issues) {
      const created = await planePost(`${v1}/projects/${planeProjectId}/work-items/`, {
        name: issue.title,
        description_html: `<p>${issue.description}</p>`,
      });
      await planePost(`${v1}/projects/${planeProjectId}/modules/${module.id}/module-issues/`, {
        issues: [created.id],
      });
      issueCount += 1;
    }
  }

  const start = new Date();
  const end = new Date(start);
  end.setDate(end.getDate() + 14);
  const fmt = (d) => d.toISOString().slice(0, 10);
  await planePost(`${v1}/projects/${planeProjectId}/cycles/`, {
    name: `Run ${fmt(start)}`,
    start_date: fmt(start),
    end_date: fmt(end),
    project_id: planeProjectId,
  });

  return { plane_module_id: module.id, plane_issue_count: issueCount };
}

async function createPlaneProject(title, projectId) {
  const v1 = `/api/v1/workspaces/${encodeURIComponent(planeSlug)}`;
  const body = await planePost(`${v1}/projects/`, {
    name: title,
    identifier: slugifyIdentifier(title, projectId),
    description: `LiNKaios admin proof ${projectId}`,
  });
  await planeRequest("PATCH", `${v1}/projects/${body.id}/`, {
    module_view: true,
    cycle_view: true,
  });
  const bootstrap = await bootstrapPlaneProject(body.id);
  return { ...body, bootstrap };
}

async function upsertMapping(tenantId, projectId, planeProjectId) {
  const res = await fetch(`${supabaseUrl}/rest/v1/rpc/upsert_plane_project_mapping`, {
    method: "POST",
    headers: { ...supabaseHeaders, "Accept-Profile": "linkskills", "Content-Profile": "linkskills" },
    body: JSON.stringify({
      p_tenant_id: tenantId,
      p_lead_id: projectId,
      p_plane_project_id: planeProjectId,
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`upsert_plane_project_mapping failed: ${res.status} ${JSON.stringify(body)}`);
  }
  return body;
}

async function createAdminProject(tenantId) {
  const stamp = `${Date.now().toString(36).toUpperCase()}`;
  const title = `Admin Plane proof ${stamp}`;
  const res = await fetch(`${supabaseUrl}/rest/v1/rpc/create_project`, {
    method: "POST",
    headers: { ...supabaseHeaders, "Accept-Profile": "linkaios", "Content-Profile": "linkaios" },
    body: JSON.stringify({
      p_tenant_id: tenantId,
      p_title: title,
      p_suite_id: "linksuitegen",
      p_module_ids: ["suite-gen-catalogue"],
      p_cadence: "continuous",
      p_actor_id: null,
    }),
  });
  const body = await res.json().catch(() => []);
  if (!res.ok || !Array.isArray(body) || !body[0]?.project_id) {
    throw new Error(`create_project failed: ${res.status} ${JSON.stringify(body)}`);
  }
  return { projectId: body[0].project_id, title, createdAt: body[0].created_at };
}

async function main() {
  const tenantId = await resolveTenantId();
  const project = await createAdminProject(tenantId);
  const plane = await createPlaneProject(project.title, project.projectId);
  await upsertMapping(tenantId, project.projectId, plane.id);

  const publicBase = process.env.NEXT_PUBLIC_PLANE_URL?.replace(/\/$/, "") ?? planeBase;
  const publicSlug = process.env.NEXT_PUBLIC_PLANE_WORKSPACE_SLUG ?? planeSlug;
  const identifier = plane.identifier ?? plane.id;
  const planeUrl = `${publicBase}/${publicSlug}/projects/${encodeURIComponent(identifier)}/`;

  console.log(
    JSON.stringify(
      {
        admin_project_id: project.projectId,
        admin_project_title: project.title,
        licensor_tenant_id: tenantId,
        plane_project_id: plane.id,
        plane_project_identifier: identifier,
        plane_issue_count: plane.bootstrap?.plane_issue_count ?? 0,
        plane_url: planeUrl,
        admin_detail_url: `/admin/projects/${project.projectId}`,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(99);
});
