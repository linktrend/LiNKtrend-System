import path from "node:path";

import { upsertCandidate } from "./store";

/** Self-suite id — must never publish to client marketplace (E2E-032). */
const LINKSUITEGEN_SELF_SUITE_ID = "linksuitegen";
import type { GeneratedSuiteCandidate, HandoffImportBody } from "./types";

function exportRoot(): string {
  return (
    process.env.LINKSUITEGEN_EXPORT_ROOT?.trim() ??
    path.resolve(process.cwd(), "../../LiNKsuitegen/artifacts/exports")
  );
}

export function resolveBundlePath(bundlePath: string): string {
  if (path.isAbsolute(bundlePath)) return bundlePath;
  return path.join(exportRoot(), bundlePath.replace(/^artifacts\/exports\//, ""));
}

export async function importHandoff(body: HandoffImportBody): Promise<GeneratedSuiteCandidate> {
  if (body.suite_id === LINKSUITEGEN_SELF_SUITE_ID) {
    throw new Error("LiNKsuitegen self-suite cannot be published to client marketplace");
  }

  const adminOnly = body.admin_install_target?.admin_only_source_suite === true;
  const audience = adminOnly ? "linkaios_admin_only" : "linkaios_client_marketplace";
  const now = new Date().toISOString();
  const candidate: GeneratedSuiteCandidate = {
    candidate_id: crypto.randomUUID(),
    suite_id: body.suite_id,
    suite_family: body.suite_family,
    suite_version: body.suite_version,
    display_name: body.display_name ?? body.suite_id,
    status: "handoff_received",
    audience,
    bundle_id: `bundle_${body.suite_id}_${body.suite_version.replace(/\./g, "_")}`,
    bundle_uri: resolveBundlePath(body.bundle_path),
    validation_status: body.validation_status,
    admin_only: adminOnly,
    client_marketplace_visible: false,
    created_by: "linksuitegen",
    created_at: now,
    updated_at: now,
    handoff_id: body.handoff_id,
    validation_score: body.validation_status === "validated" ? 1 : 0,
  };

  if (adminOnly && candidate.client_marketplace_visible) {
    throw new Error("admin_only implies client_marketplace_visible=false");
  }

  await upsertCandidate({ ...candidate, status: "admin_draft_installed" });
  return { ...candidate, status: "admin_draft_installed" };
}
