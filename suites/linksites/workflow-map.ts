/**
 * Canonical LinkSites business stage spine — mirrors suites/linksites/workflow.md.
 * Principal MVO: seven steps, no declared skip stages.
 */
export const LINKSITES_PRINCIPAL_STAGE_IDS = [
  "linksites.lead_generation",
  "linksites.qualification",
  "linksites.template_selection",
  "linksites.website_build",
  "linksites.publish",
  "linksites.outreach",
  "linksites.close_or_recycle",
] as const;

export type LinksitesPrincipalStageId = (typeof LINKSITES_PRINCIPAL_STAGE_IDS)[number];

export const LINKSITES_FORBIDDEN_SKIP_STAGE_IDS = [
  "linksites.lead_scout.skip",
  "linksites.outreach.declared_skip",
] as const;

export type LinksitesWorkflowStage = {
  order: number;
  stageId: LinksitesPrincipalStageId;
  label: string;
  summary: string;
  primaryPlane: string;
};

/** Seven Principal business steps in MVO order. */
export const LINKSITES_PRINCIPAL_STAGES: LinksitesWorkflowStage[] = [
  {
    order: 1,
    stageId: "linksites.lead_generation",
    label: "Lead generation",
    summary: "Governed mock demo lead with lease, audit, and trace (D1 B)",
    primaryPlane: "LiNKbot",
  },
  {
    order: 2,
    stageId: "linksites.qualification",
    label: "Qualification",
    summary: "Business type and industry identified",
    primaryPlane: "LiNKbot",
  },
  {
    order: 3,
    stageId: "linksites.template_selection",
    label: "Template selection",
    summary: "Industry template from LiNKsites registry",
    primaryPlane: "LiNKbot",
  },
  {
    order: 4,
    stageId: "linksites.website_build",
    label: "Website build",
    summary: "Copy, media, and style within template",
    primaryPlane: "LiNKbot",
  },
  {
    order: 5,
    stageId: "linksites.publish",
    label: "Publish",
    summary: "Payload CMS + temp URL businessname.linktrend.media",
    primaryPlane: "LiNKautowork",
  },
  {
    order: 6,
    stageId: "linksites.outreach",
    label: "Outreach",
    summary: "Governed contact to sell site + hosting (not a skip stage)",
    primaryPlane: "LiNKbot",
  },
  {
    order: 7,
    stageId: "linksites.close_or_recycle",
    label: "Close or recycle",
    summary: "Subscribe/transfer domain or recycle site for next lead",
    primaryPlane: "LiNKaios",
  },
];

export function assertLinksitesWorkflowMapValid(stageIds: readonly string[]): {
  ok: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  for (const forbidden of LINKSITES_FORBIDDEN_SKIP_STAGE_IDS) {
    if (stageIds.includes(forbidden)) {
      errors.push(`forbidden skip stage present: ${forbidden}`);
    }
  }
  if (stageIds.length !== LINKSITES_PRINCIPAL_STAGE_IDS.length) {
    errors.push(`expected ${LINKSITES_PRINCIPAL_STAGE_IDS.length} stages, got ${stageIds.length}`);
  }
  for (let i = 0; i < LINKSITES_PRINCIPAL_STAGE_IDS.length; i += 1) {
    if (stageIds[i] !== LINKSITES_PRINCIPAL_STAGE_IDS[i]) {
      errors.push(`stage order mismatch at index ${i}: expected ${LINKSITES_PRINCIPAL_STAGE_IDS[i]}, got ${stageIds[i] ?? "(missing)"}`);
    }
  }
  return { ok: errors.length === 0, errors };
}
