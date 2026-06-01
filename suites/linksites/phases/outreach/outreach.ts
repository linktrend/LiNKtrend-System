/**
 * LinkSites outreach phase helpers (LTS-106).
 * Principal D2 A: governed draft-only; live send requires explicit approval.
 */

export type OutreachDraftRecord = {
  run_id: string;
  tenant_id: string;
  outreach_status: "draft_pending_principal_approval";
  outreach_draft_ref: string;
  send_mode: "draft_only";
  audit_event_ref?: string;
};

/**
 * Build governed outreach draft record (not a skip stage).
 */
export function buildOutreachDraft(params: {
  tenant_id: string;
  run_id: string;
  lead_id: string;
  publish_url: string;
}): OutreachDraftRecord {
  return {
    tenant_id: params.tenant_id,
    run_id: params.run_id,
    outreach_status: "draft_pending_principal_approval",
    outreach_draft_ref: `outreach_draft:${params.tenant_id}:${params.run_id}`,
    send_mode: "draft_only",
  };
}
