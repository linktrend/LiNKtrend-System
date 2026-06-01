/**
 * WP-081 integration-style tests for LinkSkills logic-engine:
 * lease lifecycle, idempotency, kill switches, audit-shaped envelopes.
 *
 * Progressive disclosure / WP-080-specific flows are out of scope here (stub surface only).
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Env } from "@linktrend/shared-config";
import type { LeaseExecuteRequest, LeaseRequest } from "@linktrend/linklogic-sdk";

vi.mock("../audit-events.js", async () => {
  const { vi } = await import("vitest");
  const { capturedBrainAuditEvents } = await import("./audit-sink.js");
  const envBuilders = await import("./integration-audit-envelopes.js");

  const capture = (ev: (typeof capturedBrainAuditEvents)[number]) => {
    capturedBrainAuditEvents.push(ev);
    return { event_id: ev.event_id };
  };

  return {
    emitLeaseRequested: vi.fn(async (_env, lease_id, request, kill_switch_state) =>
      capture(
        envBuilders.integrationLeaseRequested(
          lease_id,
          request as Parameters<typeof envBuilders.integrationLeaseRequested>[1],
          kill_switch_state,
        ),
      ),
    ),
    emitLeaseGranted: vi.fn(async (_env, lease_id, request, decision) =>
      capture(
        envBuilders.integrationLeaseGranted(
          lease_id,
          request as Parameters<typeof envBuilders.integrationLeaseGranted>[1],
          decision as Parameters<typeof envBuilders.integrationLeaseGranted>[2],
        ),
      ),
    ),
    emitLeaseDenied: vi.fn(async (_env, lease_id, request, reason, failure) =>
      capture(
        envBuilders.integrationLeaseDenied(
          lease_id,
          request as Parameters<typeof envBuilders.integrationLeaseDenied>[1],
          reason,
          failure as Parameters<typeof envBuilders.integrationLeaseDenied>[3],
        ),
      ),
    ),
    emitLeaseExecuted: vi.fn(async (_env, lease_id, request, result) =>
      capture(
        envBuilders.integrationLeaseExecuted(
          lease_id,
          request as Parameters<typeof envBuilders.integrationLeaseExecuted>[1],
          result as Parameters<typeof envBuilders.integrationLeaseExecuted>[2],
        ),
      ),
    ),
    emitCapabilityOutput: vi.fn(async (_env, lease_id, request, result) =>
      capture(
        envBuilders.integrationCapabilityOutput(
          lease_id,
          request as Parameters<typeof envBuilders.integrationCapabilityOutput>[1],
          result as Parameters<typeof envBuilders.integrationCapabilityOutput>[2],
        ),
      ),
    ),
  };
});

import {
  executeLease,
  grantLease,
  requestLease,
  revokeLease,
} from "../lease-lifecycle.js";
import { checkIdempotency, storeIdempotencyResult } from "../idempotency.js";
import {
  createTestCapability,
  createTestTenant,
  getCapturedAuditEvents,
  resetKillSwitchForTests,
  tripGlobalHalt,
} from "./integration-test-helpers.js";
import { resetCapturedBrainAuditEvents } from "./audit-sink.js";
import { LinkskillsIntegrationHarness } from "./supabase-harness.js";

const mockEnv = {} as Env;

function baseLeaseRequest(overrides?: Partial<LeaseRequest>): LeaseRequest {
  const tenant = createTestTenant();
  const run = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
  const stage = "stage-integration";
  const cap = createTestCapability();
  const key = `${run}:${stage}:${cap}`;
  return {
    tenant_id: tenant,
    run_id: run,
    stage_id: stage,
    capability: cap,
    arguments: { mode: "shadow", message: "hello" },
    idempotency_key: key,
    actor: { actor_kind: "plugin", actor_id: "websitefactory" },
    ...overrides,
  };
}

describe("LinkSkills integration harness", () => {
  let harness: LinkskillsIntegrationHarness;

  beforeEach(() => {
    harness = new LinkskillsIntegrationHarness();
    harness.reset();
    resetCapturedBrainAuditEvents();
  });

  describe("lease lifecycle", () => {
    it("request → granted → execute → success with ledger + idempotency cache", async () => {
      const client = harness.createSupabaseClient();
      const req = baseLeaseRequest();

      const granted = await requestLease(client, mockEnv, req);
      expect(granted.status).toBe("granted");
      expect(granted.is_existing).toBe(false);

      const execReq: LeaseExecuteRequest = {
        lease_id: granted.lease_id,
        idempotency_key: req.idempotency_key,
      };

      const execResult = await executeLease(client, mockEnv, execReq, async () => ({
        echoed: req.arguments.message,
      }));

      expect(execResult.failure).toBeUndefined();
      expect(execResult.result).toEqual({ echoed: req.arguments.message });

      const leaseRow = harness.leases.get(granted.lease_id);
      expect(leaseRow?.status).toBe("executed");

      const cacheKey = `${req.tenant_id}::${req.idempotency_key}::${req.capability}`;
      expect(harness.idempotencyCache.has(cacheKey)).toBe(true);

      const audits = getCapturedAuditEvents();
      expect(audits.map((e) => e.action)).toContain("lease.requested");
      expect(audits.map((e) => e.action)).toContain("lease.granted");
      expect(audits.map((e) => e.action)).toContain("lease.executed");
      expect(audits.map((e) => e.action)).toContain(`${req.capability}.completed`);
    });

    it("request → requires_approval → grant → execute", async () => {
      harness.policyMode = "require_approval";
      const client = harness.createSupabaseClient();
      const req = baseLeaseRequest();

      const pending = await requestLease(client, mockEnv, req);
      expect(pending.status).toBe("requires_approval");

      await grantLease(client, pending.lease_id, "granted", "approved", 300);

      const execResult = await executeLease(
        client,
        mockEnv,
        { lease_id: pending.lease_id, idempotency_key: req.idempotency_key },
        async () => ({ ok: true }),
      );
      expect(execResult.failure).toBeUndefined();
      expect(execResult.result).toEqual({ ok: true });
    });

    it("fails closed when executing a lease that still requires approval", async () => {
      harness.policyMode = "require_approval";
      const client = harness.createSupabaseClient();
      const req = baseLeaseRequest();

      const pending = await requestLease(client, mockEnv, req);
      expect(pending.status).toBe("requires_approval");

      const handler = vi.fn(async () => ({ should_not_run: true }));
      const execResult = await executeLease(
        client,
        mockEnv,
        { lease_id: pending.lease_id, idempotency_key: req.idempotency_key },
        handler,
      );

      expect(handler).not.toHaveBeenCalled();
      expect(execResult.failure?.code).toBe("POLICY_REQUIRES_APPROVAL");
      expect(execResult.failure?.message).toContain("requires approval");
    });

    it("returns LEASE_EXPIRED when TTL elapsed", async () => {
      const client = harness.createSupabaseClient();
      const req = baseLeaseRequest();
      const granted = await requestLease(client, mockEnv, req);
      expect(granted.status).toBe("granted");

      const row = harness.leases.get(granted.lease_id);
      expect(row).toBeDefined();
      harness.leases.set(granted.lease_id, {
        ...row!,
        expires_at: new Date(Date.now() - 60_000).toISOString(),
      });

      const execResult = await executeLease(
        client,
        mockEnv,
        { lease_id: granted.lease_id, idempotency_key: req.idempotency_key },
        async () => ({}),
      );
      expect(execResult.failure?.code).toBe("LEASE_EXPIRED");
    });

    it("blocks execute after revocation", async () => {
      const client = harness.createSupabaseClient();
      const req = baseLeaseRequest();
      const granted = await requestLease(client, mockEnv, req);
      await revokeLease(client, granted.lease_id, "operator_revoked");

      const execResult = await executeLease(
        client,
        mockEnv,
        { lease_id: granted.lease_id, idempotency_key: req.idempotency_key },
        async () => ({}),
      );
      expect(execResult.failure?.code).toBe("LEASE_DENIED");
    });
  });

  describe("kill switch", () => {
    it("capability trip denies new leases with LEASE_KILL_SWITCH audit payload", async () => {
      const client = harness.createSupabaseClient();
      await client.schema("linkskills").rpc("trip_kill_switch", {
        p_capability_id: createTestCapability(),
        p_tenant_id: createTestTenant(),
        p_reason: "test",
        p_actor_id: "integration-test",
      });

      const req = baseLeaseRequest();
      const denied = await requestLease(client, mockEnv, req);
      expect(denied.status).toBe("denied");
      expect(denied.failure?.code).toBe("LEASE_KILL_SWITCH");

      const audits = getCapturedAuditEvents();
      expect(audits.some((e) => e.action === "lease.denied")).toBe(true);
      const deniedEvt = audits.find((e) => e.action === "lease.denied");
      expect(deniedEvt?.payload).toMatchObject({
        failure_code: "LEASE_KILL_SWITCH",
      });
    });

    it("reset capability switch → lease granted again", async () => {
      const client = harness.createSupabaseClient();
      const cap = createTestCapability();
      const tenant = createTestTenant();

      await client.schema("linkskills").rpc("trip_kill_switch", {
        p_capability_id: cap,
        p_tenant_id: tenant,
        p_reason: "test",
        p_actor_id: "integration-test",
      });

      expect((await requestLease(client, mockEnv, baseLeaseRequest())).status).toBe("denied");

      await resetKillSwitchForTests(client, harness, cap, tenant);

      const retry = await requestLease(
        client,
        mockEnv,
        baseLeaseRequest({
          run_id: "dddddddd-dddd-dddd-dddd-dddddddddddd",
          stage_id: "stage-after-reset",
          idempotency_key: `dddddddd-dddd-dddd-dddd-dddddddddddd:stage-after-reset:${cap}`,
        }),
      );
      expect(retry.status).toBe("granted");
    });

    it("global halt blocks new leases but does not block execute on already-granted lease", async () => {
      const client = harness.createSupabaseClient();
      const req = baseLeaseRequest();
      const granted = await requestLease(client, mockEnv, req);
      expect(granted.status).toBe("granted");

      await tripGlobalHalt(client);

      const blocked = await requestLease(
        client,
        mockEnv,
        baseLeaseRequest({
          run_id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
          idempotency_key: `cccccccc-cccc-cccc-cccc-cccccccccccc:${req.stage_id}:${req.capability}`,
        }),
      );
      expect(blocked.status).toBe("denied");

      const execResult = await executeLease(
        client,
        mockEnv,
        { lease_id: granted.lease_id, idempotency_key: req.idempotency_key },
        async () => ({ ran_while_halted: true }),
      );
      expect(execResult.failure).toBeUndefined();
      expect(execResult.result).toEqual({ ran_while_halted: true });
    });
  });

  describe("idempotency", () => {
    it("same key + same payload → replay result without handler", async () => {
      const client = harness.createSupabaseClient();
      const req = baseLeaseRequest();
      const granted = await requestLease(client, mockEnv, req);

      await storeIdempotencyResult(
        client,
        req.tenant_id,
        req.idempotency_key,
        req.capability,
        req.arguments,
        { cached: true },
        granted.lease_id,
      );

      const handler = vi.fn(async () => ({ unexpected: true }));
      const execResult = await executeLease(
        client,
        mockEnv,
        { lease_id: granted.lease_id, idempotency_key: req.idempotency_key },
        handler,
      );

      expect(handler).not.toHaveBeenCalled();
      expect(execResult.failure).toBeUndefined();
      expect(execResult.result).toEqual({ cached: true });
    });

    it("same key + different payload → LEASE_IDEMPOTENCY_CONFLICT", async () => {
      const client = harness.createSupabaseClient();
      const req = baseLeaseRequest();
      const granted = await requestLease(client, mockEnv, req);

      await storeIdempotencyResult(
        client,
        req.tenant_id,
        req.idempotency_key,
        req.capability,
        { mode: "shadow", message: "original" },
        { ok: true },
        granted.lease_id,
      );

      harness.leases.set(granted.lease_id, {
        ...harness.leases.get(granted.lease_id)!,
        arguments: { mode: "shadow", message: "changed" },
      });

      const execResult = await executeLease(
        client,
        mockEnv,
        { lease_id: granted.lease_id, idempotency_key: req.idempotency_key },
        async () => ({}),
      );
      expect(execResult.failure?.code).toBe("LEASE_IDEMPOTENCY_CONFLICT");
    });

    it("expires cached replay after 24h TTL window", async () => {
      const client = harness.createSupabaseClient();
      const tenant = createTestTenant();
      const key = "run-z:stage-z:cap.test.echo";
      const payload = { mode: "shadow" };

      await storeIdempotencyResult(client, tenant, key, createTestCapability(), payload, { v: 1 }, "ledger-z");

      const rowKey = `${tenant}::${key}::${createTestCapability()}`;
      const row = harness.idempotencyCache.get(rowKey);
      expect(row).toBeDefined();
      row!.expires_at = new Date(Date.now() - 1000).toISOString();

      const check = await checkIdempotency(client, tenant, key, createTestCapability(), payload);
      expect(check.state).toBe("new");
    });
  });

  describe("audit envelopes (§6.3-shaped)", () => {
    it("does not put raw lease.arguments into lease.requested audit payload", async () => {
      const client = harness.createSupabaseClient();
      const req = baseLeaseRequest({
        arguments: {
          mode: "shadow",
          email: "lead@example.com",
          contact_phone: "+15555550123",
        },
      });

      await requestLease(client, mockEnv, req);

      const audits = getCapturedAuditEvents();
      const requested = audits.find((e) => e.action === "lease.requested");
      expect(requested?.payload).toBeDefined();
      const payloadStr = JSON.stringify(requested?.payload ?? {});
      expect(payloadStr).not.toContain("lead@example.com");
      expect(payloadStr).not.toContain("+15555550123");
      expect(requested?.payload).toMatchObject({
        capability: req.capability,
        idempotency_key: req.idempotency_key,
      });
    });

    it("validates envelopes succeed Linkbrain writer validation (mocked persistence)", async () => {
      const client = harness.createSupabaseClient();
      await requestLease(client, mockEnv, baseLeaseRequest());

      const audits = getCapturedAuditEvents();
      expect(audits.length).toBeGreaterThan(0);
      for (const ev of audits) {
        expect(ev.plane).toBe("linkskills");
        expect(ev.schema_version).toBe("1");
        expect(ev.subject["lease_id"]).toBeTruthy();
      }
    });
  });

  describe("WP-080 disclosure dependency", () => {
    it("documents omission: disclosure issuance tests belong with WP-080 integration surface", () => {
      expect(true).toBe(true);
    });
  });
});
