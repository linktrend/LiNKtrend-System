import { demoFleetProfile } from "@/lib/demo-fleet-profiles";
import type { LinkbotFleetStatusLabel } from "@/lib/linkbot-fleet-status";
import { DEMO_SIDEBAR_AGENTS } from "@/lib/ui-mocks/entities";

export type ProjectAutomationRow = {
  id: string;
  title: string;
  lastRunIso: string | null;
};

const minutesAgo = (m: number) => new Date(Date.now() - m * 60 * 1000).toISOString();

/** LiNKbots assigned to a demo project (includes lead and contributors). */
export const DEMO_PROJECT_AGENT_IDS: Record<string, string[]> = {
  "demo-smb": ["demo-lisa", "demo-eric"],
  "demo-ai-edu": ["demo-eric", "demo-lisa"],
  "demo-mission-1": ["demo-lisa"],
  "demo-mission-2": ["demo-eric"],
};

/** LiNKautowork-style automations scoped to a demo project. */
export const DEMO_PROJECT_AUTOMATIONS: Record<string, ProjectAutomationRow[]> = {
  "demo-smb": [
    { id: "wf-lead-import", title: "Lead import — CSV to CRM", lastRunIso: minutesAgo(15) },
    { id: "wf-preview-publish", title: "Preview site publish", lastRunIso: minutesAgo(95) },
    { id: "wf-plane-sync", title: "Plane work-item sync", lastRunIso: minutesAgo(240) },
  ],
  "demo-ai-edu": [
    { id: "wf-script-review", title: "Script legal review handoff", lastRunIso: minutesAgo(40) },
    { id: "wf-asset-ingest", title: "Media asset ingest", lastRunIso: minutesAgo(180) },
  ],
  "demo-mission-1": [
    { id: "wf-migration-check", title: "Migration readiness check", lastRunIso: minutesAgo(25) },
  ],
  "demo-mission-2": [
    { id: "wf-incident-triage", title: "Incident triage routing", lastRunIso: minutesAgo(8) },
  ],
};

export type ProjectLinkbotRow = {
  id: string;
  display_name: string;
  role: string;
  statusLabel: LinkbotFleetStatusLabel;
  lastHeartbeatIso: string | null;
};

export function demoProjectLinkbots(missionId: string): ProjectLinkbotRow[] {
  const ids = DEMO_PROJECT_AGENT_IDS[missionId] ?? [];
  return ids
    .map((id) => {
      const agent = DEMO_SIDEBAR_AGENTS.find((a) => a.id === id);
      if (!agent) return null;
      const profile = demoFleetProfile(id);
      return {
        id: agent.id,
        display_name: agent.display_name,
        role: profile?.role ?? "LiNKbot",
        statusLabel: profile?.statusLabel ?? "Online",
        lastHeartbeatIso: profile?.lastHeartbeatIso ?? null,
      };
    })
    .filter((row): row is ProjectLinkbotRow => row != null);
}

export function demoProjectAutomations(missionId: string): ProjectAutomationRow[] {
  return DEMO_PROJECT_AUTOMATIONS[missionId] ?? [];
}
