/**
 * LinkSites outreach phase helpers (LTS-106 / Wave 9.4).
 */

export type OutreachDraftRecord = {
  run_id: string;
  tenant_id: string;
  outreach_status: "draft_pending_principal_approval";
  outreach_draft_ref: string;
  send_mode: "draft_only";
  audit_event_ref?: string;
};

export type OutreachDispatchRecord = {
  run_id: string;
  tenant_id: string;
  outreach_status: "dispatched";
  outreach_draft_ref: string;
  outreach_dispatch_ref: string;
  send_mode: "live";
  principal_approval: true;
  publish_url: string;
};

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

export function buildApprovedOutreachDispatch(params: {
  tenant_id: string;
  run_id: string;
  publish_url: string;
  outreach_draft_ref: string;
  principal_approval: boolean;
}): OutreachDispatchRecord | null {
  if (!params.principal_approval) return null;
  return {
    tenant_id: params.tenant_id,
    run_id: params.run_id,
    outreach_status: "dispatched",
    outreach_draft_ref: params.outreach_draft_ref,
    outreach_dispatch_ref: `outreach_dispatch:${params.tenant_id}:${params.run_id}`,
    send_mode: "live",
    principal_approval: true,
    publish_url: params.publish_url,
  };
}
