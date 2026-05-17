/**
 * In-memory Supabase-shaped harness for LinkSkills integration tests.
 * Implements only the query/RPC shapes exercised by lease lifecycle,
 * idempotency, kill switch, and safety paths — no live database.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { LeaseLedgerRow } from "../types.js";

type Op =
  | { kind: "eq"; col: string; val: unknown }
  | { kind: "is"; col: string; val: unknown }
  | { kind: "in"; col: string; vals: unknown[] }
  | { kind: "lte"; col: string; val: unknown };

export interface IdempotencyCacheRow {
  tenant_id: string;
  idempotency_key: string;
  capability: string;
  payload_hash: string;
  result: Record<string, unknown>;
  ledger_entry_id: string | null;
  expires_at: string;
}

export interface KillSwitchRowHarness {
  tenant_id: string | null;
  capability: string | null;
  switch_level: number;
  state: string;
  trigger_reason?: string;
  triggered_by?: string;
  triggered_at?: string;
  reset_by?: string;
  reset_at?: string;
  updated_at: string;
}

function matchesOps(row: Record<string, unknown>, ops: Op[]): boolean {
  for (const op of ops) {
    if (op.kind === "eq") {
      if (row[op.col] !== op.val) return false;
    } else if (op.kind === "is") {
      const v = row[op.col];
      if (op.val === null && v !== null && v !== undefined) return false;
      if (op.val !== null && v !== op.val) return false;
    } else if (op.kind === "in") {
      const v = row[op.col];
      if (!Array.isArray(op.vals) || !op.vals.includes(v)) return false;
    } else if (op.kind === "lte") {
      const v = row[op.col];
      if (typeof v !== "string" || typeof op.val !== "string") return false;
      if (new Date(v).getTime() > new Date(op.val).getTime()) return false;
    }
  }
  return true;
}

export class LinkskillsIntegrationHarness {
  readonly registeredCapabilities = new Set<string>(["cap.test.echo"]);

  leases = new Map<string, LeaseLedgerRow>();
  /** tenant_id + "::" + idempotency_key → lease_id */
  leaseKeyIndex = new Map<string, string>();

  policyMode: "require_approval" | "auto_grant" | "deny_all" = "auto_grant";

  idempotencyCache = new Map<string, IdempotencyCacheRow>();

  killSwitchRows: KillSwitchRowHarness[] = [];

  /** RPC-backed capability trips (trip_kill_switch / reset_kill_switch). */
  rpcCapabilityTrips = new Set<string>();

  reset(): void {
    this.leases.clear();
    this.leaseKeyIndex.clear();
    this.policyMode = "auto_grant";
    this.idempotencyCache.clear();
    this.killSwitchRows = [];
    this.rpcCapabilityTrips.clear();
    this.registeredCapabilities.clear();
    this.registeredCapabilities.add("cap.test.echo");
  }

  registerCapability(capabilityId: string): void {
    this.registeredCapabilities.add(capabilityId);
  }

  private leaseIndexKey(tenantId: string, idempotencyKey: string): string {
    return `${tenantId}::${idempotencyKey}`;
  }

  private idempotencyStoreKey(tenantId: string, idempotencyKey: string, capability: string): string {
    return `${tenantId}::${idempotencyKey}::${capability}`;
  }

  killSwitchDenies(params: {
    tenant_id: string;
    capability_id: string;
  }): boolean {
    const globalHalt = this.killSwitchRows.some(
      (r) =>
        r.tenant_id === null &&
        r.capability === null &&
        r.switch_level === 2 &&
        r.state === "tripped",
    );
    if (globalHalt) return true;
    return this.isKillSwitchTrippedRpc(params.capability_id, params.tenant_id);
  }

  private isKillSwitchTrippedRpc(capability_id: string, tenant_id: string): boolean {
    return (
      this.rpcCapabilityTrips.has(`${tenant_id}|${capability_id}`) ||
      this.rpcCapabilityTrips.has(`null|${capability_id}`)
    );
  }

  queryMaybeSingle(table: string, ops: Op[]): { data: unknown; error: null } {
    if (table === "capabilities") {
      const capId = ops.find((o): o is Extract<Op, { kind: "eq" }> => o.kind === "eq" && o.col === "capability_id")?.val;
      if (typeof capId !== "string" || !this.registeredCapabilities.has(capId)) {
        return { data: null, error: null };
      }
      return {
        data: {
          capability_id: capId,
          plugin_kind: "capability",
          target_software: "test",
          allowed_operations: ["echo"],
          auth_requirements: [],
          mode_flags: ["shadow"],
          lease_requirements: [],
          idempotency_rules: "24h",
          audit_events: [],
          allowed_callers: ["linkaios"],
          failure_mapping: {},
          not_configured: [],
          version: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        error: null,
      };
    }

    if (table === "lease_requests") {
      const rows = [...this.leases.values()];
      const match = rows.find((r) =>
        matchesOps(r as unknown as Record<string, unknown>, ops),
      );
      return { data: match ?? null, error: null };
    }

    if (table === "idempotency_cache") {
      const tenant = ops.find((o): o is Extract<Op, { kind: "eq" }> => o.kind === "eq" && o.col === "tenant_id")?.val;
      const idem = ops.find((o): o is Extract<Op, { kind: "eq" }> => o.kind === "eq" && o.col === "idempotency_key")?.val;
      const cap = ops.find((o): o is Extract<Op, { kind: "eq" }> => o.kind === "eq" && o.col === "capability")?.val;
      if (typeof tenant !== "string" || typeof idem !== "string" || typeof cap !== "string") {
        return { data: null, error: null };
      }
      const row = this.idempotencyCache.get(this.idempotencyStoreKey(tenant, idem, cap));
      return { data: row ?? null, error: null };
    }

    if (table === "kill_switches") {
      const rows = this.killSwitchRows.map((r) => ({
        switch_level: r.switch_level,
        state: r.state,
        trigger_reason: r.trigger_reason,
        tenant_id: r.tenant_id,
        capability: r.capability,
      }));
      const match = rows.find((r) =>
        matchesOps(r as Record<string, unknown>, ops),
      );
      return { data: match ?? null, error: null };
    }

    return { data: null, error: null };
  }

  queryMany(table: string, ops: Op[]): { data: unknown[]; error: null } {
    if (table !== "kill_switches") return { data: [], error: null };
    const rows = this.killSwitchRows.map((r) => ({
      switch_level: r.switch_level,
      state: r.state,
      trigger_reason: r.trigger_reason,
      tenant_id: r.tenant_id,
      capability: r.capability,
    }));
    const filtered = rows.filter((r) =>
      matchesOps(r as Record<string, unknown>, ops),
    );
    return { data: filtered, error: null };
  }

  upsert(table: string, row: Record<string, unknown>): { error: null } {
    if (table === "idempotency_cache") {
      const tenant_id = row.tenant_id as string;
      const idempotency_key = row.idempotency_key as string;
      const capability = row.capability as string;
      const key = this.idempotencyStoreKey(tenant_id, idempotency_key, capability);
      this.idempotencyCache.set(key, {
        tenant_id,
        idempotency_key,
        capability,
        payload_hash: row.payload_hash as string,
        result: (row.result ?? {}) as Record<string, unknown>,
        ledger_entry_id: (row.ledger_entry_id as string | null) ?? null,
        expires_at: row.expires_at as string,
      });
      return { error: null };
    }

    if (table === "kill_switches") {
      const tenant_id = (row.tenant_id as string | null | undefined) ?? null;
      const capability = (row.capability as string | null | undefined) ?? null;
      const switch_level = row.switch_level as number;
      const idx = this.killSwitchRows.findIndex(
        (r) =>
          r.tenant_id === tenant_id &&
          r.capability === capability &&
          r.switch_level === switch_level,
      );
      const merged: KillSwitchRowHarness = {
        tenant_id,
        capability,
        switch_level,
        state: String(row.state),
        updated_at: String(row.updated_at),
      };
      if (typeof row.trigger_reason === "string") merged.trigger_reason = row.trigger_reason;
      if (typeof row.triggered_by === "string") merged.triggered_by = row.triggered_by;
      if (typeof row.triggered_at === "string") merged.triggered_at = row.triggered_at;
      if (typeof row.reset_by === "string") merged.reset_by = row.reset_by;
      if (typeof row.reset_at === "string") merged.reset_at = row.reset_at;
      if (idx >= 0) this.killSwitchRows[idx] = merged;
      else this.killSwitchRows.push(merged);
      return { error: null };
    }

    return { error: null };
  }

  /** Updates every lease_requests row matching filters (Supabase bulk update semantics). */
  applyLeaseUpdates(
    patch: Record<string, unknown>,
    ops: Op[],
  ): Promise<{ data: LeaseLedgerRow[]; error: null }> {
    const updated: LeaseLedgerRow[] = [];
    const nowIso = new Date().toISOString();
    for (const [id, lease] of this.leases) {
      if (!matchesOps(lease as unknown as Record<string, unknown>, ops)) continue;
      const next = {
        ...lease,
        ...patch,
        updated_at: (patch.updated_at as string | undefined) ?? nowIso,
      } as LeaseLedgerRow;
      this.leases.set(id, next);
      updated.push(next);
    }
    return Promise.resolve({ data: updated, error: null });
  }

  finishLeasePatch(
    patch: Record<string, unknown>,
    ops: Op[],
    selectLeaseIdsOnly: boolean,
  ): Promise<{ data: unknown; error: null }> {
    return this.applyLeaseUpdates(patch, ops).then(({ data }) => ({
      data: selectLeaseIdsOnly ? data.map((r) => ({ lease_id: r.lease_id })) : data,
      error: null,
    }));
  }

  applyKillSwitchUpdates(
    patch: Record<string, unknown>,
    ops: Op[],
  ): Promise<{ data: KillSwitchRowHarness[]; error: null }> {
    const updated: KillSwitchRowHarness[] = [];
    const nowIso = new Date().toISOString();
    for (const row of this.killSwitchRows) {
      const plain = {
        tenant_id: row.tenant_id,
        capability: row.capability,
        switch_level: row.switch_level,
        state: row.state,
      };
      if (!matchesOps(plain as Record<string, unknown>, ops)) continue;
      const merged = {
        ...row,
        ...patch,
        updated_at: (patch.updated_at as string | undefined) ?? nowIso,
      } as KillSwitchRowHarness;
      Object.assign(row, merged);
      updated.push(row);
    }
    return Promise.resolve({ data: updated, error: null });
  }

  rpc(fn: string, params: Record<string, unknown>): unknown {
    switch (fn) {
      case "get_capability_policy":
        return this.policyMode;

      case "is_kill_switch_tripped": {
        const capability_id = params.p_capability_id as string;
        const tenant_id = params.p_tenant_id as string;
        return this.isKillSwitchTrippedRpc(capability_id, tenant_id);
      }

      case "trip_kill_switch": {
        const cap = params.p_capability_id as string;
        const tenant = (params.p_tenant_id as string | null | undefined) ?? null;
        const key = `${tenant ?? "null"}|${cap}`;
        this.rpcCapabilityTrips.add(key);
        return true;
      }

      case "reset_kill_switch": {
        const cap = params.p_capability_id as string;
        const tenant = (params.p_tenant_id as string | null | undefined) ?? null;
        const key = `${tenant ?? "null"}|${cap}`;
        this.rpcCapabilityTrips.delete(key);
        return true;
      }

      case "request_lease": {
        const tenant_id = params.p_tenant_id as string;
        const run_id = params.p_run_id as string;
        const stage_id = params.p_stage_id as string;
        const capability_id = params.p_capability_id as string;
        const arguments_ = (params.p_arguments ?? {}) as Record<string, unknown>;
        const idempotency_key = params.p_idempotency_key as string;
        const actor_kind = params.p_actor_kind as LeaseLedgerRow["actor_kind"];
        const actor_id = params.p_actor_id as string;

        const ksDenied = this.killSwitchDenies({ tenant_id, capability_id });

        const idx = this.leaseIndexKey(tenant_id, idempotency_key);
        const existingId = this.leaseKeyIndex.get(idx);
        if (existingId) {
          const existing = this.leases.get(existingId);
          if (!existing) return [{ lease_id: "", status: "denied", is_existing: false, kill_switch_state: "open" }];
          return [
            {
              lease_id: existing.lease_id,
              status: existing.status,
              is_existing: true,
              kill_switch_state: ksDenied ? "tripped" : "open",
            },
          ];
        }

        const lease_id = crypto.randomUUID();
        const now = new Date().toISOString();
        const row: LeaseLedgerRow = {
          lease_id,
          tenant_id,
          run_id,
          stage_id,
          capability_id,
          arguments: arguments_,
          idempotency_key,
          actor_kind,
          actor_id,
          status: ksDenied ? "denied" : "requested",
          requested_at: now,
          created_at: now,
          updated_at: now,
        };
        this.leases.set(lease_id, row);
        this.leaseKeyIndex.set(idx, lease_id);

        return [
          {
            lease_id,
            status: row.status,
            is_existing: false,
            kill_switch_state: ksDenied ? "tripped" : "open",
          },
        ];
      }

      case "grant_lease": {
        const lease_id = params.p_lease_id as string;
        const decision_status = params.p_decision_status as "granted" | "requires_approval";
        const ttl_seconds = Number(params.p_ttl_seconds ?? 0);
        const lease = this.leases.get(lease_id);
        if (!lease) return false;
        const now = Date.now();
        const expires_at =
          decision_status === "granted" && ttl_seconds > 0
            ? new Date(now + ttl_seconds * 1000).toISOString()
            : lease.expires_at;
        const next: LeaseLedgerRow = {
          ...lease,
          status: decision_status === "requires_approval" ? "requires_approval" : "granted",
          decided_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        if (expires_at !== undefined) {
          next.expires_at = expires_at;
        }
        if (typeof params.p_reason === "string") {
          next.decision_reason = params.p_reason;
        }
        this.leases.set(lease_id, next);
        return true;
      }

      case "deny_lease": {
        const lease_id = params.p_lease_id as string;
        const lease = this.leases.get(lease_id);
        if (!lease) return false;
        const next: LeaseLedgerRow = {
          ...lease,
          status: "denied",
          updated_at: new Date().toISOString(),
        };
        if (typeof params.p_reason === "string") {
          next.decision_reason = params.p_reason;
        }
        this.leases.set(lease_id, next);
        return true;
      }

      case "record_execution": {
        const lease_id = params.p_lease_id as string;
        const result = params.p_result as Record<string, unknown>;
        const audit_event_id = params.p_audit_event_id as string;
        const lease = this.leases.get(lease_id);
        if (!lease) return [{ is_duplicate: false }];
        if (lease.status === "executed" && lease.execution_result) {
          return [{ is_duplicate: true }];
        }
        this.leases.set(lease_id, {
          ...lease,
          status: "executed",
          execution_result: result,
          audit_event_id,
          executed_at: new Date().toISOString(),
          ledger_entry_id: lease_id,
          updated_at: new Date().toISOString(),
        });
        return [{ is_duplicate: false }];
      }

      default:
        return null;
    }
  }

  createSupabaseClient(): SupabaseClient {
    const harness = this;

    const buildTableQuery = (table: string): Record<string, unknown> => {
      const ops: Op[] = [];

      const selectChain: Record<string, unknown> = {
        select: (_cols?: string) => selectChain,
        eq: (col: string, val: unknown) => {
          ops.push({ kind: "eq", col, val });
          return selectChain;
        },
        is: (col: string, val: unknown) => {
          ops.push({ kind: "is", col, val });
          return selectChain;
        },
        in: (col: string, vals: unknown[]) => {
          ops.push({ kind: "in", col, vals });
          return selectChain;
        },
        lte: (col: string, val: unknown) => {
          ops.push({ kind: "lte", col, val });
          return selectChain;
        },
        order: (_col: string, _opts?: unknown) => selectChain,
        limit: (n: number) => {
          const { data } =
            table === "kill_switches" ? harness.queryMany(table, ops) : { data: [] as unknown[] };
          return Promise.resolve({
            data: data.slice(0, n),
            error: null,
          });
        },
        maybeSingle: () => Promise.resolve(harness.queryMaybeSingle(table, ops)),
        single: () => harness.queryMaybeSingle(table, ops),
        upsert: (row: Record<string, unknown>, _opts?: unknown) =>
          Promise.resolve(harness.upsert(table, row)),
      };

      selectChain.update = (patch: Record<string, unknown>) => {
        const uops: Op[] = [];
        const updateChain: Record<string, unknown> = {
          eq: (col: string, val: unknown) => {
            uops.push({ kind: "eq", col, val });
            return updateChain;
          },
          is: (col: string, val: unknown) => {
            uops.push({ kind: "is", col, val });
            return updateChain;
          },
          in: (col: string, vals: unknown[]) => {
            uops.push({ kind: "in", col, vals });
            return updateChain;
          },
          lte: (col: string, val: unknown) => {
            uops.push({ kind: "lte", col, val });
            return updateChain;
          },
          select: (_cols?: string) => {
            if (table === "lease_requests") {
              return harness.finishLeasePatch(patch, uops, true);
            }
            return Promise.resolve({ data: [], error: null });
          },
          then: (
            onFulfilled?: (value: { data: unknown; error: null }) => unknown,
            onRejected?: (reason: unknown) => unknown,
          ) => {
            if (table === "lease_requests") {
              return harness.finishLeasePatch(patch, uops, false).then(onFulfilled as never, onRejected as never);
            }
            if (table === "kill_switches") {
              return harness.applyKillSwitchUpdates(patch, uops).then(onFulfilled as never, onRejected as never);
            }
            return Promise.resolve({ data: null, error: null }).then(onFulfilled as never, onRejected as never);
          },
        };
        return updateChain;
      };

      return selectChain;
    };

    const schemaApi = {
      rpc: (fn: string, params?: Record<string, unknown>) =>
        Promise.resolve({
          data: harness.rpc(fn, params ?? {}),
          error: null,
        }),
      from: (table: string) => buildTableQuery(table),
    };

    return {
      schema: () => schemaApi,
    } as unknown as SupabaseClient;
  }
}

