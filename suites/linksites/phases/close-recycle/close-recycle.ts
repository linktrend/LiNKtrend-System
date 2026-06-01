/**
 * LinkSites close or recycle phase helpers (LTS-107).
 */

export type CloseRecycleOutcome = "subscribe" | "recycle";

export type CloseRecycleRecord = {
  run_id: string;
  tenant_id: string;
  outcome: CloseRecycleOutcome;
  recorded_at: string;
  audit_event_ref?: string;
};

/**
 * Record subscribe/transfer or recycle outcome for the lead run.
 */
export function recordCloseOrRecycle(params: {
  tenant_id: string;
  run_id: string;
  outcome: CloseRecycleOutcome;
}): CloseRecycleRecord {
  return {
    tenant_id: params.tenant_id,
    run_id: params.run_id,
    outcome: params.outcome,
    recorded_at: new Date().toISOString(),
  };
}
