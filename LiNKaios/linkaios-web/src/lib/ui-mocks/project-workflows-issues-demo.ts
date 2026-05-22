import type { ProjectTrackedItem } from "@/lib/project-tracked-items";

import { LINKSITES_MVO_STAGES } from "./modules-catalog-demo";

function stageToWorkflowStatus(
  status: "completed" | "running" | "pending" | "skipped",
): ProjectTrackedItem["status"] {
  if (status === "running") return "running";
  if (status === "pending") return "pending";
  if (status === "skipped") return "skipped";
  return "completed";
}

function linksitesWorkflowRows(): ProjectTrackedItem[] {
  return LINKSITES_MVO_STAGES.map((stage) => ({
    id: stage.stageId,
    title: stage.label,
    status: stageToWorkflowStatus(stage.status),
    detail: stage.summary,
    updatedAt: new Date(Date.now() - stage.order * 3_600_000).toISOString(),
  }));
}

const DEMO_PROJECT_WORKFLOWS: Record<string, ProjectTrackedItem[]> = {
  "demo-smb": linksitesWorkflowRows(),
  "demo-ai-edu": [
    { id: "edu.script", title: "Script drafting", status: "running", detail: "Episode 4 first pass", updatedAt: new Date(Date.now() - 720_000).toISOString() },
    { id: "edu.legal", title: "Legal review", status: "pending", detail: "Vendor counsel queue", updatedAt: new Date(Date.now() - 3_600_000).toISOString() },
    { id: "edu.publish", title: "Channel publish", status: "pending", detail: "YouTube + LMS handoff", updatedAt: new Date(Date.now() - 8_640_000).toISOString() },
    { id: "edu.intake", title: "Curriculum intake", status: "completed", detail: "Stakeholder brief accepted", updatedAt: new Date(Date.now() - 172_800_000).toISOString() },
  ],
  "demo-mission-1": [
    { id: "nw.scope", title: "Migration scope lock", status: "running", detail: "Cutover checklist in review", updatedAt: new Date(Date.now() - 1_800_000).toISOString() },
    { id: "nw.data", title: "Data parity validation", status: "pending", detail: "Staging diff report", updatedAt: new Date(Date.now() - 7_200_000).toISOString() },
    { id: "nw.discovery", title: "Discovery complete", status: "completed", detail: "Signed off by programme lead", updatedAt: new Date(Date.now() - 604_800_000).toISOString() },
  ],
  "demo-mission-2": [
    { id: "rel.triage", title: "Incident triage", status: "running", detail: "P1 alert routing", updatedAt: new Date(Date.now() - 300_000).toISOString() },
    { id: "rel.patch", title: "Patch validation", status: "pending", detail: "Canary environment", updatedAt: new Date(Date.now() - 5_400_000).toISOString() },
    { id: "rel.postmortem", title: "Postmortem draft", status: "completed", detail: "Last sprint closure", updatedAt: new Date(Date.now() - 2_592_000_000).toISOString() },
  ],
};

const DEMO_PROJECT_ISSUES: Record<string, ProjectTrackedItem[]> = {
  "demo-smb": [
    { id: "SMB-142", title: "Preview QA blockers", status: "in_progress", detail: "Broken hero image on mobile", updatedAt: new Date(Date.now() - 900_000).toISOString() },
    { id: "SMB-138", title: "Template selection sign-off", status: "open", detail: "Awaiting client pick", updatedAt: new Date(Date.now() - 4_320_000).toISOString() },
    { id: "SMB-131", title: "Lead import validation", status: "open", detail: "CSV column mapping", updatedAt: new Date(Date.now() - 8_640_000).toISOString() },
    { id: "SMB-120", title: "CRM stub wiring", status: "resolved", detail: "Local table seeded", updatedAt: new Date(Date.now() - 259_200_000).toISOString() },
    { id: "SMB-101", title: "Initial project setup", status: "closed", detail: "Plane project created", updatedAt: new Date(Date.now() - 604_800_000).toISOString() },
  ],
  "demo-ai-edu": [
    { id: "EDU-44", title: "Legal copy approval", status: "in_progress", detail: "Disclaimer paragraph 3", updatedAt: new Date(Date.now() - 1_800_000).toISOString() },
    { id: "EDU-39", title: "Thumbnail refresh", status: "open", detail: "Brand palette update", updatedAt: new Date(Date.now() - 10_800_000).toISOString() },
    { id: "EDU-22", title: "Channel metadata sync", status: "resolved", detail: "Tags and categories", updatedAt: new Date(Date.now() - 432_000_000).toISOString() },
  ],
  "demo-mission-1": [
    { id: "NW-88", title: "Migration scope lock", status: "in_progress", detail: "Executive checkpoint", updatedAt: new Date(Date.now() - 2_700_000).toISOString() },
    { id: "NW-72", title: "Auth provider cutover", status: "open", detail: "SSO mapping draft", updatedAt: new Date(Date.now() - 12_960_000).toISOString() },
    { id: "NW-55", title: "Legacy API deprecation", status: "closed", detail: "Sunset notice sent", updatedAt: new Date(Date.now() - 864_000_000).toISOString() },
  ],
  "demo-mission-2": [
    { id: "REL-17", title: "Client evidence intake", status: "in_progress", detail: "Secure upload portal", updatedAt: new Date(Date.now() - 600_000).toISOString() },
    { id: "REL-12", title: "Runbook alignment", status: "open", detail: "On-call rotation", updatedAt: new Date(Date.now() - 21_600_000).toISOString() },
    { id: "REL-03", title: "Baseline monitoring", status: "resolved", detail: "Dashboards imported", updatedAt: new Date(Date.now() - 518_400_000).toISOString() },
  ],
};

export function demoProjectWorkflows(missionId: string): ProjectTrackedItem[] {
  return DEMO_PROJECT_WORKFLOWS[missionId] ?? [];
}

export function demoProjectIssues(missionId: string): ProjectTrackedItem[] {
  return DEMO_PROJECT_ISSUES[missionId] ?? [];
}
