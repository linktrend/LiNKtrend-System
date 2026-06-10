import "server-only";

import type { LeaseStatus } from "@/lib/cockpit";

const now = Date.now();

/** Last-resort lease rows for Admin LiNKskills when `lease_registry` is empty (not UI mock overlay). */
export const ADMIN_LINKSKILLS_LEASE_SEED: LeaseStatus[] = [
  {
    lease_id: "cccccccc-cccc-4ccc-8ccc-cccccccccc01",
    capability: "cap.zulip.run_messaging",
    status: "executed",
    tenant_id: "linktrend",
    run_id: "run-admin-seed-01",
    stage_id: "stage-librarian",
    requested_at: new Date(now - 7_200_000).toISOString(),
    granted_at: new Date(now - 7_100_000).toISOString(),
    executed_at: new Date(now - 7_000_000).toISOString(),
    expires_at: new Date(now + 86_400_000).toISOString(),
    kill_switch_state: "open",
    ledger_entry_id: "ledger-admin-seed-01",
    audit_event_id: "audit-admin-seed-01",
  },
  {
    lease_id: "cccccccc-cccc-4ccc-8ccc-cccccccccc02",
    capability: "cap.plane.execution_tracking",
    status: "granted",
    tenant_id: "linktrend",
    run_id: "run-admin-seed-02",
    stage_id: "stage-suite-factory",
    requested_at: new Date(now - 3_600_000).toISOString(),
    granted_at: new Date(now - 3_500_000).toISOString(),
    executed_at: null,
    expires_at: new Date(now + 43_200_000).toISOString(),
    kill_switch_state: "open",
    ledger_entry_id: "ledger-admin-seed-02",
    audit_event_id: "audit-admin-seed-02",
  },
];
