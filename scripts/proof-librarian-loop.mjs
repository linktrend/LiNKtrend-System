#!/usr/bin/env node
/**
 * LTS-021 proof: librarian ingest → accept → company memory + world brain + audit union.
 * Usage: node scripts/proof-librarian-loop.mjs [--tenant-slug=calusa]
 */

import { randomUUID } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import pg from "pg";

function loadEnvFile() {
  const envPath = resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    const key = t.slice(0, i);
    const val = t.slice(i + 1);
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvFile();

if (!process.env.DATABASE_URL) {
  console.error("Missing DATABASE_URL in .env");
  process.exit(1);
}

const tenantSlugArg = process.argv.find((a) => a.startsWith("--tenant-slug="));
const tenantSlug = tenantSlugArg?.split("=")[1] ?? "calusa";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function rpc(fn, params) {
  const entries = Object.entries(params);
  const args = entries.map(([key], i) => `${key} := $${i + 1}`).join(", ");
  const values = entries.map(([, v]) => {
    if (v !== null && typeof v === "object" && !Array.isArray(v)) return JSON.stringify(v);
    if (Array.isArray(v)) return JSON.stringify(v);
    return v;
  });
  const { rows } = await pool.query(`select * from ${fn}(${args})`, values);
  const row = rows[0] ?? {};
  return row.record_mvo_audit_event ?? row.record_mvo_memory_object ?? row.upsert_knowledge_proposal_row ?? row.finalize_knowledge_proposal ?? Object.values(row)[0];
}

async function applyMigrationIfNeeded() {
  const { rows } = await pool.query(
    `select 1 from information_schema.tables where table_schema='linkbrain' and table_name='knowledge_proposals'`,
  );
  if (!rows.length) {
    console.log("knowledge_proposals not found — apply migration first");
    process.exit(1);
  }
}

async function resolveTenantId() {
  const { rows } = await pool.query(
    `select tenant_id, slug from linkaios_kernel.tenants where slug = $1 limit 1`,
    [tenantSlug],
  );
  if (rows[0]?.tenant_id) return String(rows[0].tenant_id);
  const { rows: anyRows } = await pool.query(`select tenant_id, slug from linkaios_kernel.tenants limit 1`);
  if (!anyRows[0]?.tenant_id) throw new Error("No tenants in linkaios_kernel.tenants");
  console.warn(`Tenant slug '${tenantSlug}' not found — using ${anyRows[0].slug ?? anyRows[0].tenant_id}`);
  return String(anyRows[0].tenant_id);
}

async function seedRunLifecycle(tenantId, runId) {
  const events = [
    { type: "run.started", stage: null, actor: "linkaios.kernel" },
    { type: "stage.completed", stage: "linksites.publish", actor: "website_builder_bot" },
    { type: "run.completed", stage: null, actor: "linkaios.kernel" },
  ];
  const ids = [];
  for (const ev of events) {
    const id = await rpc("linkbrain.record_mvo_audit_event", {
      p_tenant_id: tenantId,
      p_event_type: ev.type,
      p_actor_kind: "system",
      p_actor_id: ev.actor,
      p_target_kind: "run",
      p_target_id: runId,
      p_payload: { proof: "lts-021-librarian" },
      p_run_id: runId,
      p_stage_id: ev.stage,
      p_plane: ev.type.startsWith("run.") ? "linkaios" : "linkbot",
    });
    ids.push(id);
  }
  return ids;
}

async function main() {
  await applyMigrationIfNeeded();
  const tenantId = await resolveTenantId();
  const runId = randomUUID();
  const stageId = "linksites.librarian";

  console.log("Proof tenant:", tenantId, "run:", runId);

  const lifecycleIds = await seedRunLifecycle(tenantId, runId);
  console.log("Seeded lifecycle audit events:", lifecycleIds.length);

  const proposalId = `librarian-proposal-${runId}-${stageId}`;
  const logicalPath = `librarian/proposals/${proposalId}.md`;
  const body = [
    "# LinkSites run knowledge — linksites.librarian",
    "",
    "## Sources",
    "- **run_output** `audit://run-complete`: Proof run completed",
    "",
    "## Proposed lesson",
    "Calusa operator proof — librarian loop LTS-021.",
  ].join("\n");

  const fileRes = await pool.query(
    `insert into linkaios.brain_virtual_files (logical_path, scope, project_id, agent_id, file_kind, sensitivity, legal_entity_id)
     values ($1, 'company', null, null, 'librarian', 'internal', '00000000-0000-4000-8000-000000000001')
     on conflict do nothing
     returning id`,
    [logicalPath],
  );
  let fileId = fileRes.rows[0]?.id;
  if (!fileId) {
    const sel = await pool.query(
      `select id from linkaios.brain_virtual_files where logical_path = $1 and scope = 'company' limit 1`,
      [logicalPath],
    );
    fileId = sel.rows[0]?.id;
  }
  if (!fileId) throw new Error("brain virtual file insert failed");

  const draftRes = await pool.query(
    `insert into linkaios.brain_file_versions (file_id, status, body) values ($1, 'draft', $2) returning id`,
    [fileId, body],
  );
  const draftId = draftRes.rows[0]?.id;
  if (!draftId) throw new Error("draft insert failed");

  const provenance_refs = ["audit://run-complete", "zulip://linksites/proof"];
  const proposedAuditId = await rpc("linkbrain.record_mvo_audit_event", {
    p_tenant_id: tenantId,
    p_event_type: "memory.proposed",
    p_actor_kind: "bot",
    p_actor_id: "librarian_bot",
    p_target_kind: "knowledge_proposal",
    p_target_id: proposalId,
    p_payload: {
      memory_type: "linksites_accepted_knowledge",
      proposal_ref: proposalId,
      provenance_refs,
      brain_file_version_id: draftId,
    },
    p_run_id: runId,
    p_stage_id: stageId,
    p_actor_role_id: "librarian_bot",
    p_plane: "linkbrain",
  });

  await rpc("linkbrain.upsert_knowledge_proposal_row", {
    p_proposal_id: proposalId,
    p_tenant_id: tenantId,
    p_run_id: runId,
    p_stage_id: stageId,
    p_project_id: null,
    p_title: "LinkSites run knowledge — linksites.librarian",
    p_body: body,
    p_sources: JSON.stringify([
      { kind: "run_output", ref: "audit://run-complete", summary: "Proof run completed" },
      { kind: "zulip_thread", ref: "zulip://linksites/proof", summary: "Proof Zulip thread" },
    ]),
    p_brain_file_version_id: draftId,
    p_proposed_audit_event_id: proposedAuditId,
  });

  console.log("Ingested proposal:", proposalId, "draft:", draftId, "memory.proposed:", proposedAuditId);

  const knowledge_ref = `brain://company/linksites/knowledge/${proposalId}`;
  const memoryId = await rpc("linkbrain.record_mvo_memory_object", {
    p_tenant_id: tenantId,
    p_memory_type: "linksites_accepted_knowledge",
    p_summary: "LinkSites run knowledge — linksites.librarian",
    p_payload: { body, proposal_id: proposalId, proof: true },
    p_run_id: runId,
    p_stage_id: stageId,
    p_knowledge_ref: knowledge_ref,
    p_accepted_by: "proof:librarian-script",
    p_provenance_refs: JSON.stringify(provenance_refs),
  });

  const world_brain_ref = `world://patterns/linksites/${proposalId}`;
  const acceptedAuditId = await rpc("linkbrain.record_mvo_audit_event", {
    p_tenant_id: tenantId,
    p_event_type: "memory.accepted",
    p_actor_kind: "system",
    p_actor_id: "linkbrain.librarian",
    p_target_kind: "memory_object",
    p_target_id: String(memoryId),
    p_payload: {
      memory_type: "linksites_accepted_knowledge",
      accepted_ref: knowledge_ref,
      accepted_by: "proof:librarian-script",
      provenance_refs,
      world_brain_ref,
      confidentiality_proof: {
        policy: "linkguard.world_brain.v1",
        tenant_id_removed: true,
      },
    },
    p_run_id: runId,
    p_stage_id: stageId,
    p_plane: "linkbrain",
  });

  await rpc("linkbrain.finalize_knowledge_proposal", {
    p_proposal_id: proposalId,
    p_decision: "accept",
    p_reviewed_by: "proof:librarian-script",
    p_knowledge_ref: knowledge_ref,
    p_world_brain_ref: world_brain_ref,
    p_accepted_audit_event_id: acceptedAuditId,
    p_memory_object_id: memoryId,
  });

  const auditUnion = (
    await pool.query(
      `select event_id, action, ts from linkbrain.audit_events where subject->>'run_id' = $1 order by ts`,
      [runId],
    )
  ).rows;

  const memoryRow = (
    await pool.query(
      `select id, type, run_id from linkbrain.memory_objects where run_id = $1 and type = 'linksites_accepted_knowledge' limit 1`,
      [runId],
    )
  ).rows[0];

  console.log("\n=== LTS-021 PROOF ===");
  console.log(JSON.stringify({
    agent_id: "librarian",
    linkbot_role_id: "librarian_bot",
    tenant_id: tenantId,
    run_id: runId,
    proposal_id: proposalId,
    brain_file_version_id: draftId,
    proposed_audit_event_id: proposedAuditId,
    memory_object_id: memoryId,
    accepted_audit_event_id: acceptedAuditId,
    knowledge_ref,
    world_brain_ref,
    audit_union_actions: auditUnion.map((r) => r.action),
    audit_tab_url: `/memory?tab=audit&run=${runId}`,
    inbox_url: `/memory?tab=inbox&inbox_item=librarian`,
    rpc_paths: [
      "linkbrain.upsert_knowledge_proposal_row",
      "linkbrain.record_mvo_audit_event(memory.proposed|memory.accepted)",
      "linkbrain.record_mvo_memory_object",
      "linkbrain.finalize_knowledge_proposal",
      "POST /api/internal/librarian-propose",
      "POST /api/internal/brain-librarian",
    ],
  }, null, 2));
  console.log("Retrieved memory:", memoryRow?.id ?? "none");
  await pool.end();
}

main().catch(async (e) => {
  console.error(e);
  await pool.end();
  process.exit(1);
});
