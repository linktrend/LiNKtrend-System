/**
 * Runtime tier vocabulary for suite issue templates (STUDIO_FORWARD_PLAN Wave 5.4).
 *
 * @see docs/ecosystem/FLEET_AND_RUNTIME_POLICY.md
 */

export const RUNTIME_TIERS = [
  "automation",
  "agent_zero",
  "openclaw_head",
  "openclaw_subagent",
  "codex_lane",
  "council",
] as const;

export type RuntimeTier = (typeof RUNTIME_TIERS)[number];

export function isRuntimeTier(value: string): value is RuntimeTier {
  return (RUNTIME_TIERS as readonly string[]).includes(value);
}

/** Map responsible_plane + role hints to default runtime tier when template omits explicit tier. */
export function defaultRuntimeTierForPlane(
  responsiblePlane: string,
  roleId?: string | null,
): RuntimeTier {
  if (responsiblePlane === "linkautowork") return "automation";
  if (responsiblePlane === "linkskills" && roleId?.includes("council")) return "council";
  if (roleId && /orchestrator|steward|outreach|ceo|admin_openclaw|suitegen_orchestrator|handoff_coordinator/.test(roleId)) {
    return "openclaw_head";
  }
  if (roleId && /_bot$|_linkbot$/.test(roleId)) return "agent_zero";
  if (responsiblePlane === "linkbot") return "agent_zero";
  return "automation";
}

export type RuntimeTierValidationIssue = {
  suiteId: string;
  issueId: string;
  message: string;
};

export type SuiteIssueTemplate = {
  issueId: string;
  roleId?: string;
  workflowHandle?: string;
  runtimeTier: RuntimeTier;
  displayName: string;
};

/** Validate issue template runtime tiers for a suite catalogue export. */
export function validateIssueTemplateRuntimeTiers(
  suiteId: string,
  templates: SuiteIssueTemplate[],
): RuntimeTierValidationIssue[] {
  const issues: RuntimeTierValidationIssue[] = [];
  const seen = new Set<string>();

  for (const template of templates) {
    if (seen.has(template.issueId)) {
      issues.push({
        suiteId,
        issueId: template.issueId,
        message: `duplicate issueId: ${template.issueId}`,
      });
    }
    seen.add(template.issueId);

    if (!isRuntimeTier(template.runtimeTier)) {
      issues.push({
        suiteId,
        issueId: template.issueId,
        message: `invalid runtimeTier: ${String(template.runtimeTier)}`,
      });
    }

    if (template.runtimeTier === "automation" && !template.workflowHandle) {
      issues.push({
        suiteId,
        issueId: template.issueId,
        message: "automation tier requires workflowHandle",
      });
    }

    if (
      (template.runtimeTier === "agent_zero" ||
        template.runtimeTier === "openclaw_head" ||
        template.runtimeTier === "openclaw_subagent") &&
      !template.roleId
    ) {
      issues.push({
        suiteId,
        issueId: template.issueId,
        message: `${template.runtimeTier} tier requires roleId`,
      });
    }
  }

  return issues;
}
