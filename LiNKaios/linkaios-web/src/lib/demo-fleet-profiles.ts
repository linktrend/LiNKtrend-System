import type { LinkbotFleetStatusLabel } from "@/lib/linkbot-fleet-status";

/** Demo LiNKbot fleet profiles for UI review (`LINKAIOS_UI_MOCKS=1`). */

export type DemoFleetProfile = {
  id: string;
  role: string;
  description: string;
  projectTitles: string[];
  /** Single fleet status badge: Inactive | Busy | Idle | Online */
  statusLabel: LinkbotFleetStatusLabel;
  lastHeartbeatIso: string;
  currentActivity: string;
  primaryModel: string;
};

const minutesAgo = (m: number) => new Date(Date.now() - m * 60 * 1000).toISOString();

export const DEMO_FLEET_PROFILES: Record<string, DemoFleetProfile> = {
  "demo-lisa": {
    id: "demo-lisa",
    role: "Chief Executive Officer",
    description:
      "Demo executive LiNKbot — strategy, portfolio prioritisation, and cross-project alignment.",
    projectTitles: ["SMB Website Builder", "Northwind modernisation"],
    statusLabel: "Busy",
    lastHeartbeatIso: minutesAgo(2),
    currentActivity: "Reviewing portfolio threads (fixture).",
    primaryModel: "claude-sonnet-4",
  },
  "demo-eric": {
    id: "demo-eric",
    role: "Chief Technology Officer",
    description:
      "Demo technical LiNKbot — architecture reviews, release risk, and engineering coordination.",
    projectTitles: ["Ai Edu Channel", "Platform reliability sprint"],
    statusLabel: "Idle",
    lastHeartbeatIso: minutesAgo(1),
    currentActivity: "Standing by for infra reviews (fixture).",
    primaryModel: "gpt-4.1",
  },
};

export function demoFleetProfile(agentId: string): DemoFleetProfile | null {
  return DEMO_FLEET_PROFILES[agentId] ?? null;
}
