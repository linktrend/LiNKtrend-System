import type { SkillCatalogRow } from "@/components/skills-catalog-table";
import type { ToolCatalogRow } from "@/components/tools-catalog-table";

/** Prefixed ids — not in DB; catalogue tables treat these as read-only fixtures. */
const FIX = "00000000-0000-4000-8000-";

export const DEMO_SKILL_CATALOG_ROWS: SkillCatalogRow[] = [
  {
    id: `${FIX}00000000b101`,
    name: "linktrend.exec_briefing",
    type: "Skill",
    category: "Strategy",
    description: "Synthesise mission deltas into a one-page exec briefing with citations.",
    published: true,
    runtimeEnabled: true,
    status: "approved",
    updated_at: "2026-04-14T10:00:00.000Z",
    isFixture: true,
  },
  {
    id: `${FIX}00000000b102`,
    name: "linktrend.customer_voice",
    type: "Skill",
    category: "Research",
    description: "Pull structured themes from approved feedback channels (fixture).",
    published: true,
    runtimeEnabled: false,
    status: "approved",
    updated_at: "2026-04-12T16:30:00.000Z",
    isFixture: true,
  },
  {
    id: `${FIX}00000000b103`,
    name: "linktrend.release_gate",
    type: "Skill",
    category: "Engineering",
    description: "Checklist-driven release review with policy guardrails (fixture).",
    published: false,
    runtimeEnabled: false,
    status: "draft",
    updated_at: "2026-04-10T09:15:00.000Z",
    isFixture: true,
  },
];

export const DEMO_TOOL_CATALOG_ROWS: ToolCatalogRow[] = [
  {
    id: `${FIX}00000000c101`,
    name: "memory_search",
    tool_type: "mcp",
    category: "LiNKbrain",
    description: "Semantic search over governed memory partitions (fixture).",
    published: true,
    runtimeEnabled: true,
    status: "approved",
    updated_at: "2026-04-13T11:00:00.000Z",
    isFixture: true,
  },
  {
    id: `${FIX}00000000c102`,
    name: "mission_board",
    tool_type: "bundle",
    category: "Projects",
    description: "Read/write mission board tiles and status transitions (fixture).",
    published: true,
    runtimeEnabled: true,
    status: "approved",
    updated_at: "2026-04-11T14:20:00.000Z",
    isFixture: true,
  },
  {
    id: `${FIX}00000000c103`,
    name: "gateway_zulip_mirror",
    tool_type: "http",
    category: "Comms",
    description: "Outbound Zulip thread mirror with idempotency keys (fixture).",
    published: false,
    runtimeEnabled: false,
    status: "draft",
    updated_at: "2026-04-09T08:45:00.000Z",
    isFixture: true,
  },
];

export function mergeSkillCatalogWithDemo(rows: SkillCatalogRow[]): SkillCatalogRow[] {
  const ids = new Set(rows.map((r) => r.id));
  const extra = DEMO_SKILL_CATALOG_ROWS.filter((r) => !ids.has(r.id));
  return [...extra, ...rows];
}

export function mergeToolCatalogWithDemo(rows: ToolCatalogRow[]): ToolCatalogRow[] {
  const ids = new Set(rows.map((r) => r.id));
  const extra = DEMO_TOOL_CATALOG_ROWS.filter((r) => !ids.has(r.id));
  return [...extra, ...rows];
}
