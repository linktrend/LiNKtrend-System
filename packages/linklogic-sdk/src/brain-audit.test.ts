import { describe, expect, it } from "vitest";

import { CANONICAL_AUDIT_ACTIONS, validateAuditEnvelope } from "./brain-audit.js";
import { AUDIT_ACTIONS, type AuditEvent } from "./contracts-mvo.js";

const baseEvent = (): AuditEvent => ({
  event_id: "11111111-1111-4111-8111-111111111111",
  ts: "2026-05-14T12:00:00Z",
  tenant_id: "22222222-2222-4222-8222-222222222222",
  plane: "linkaios",
  actor: { actor_kind: "kernel", actor_id: "linkaios.kernel" },
  action: "run.started",
  subject: { run_id: "33333333-3333-4333-8333-333333333333" },
  refs: {},
  payload: { note: "ok" },
  schema_version: "1",
});

describe("validateAuditEnvelope", () => {
  it("accepts a minimal canonical envelope", () => {
    expect(validateAuditEnvelope(baseEvent())).toBeNull();
  });

  it("rejects missing required fields", () => {
    const ev = baseEvent();
    // @ts-expect-error testing runtime guard
    delete ev.tenant_id;
    const r = validateAuditEnvelope(ev);
    expect(r?.code).toBe("AUDIT_ENVELOPE_INVALID");
    expect(r?.message).toContain("tenant_id");
  });

  it("rejects unknown plane", () => {
    const ev = { ...baseEvent(), plane: "linkcrm" as never };
    const r = validateAuditEnvelope(ev);
    expect(r?.code).toBe("AUDIT_ENVELOPE_INVALID");
    expect(r?.message).toContain("plane");
  });

  it("rejects wrong schema_version", () => {
    const ev = { ...baseEvent(), schema_version: "2" as never };
    const r = validateAuditEnvelope(ev);
    expect(r?.code).toBe("AUDIT_ENVELOPE_INVALID");
    expect(r?.message).toContain("schema_version");
  });

  it("rejects non-canonical action", () => {
    const ev = { ...baseEvent(), action: "run.exploded" };
    const r = validateAuditEnvelope(ev);
    expect(r?.code).toBe("AUDIT_ACTION_UNKNOWN");
  });

  it("rejects bad uuid event_id", () => {
    const ev = { ...baseEvent(), event_id: "not-a-uuid" };
    const r = validateAuditEnvelope(ev);
    expect(r?.code).toBe("AUDIT_ENVELOPE_INVALID");
    expect(r?.message).toContain("event_id");
  });

  it("rejects non-ISO ts", () => {
    const ev = { ...baseEvent(), ts: "2026/05/14 12:00:00" };
    const r = validateAuditEnvelope(ev);
    expect(r?.code).toBe("AUDIT_ENVELOPE_INVALID");
    expect(r?.message).toContain("ts");
  });

  it.each(["email", "phone", "contact_email", "contact_phone", "contact"])(
    "rejects PII payload key %s (§3.4)",
    (key) => {
      const ev = baseEvent();
      ev.payload = { [key]: "leaked@example.com" };
      const r = validateAuditEnvelope(ev);
      expect(r?.code).toBe("AUDIT_ENVELOPE_PII_FORBIDDEN");
    },
  );

  it("rejects empty actor_id", () => {
    const ev = baseEvent();
    ev.actor = { actor_kind: "kernel", actor_id: "" };
    const r = validateAuditEnvelope(ev);
    expect(r?.code).toBe("AUDIT_ENVELOPE_INVALID");
  });

  it("exposes the full §6.3.1 canonical action set", () => {
    for (const action of AUDIT_ACTIONS) {
      expect(CANONICAL_AUDIT_ACTIONS.has(action)).toBe(true);
    }
    for (const action of AUDIT_ACTIONS) {
      const r = validateAuditEnvelope({ ...baseEvent(), action });
      expect(r).toBeNull();
    }
  });

  it("accepts envelopes referencing all MVO id types in subject", () => {
    const ev: AuditEvent = {
      ...baseEvent(),
      action: "preview.published",
      subject: {
        run_id: "33333333-3333-4333-8333-333333333333",
        stage_id: "stage-1",
        lease_id: "lease-1",
        workflow_run_id: "wf-1",
        capability: "preview.publish",
        plugin_id: "websitefactory",
        lead_id: "lead-1",
        preview_url: "https://preview.example.com/x",
        preview_artifact_ref: "artifact:abc",
        crm_record_id: "crm-1",
        project_id: "proj-1",
        task_id: "task-1",
      },
    };
    expect(validateAuditEnvelope(ev)).toBeNull();
  });
});
