/** Demo-only rows for LiNKskills / LiNKbrain / model picks in worker screens (UI mocks only). */

import {
  defaultAgentRuntimeSettings,
  mergeRuntimeSettings,
  type AgentRuntimeSettings,
  type ModelCategoryId,
} from "../agent-runtime-settings";

export type { ModelCategoryId, AgentRuntimeSettings } from "../agent-runtime-settings";
export { MODEL_CATEGORY_LABELS, APPROVED_MODEL_CATALOG } from "../agent-runtime-settings";

export type DemoAgentSkillRow = {
  id: string;
  category: string;
  description: string;
  status: "enabled" | "disabled" | "pending";
  version: string;
  updated: string;
  defaultOn: boolean;
};

export type DemoPersonaLayer = {
  layer: string;
  summary: string;
  updated: string;
};

export const DEMO_AGENT_SKILLS: Record<string, DemoAgentSkillRow[]> = {
  "demo-lisa": [
    {
      id: "sk-lisa-1",
      category: "Strategy",
      description: "Portfolio prioritisation and exec briefing synthesis.",
      status: "enabled",
      version: "2.1.0",
      updated: "2026-04-01",
      defaultOn: true,
    },
    {
      id: "sk-lisa-2",
      category: "Comms",
      description: "Draft stakeholder updates from mission deltas.",
      status: "enabled",
      version: "1.4.2",
      updated: "2026-03-22",
      defaultOn: true,
    },
    {
      id: "sk-lisa-3",
      category: "Research",
      description: "Market scan against approved sources only.",
      status: "pending",
      version: "0.9.0",
      updated: "2026-04-10",
      defaultOn: false,
    },
  ],
  "demo-eric": [
    {
      id: "sk-eric-1",
      category: "Engineering",
      description: "Terraform plan review with policy guardrails.",
      status: "enabled",
      version: "3.0.1",
      updated: "2026-04-08",
      defaultOn: true,
    },
    {
      id: "sk-eric-2",
      category: "Security",
      description: "Dependency and secret hygiene checks.",
      status: "disabled",
      version: "1.1.0",
      updated: "2026-02-14",
      defaultOn: false,
    },
  ],
};

export const DEMO_AGENT_PERSONA: Record<string, DemoPersonaLayer[]> = {
  "demo-lisa": [
    { layer: "Base persona", summary: "Calm, decisive executive voice; cites evidence.", updated: "2026-03-01" },
    { layer: "Soul", summary: "Long-horizon optimism; low ego in threads.", updated: "2026-03-15" },
    { layer: "Identity", summary: "CEO LiNKbot — portfolio and mission alignment.", updated: "2026-04-01" },
    { layer: "Agent", summary: "Default tools: memory_search, mission_board (governed).", updated: "2026-04-12" },
  ],
  "demo-eric": [
    { layer: "Base persona", summary: "Direct, precise technical reviewer.", updated: "2026-03-05" },
    { layer: "Soul", summary: "Curious builder; prefers small reversible steps.", updated: "2026-03-20" },
    { layer: "Identity", summary: "CTO LiNKbot — architecture and release risk.", updated: "2026-04-02" },
    { layer: "Agent", summary: "Codex-style harness; human approval on applies.", updated: "2026-04-11" },
  ],
};

export const DEMO_AGENT_MODEL_DEFAULTS: Record<string, Record<ModelCategoryId, string>> = {
  "demo-lisa": {
    heartbeat: "claude-3-5-haiku",
    context_lt_100k: "claude-sonnet-4",
    context_gt_100k: "claude-sonnet-4",
    execution: "claude-sonnet-4",
    fallback: "gpt-4.1-mini",
  },
  "demo-eric": {
    heartbeat: "gpt-4.1-mini",
    context_lt_100k: "gpt-4.1",
    context_gt_100k: "claude-sonnet-4",
    execution: "gpt-4.1",
    fallback: "gemini-2.0-flash",
  },
};

/** Demo LiNKbot programmable policy (not persisted). */
export function demoAgentRuntimeSettings(agentId: string): AgentRuntimeSettings {
  const base = defaultAgentRuntimeSettings();
  const primary = DEMO_AGENT_MODEL_DEFAULTS[agentId] ?? DEMO_AGENT_MODEL_DEFAULTS["demo-lisa"];
  if (agentId === "demo-lisa") {
    return mergeRuntimeSettings(base, {
      models: {
        primary,
        fallbackOnline: "gpt-4.1-mini",
        fallbackLocal: "llama-3.1-8b-instruct-local",
      },
      cloudSpend: { tokenAlertThreshold: 400_000, tokenHardCap: 2_000_000 },
      linkaiosProfile: {
        title: "Chief Executive Officer",
        description: "Demo executive LiNKbot — strategy, portfolio prioritisation, and cross-project alignment.",
        reportsToAgentId: null,
      },
    });
  }
  if (agentId === "demo-eric") {
    return mergeRuntimeSettings(base, {
      models: {
        primary,
        fallbackOnline: "gemini-2.0-flash",
        fallbackLocal: "qwen2.5-7b-instruct-local",
      },
      cloudSpend: { tokenAlertThreshold: 800_000, tokenHardCap: 4_000_000 },
      linkaiosProfile: {
        title: "Chief Technology Officer",
        description: "Demo technical LiNKbot — architecture reviews, release risk, and engineering coordination.",
        reportsToAgentId: "demo-lisa",
      },
    });
  }
  return mergeRuntimeSettings(base, { models: { primary } });
}

/** Company-wide LiNKskills rows (all agents). */
export function demoCompanySkillAssignments(): Array<
  DemoAgentSkillRow & { agentId: string; agentName: string }
> {
  const out: Array<DemoAgentSkillRow & { agentId: string; agentName: string }> = [];
  for (const [agentId, rows] of Object.entries(DEMO_AGENT_SKILLS)) {
    const agentName = agentId === "demo-lisa" ? "Lisa (CEO)" : "Eric (CTO)";
    for (const r of rows) {
      out.push({ ...r, agentId, agentName });
    }
  }
  return out;
}

/** Company-wide persona / brain rows. */
export function demoCompanyPersonaRows(): Array<DemoPersonaLayer & { agentId: string; agentName: string }> {
  const out: Array<DemoPersonaLayer & { agentId: string; agentName: string }> = [];
  for (const [agentId, layers] of Object.entries(DEMO_AGENT_PERSONA)) {
    const agentName = agentId === "demo-lisa" ? "Lisa (CEO)" : "Eric (CTO)";
    for (const layer of layers) {
      out.push({ ...layer, agentId, agentName });
    }
  }
  return out;
}

/** UI-review fixtures for non-demo LiNKbot LiNKskills tab (not from DB). */
export const MOCK_UI_AGENT_SKILLS_ROWS: DemoAgentSkillRow[] = [
  {
    id: "mock-sk-research",
    category: "Research",
    description: "Scan approved sources and produce cited briefs for missions.",
    status: "enabled",
    version: "2.0.1",
    updated: "2026-04-14",
    defaultOn: true,
  },
  {
    id: "mock-sk-comms",
    category: "Comms",
    description: "Draft stakeholder updates from mission deltas and LiNKbrain notes.",
    status: "pending",
    version: "0.8.0",
    updated: "2026-04-10",
    defaultOn: false,
  },
  {
    id: "mock-sk-ops",
    category: "Operations",
    description: "Checklist runs for release gates and incident warm-handoffs.",
    status: "disabled",
    version: "1.2.3",
    updated: "2026-03-28",
    defaultOn: false,
  },
];

/** UI-review fixtures for non-demo LiNKbot LiNKbrain tab (not from DB). */
export const MOCK_UI_AGENT_PERSONA_LAYERS: DemoPersonaLayer[] = [
  { layer: "Base persona", summary: "Direct, evidence-first tone; avoids speculation.", updated: "2026-04-02" },
  { layer: "Soul", summary: "Patient with ambiguity; asks one clarifying question when needed.", updated: "2026-04-05" },
  { layer: "Identity", summary: "Mission-aligned operator — prioritises customer outcomes.", updated: "2026-04-09" },
  { layer: "Agent", summary: "Default tools: memory_search, mission_board (preview fixture).", updated: "2026-04-12" },
];
