import type { AgentRecord } from "@linktrend/shared-types";

export type FleetOrgFleetRow = AgentRecord & { role?: string; demo?: boolean };

export type OrgChartIcon = "crown" | "globe" | "chip" | "code";

export type FleetOrgNodeKind = "role" | "team" | "agent";

export type FleetOrgNode = {
  id: string;
  kind: FleetOrgNodeKind;
  title: string;
  subtitle: string;
  icon: OrgChartIcon;
  dot: "emerald" | "amber";
  /** Small label under title (e.g. model name) */
  badge?: string;
  href?: string;
  x: number;
  y: number;
};

export type FleetOrgEdge = { from: string; to: string };

/** Fixed layout (viewBox 1000×560) — illustrative hierarchy. */
const BASE_NODES: FleetOrgNode[] = [
  {
    id: "ceo",
    kind: "role",
    title: "CEO",
    subtitle: "Chief Executive Officer",
    icon: "crown",
    dot: "emerald",
    badge: "Lisa",
    x: 500,
    y: 76,
    href: undefined,
  },
  {
    id: "cto",
    kind: "role",
    title: "CTO",
    subtitle: "Chief Technology Officer",
    icon: "chip",
    dot: "emerald",
    badge: "Eric",
    x: 220,
    y: 232,
    href: undefined,
  },
  {
    id: "cmo",
    kind: "role",
    title: "CMO",
    subtitle: "Chief Marketing Officer",
    icon: "globe",
    dot: "amber",
    badge: "—",
    x: 500,
    y: 232,
  },
  {
    id: "platform",
    kind: "team",
    title: "Platform",
    subtitle: "Additional LiNKbots",
    icon: "chip",
    dot: "amber",
    badge: "Pool",
    x: 780,
    y: 232,
  },
  {
    id: "claude-coder",
    kind: "agent",
    title: "ClaudeCoder",
    subtitle: "Illustrative code agent",
    icon: "code",
    dot: "emerald",
    badge: "Claude",
    x: 140,
    y: 418,
  },
  {
    id: "codex-coder",
    kind: "agent",
    title: "CodexCoder",
    subtitle: "Illustrative code agent",
    icon: "code",
    dot: "emerald",
    badge: "GPT",
    x: 300,
    y: 418,
  },
];

const BASE_EDGES: FleetOrgEdge[] = [
  { from: "ceo", to: "cto" },
  { from: "ceo", to: "cmo" },
  { from: "ceo", to: "platform" },
  { from: "cto", to: "claude-coder" },
  { from: "cto", to: "codex-coder" },
];

export function buildFleetOrgChart(fleet: FleetOrgFleetRow[]): {
  nodes: FleetOrgNode[];
  edges: FleetOrgEdge[];
  extraAgents: { id: string; display_name: string }[];
} {
  const byId = new Map(fleet.map((a) => [String(a.id), a]));
  const nodes = BASE_NODES.map((n) => {
    if (n.id === "ceo" && byId.has("demo-lisa")) {
      const a = byId.get("demo-lisa")!;
      return {
        ...n,
        badge: a.display_name.replace(/\s*\(.*\)\s*$/, "").trim() || n.badge,
        href: `/workers/${a.id}/sessions`,
      };
    }
    if (n.id === "cto" && byId.has("demo-eric")) {
      const a = byId.get("demo-eric")!;
      return {
        ...n,
        badge: a.display_name.replace(/\s*\(.*\)\s*$/, "").trim() || n.badge,
        href: `/workers/${a.id}/sessions`,
      };
    }
    if (n.id === "platform") {
      const extras = fleet.filter((a) => !a.demo && !["demo-lisa", "demo-eric"].includes(String(a.id)));
      if (extras.length === 1) {
        const a = extras[0]!;
        return {
          ...n,
          subtitle: String(a.display_name),
          badge: "Live",
          dot: "emerald" as const,
          href: `/workers/${a.id}/sessions`,
        };
      }
      if (extras.length > 1) {
        return {
          ...n,
          subtitle: `${extras.length} agents`,
          badge: "Live",
          href: "/workers?view=list",
        };
      }
    }
    return n;
  });

  const chartIds = new Set(nodes.map((n) => n.id));
  const extraAgents = fleet
    .filter((a) => a.id !== "demo-lisa" && a.id !== "demo-eric")
    .map((a) => ({ id: String(a.id), display_name: a.display_name }));

  return { nodes, edges: BASE_EDGES.filter((e) => chartIds.has(e.from) && chartIds.has(e.to)), extraAgents };
}
