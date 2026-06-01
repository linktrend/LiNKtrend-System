import { describe, expect, it } from "vitest";
import {
  getCapabilityApi,
  getCapabilityPublicContract,
  listCapabilitiesApi,
  registerCapability,
  validateCapabilityModes,
  validateCapabilityPluginContractPack,
  validateCapabilityReference,
  V1_MVO_CAPABILITY_SEEDS,
} from "./capability-catalog-api.js";

type Row = Record<string, unknown>;

class FakeQuery {
  private filtered: Row[];
  private pickSingle = false;
  constructor(
    private readonly rows: Row[],
    private readonly nextError: { message: string } | null,
    private readonly singleInsertRow: Row | null = null,
  ) {
    this.filtered = [...rows];
  }

  select() { return this; }
  order() { return this; }
  limit(value: number) { this.filtered = this.filtered.slice(0, value); return this; }
  eq(column: string, value: unknown) { this.filtered = this.filtered.filter((r) => r[column] === value); return this; }
  contains(column: string, value: unknown[]) {
    this.filtered = this.filtered.filter((r) => {
      const current = r[column];
      return Array.isArray(current) && value.every((v) => current.includes(v));
    });
    return this;
  }
  insert(row: Row) { this.filtered = [row]; return this; }
  maybeSingle() { this.pickSingle = true; return this.exec(); }
  single() { this.pickSingle = true; return this.exec(); }
  then(resolve: (v: unknown) => unknown) { return Promise.resolve(this.exec()).then(resolve); }
  private exec() {
    if (this.nextError) return { data: null, error: this.nextError };
    if (this.pickSingle) {
      const row = this.singleInsertRow ?? this.filtered[0] ?? null;
      return { data: row, error: null };
    }
    return { data: this.filtered, error: null };
  }
}

class FakeClient {
  constructor(private readonly rows: Row[]) {}
  schema() { return this; }
  from() { return new FakeQuery(this.rows, null); }
}

describe("capability-catalog-api", () => {
  const seed = {
    ...V1_MVO_CAPABILITY_SEEDS[0],
    plugin_kind: "capability",
    version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  it("registers a valid capability manifest", async () => {
    const client = new FakeClient([]);
    const result = await registerCapability(client as never, V1_MVO_CAPABILITY_SEEDS[1]!);
    expect(result.error).toBeNull();
    expect(result.data?.capability_id).toBe("cap.accounting.odoo_shadow");
  });

  it("rejects invalid manifest when not_configured is empty", async () => {
    const client = new FakeClient([]);
    const bad = { ...V1_MVO_CAPABILITY_SEEDS[0], not_configured: [] as [] };
    const result = await registerCapability(client as never, bad as never);
    expect(result.data).toBeNull();
    expect(result.error?.message).toContain("not_configured must not be empty");
  });

  it("lists capabilities with mode filter", async () => {
    const client = new FakeClient([seed]);
    const result = await listCapabilitiesApi(client as never, { mode: "shadow" });
    expect(result.error).toBeNull();
    expect(result.data).toHaveLength(1);
  });

  it("looks up a capability and returns public contract", async () => {
    const client = new FakeClient([seed]);
    const one = await getCapabilityApi(client as never, "cap.crm.odoo_shadow");
    const pub = await getCapabilityPublicContract(client as never, "cap.crm.odoo_shadow");
    expect(one.data?.capability_id).toBe("cap.crm.odoo_shadow");
    expect(pub.data?.capability_id).toBe("cap.crm.odoo_shadow");
    expect(pub.data?.failure_mapping).toBeDefined();
  });

  it("validates reference and supported mode", async () => {
    const client = new FakeClient([seed]);
    expect(await validateCapabilityReference(client as never, "cap.crm.odoo_shadow")).toBe(true);
    expect(await validateCapabilityModes(client as never, "cap.crm.odoo_shadow", "shadow")).toBe(true);
    expect(await validateCapabilityModes(client as never, "cap.crm.odoo_shadow", "live")).toBe(false);
  });

  it("seeds canonical connector contracts with connector-specific operations", () => {
    const plane = V1_MVO_CAPABILITY_SEEDS.find((entry) => entry.capability_id === "cap.plane.execution_tracking");
    const zulip = V1_MVO_CAPABILITY_SEEDS.find((entry) => entry.capability_id === "cap.zulip.run_messaging");

    expect(plane?.target_software).toBe("plane");
    expect(plane?.allowed_operations).toContain("project.ensure_mock");
    expect(plane?.allowed_operations).toContain("task.ensure_mock");
    expect(plane?.not_configured).toContain("Plane workspace structure policy");

    expect(zulip?.target_software).toBe("zulip");
    expect(zulip?.allowed_operations).toContain("channel.message.mock_send");
    expect(zulip?.lease_requirements).toContain("zulip.channel.message.send");
  });

  it("keeps public web research read-only live while write connectors remain non-live", () => {
    const research = V1_MVO_CAPABILITY_SEEDS.find((entry) => entry.capability_id === "cap.research.public_web");
    const writeCapabilities = V1_MVO_CAPABILITY_SEEDS.filter((entry) =>
      [
        "cap.crm.odoo_shadow",
        "cap.payload.local_sync",
        "cap.supabase.mirror_content",
        "cap.zulip.run_messaging",
        "cap.asset.generation",
        "cap.plane.execution_tracking",
      ].includes(entry.capability_id),
    );

    expect(research?.mode_flags).toContain("live");
    expect(writeCapabilities.every((entry) => !entry.mode_flags.includes("live"))).toBe(true);
    for (const entry of V1_MVO_CAPABILITY_SEEDS) {
      expect(validateCapabilityPluginContractPack(entry)).toEqual([]);
    }
  });
});
