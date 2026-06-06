/**
 * Suite issue templates with runtime_tier (STUDIO_FORWARD_PLAN §4, Wave 5.4).
 *
 * Canonical role → runtime maps: LiNKbot/roles/suites (openclaw-mapping.ts,
 * agent-zero-mapping.ts), and STUDIO_FORWARD_PLAN.md §4.
 */

import type { SuiteIssueTemplate } from "./runtime-tier";

export const LINKSITES_ISSUE_TEMPLATES: SuiteIssueTemplate[] = [
  {
    issueId: "linksites.lead_generation",
    roleId: "lead_scout_bot",
    runtimeTier: "automation",
    workflowHandle: "autowork.linksites.lead_intake_mock",
    displayName: "Lead generation (mock)",
  },
  {
    issueId: "linksites.qualification",
    roleId: "research_enrichment_bot",
    runtimeTier: "agent_zero",
    displayName: "Qualification / research enrichment",
  },
  {
    issueId: "linksites.template_selection",
    roleId: "website_builder_bot",
    runtimeTier: "agent_zero",
    displayName: "Template selection guidance",
  },
  {
    issueId: "linksites.website_build",
    roleId: "website_builder_bot",
    runtimeTier: "agent_zero",
    displayName: "Website package generation",
  },
  {
    issueId: "linksites.artifact.write_local",
    runtimeTier: "automation",
    workflowHandle: "autowork.linksites.artifact_write_local",
    displayName: "Write artifacts locally",
  },
  {
    issueId: "linksites.supabase.mirror_upsert",
    runtimeTier: "automation",
    workflowHandle: "autowork.linksites.supabase_mirror_upsert",
    displayName: "Supabase mirror upsert",
  },
  {
    issueId: "linksites.payload.sync_local",
    runtimeTier: "automation",
    workflowHandle: "autowork.linksites.payload_sync_local",
    displayName: "Payload sync local",
  },
  {
    issueId: "linksites.preview.verify",
    runtimeTier: "automation",
    workflowHandle: "autowork.linksites.preview_readiness_check",
    displayName: "Preview readiness check",
  },
  {
    issueId: "linksites.crm.promote_ready",
    runtimeTier: "automation",
    workflowHandle: "autowork.linksites.crm_ready_to_contact_mark",
    displayName: "CRM ready to contact",
  },
  {
    issueId: "linksites.outreach",
    roleId: "outreach_bot",
    runtimeTier: "openclaw_head",
    displayName: "Governed outreach",
  },
  {
    issueId: "linksites.close_or_recycle",
    runtimeTier: "automation",
    workflowHandle: "autowork.linksites.close_recycle",
    displayName: "Close or recycle lead",
  },
  {
    issueId: "linksites.librarian.ingest",
    roleId: "librarian_bot",
    runtimeTier: "agent_zero",
    displayName: "Librarian knowledge ingest",
  },
];

export const LINKDEVELOPER_ISSUE_TEMPLATES: SuiteIssueTemplate[] = [
  {
    issueId: "linkdeveloper.orchestrator.dispatch",
    roleId: "suite_orchestrator_linkbot",
    runtimeTier: "openclaw_head",
    displayName: "Suite orchestrator",
  },
  {
    issueId: "linkdeveloper.steward.conversation",
    roleId: "product_steward_linkbot",
    runtimeTier: "openclaw_head",
    displayName: "Product steward",
  },
  {
    issueId: "linkdeveloper.market.analysis",
    roleId: "market_linkbot",
    runtimeTier: "agent_zero",
    displayName: "Market analysis",
  },
  {
    issueId: "linkdeveloper.requirements",
    roleId: "requirements_linkbot",
    runtimeTier: "agent_zero",
    displayName: "Requirements analysis",
  },
  {
    issueId: "linkdeveloper.architecture",
    roleId: "architecture_linkbot",
    runtimeTier: "agent_zero",
    displayName: "Architecture",
  },
  {
    issueId: "linkdeveloper.platform",
    roleId: "platform_linkbot",
    runtimeTier: "agent_zero",
    displayName: "Platform design",
  },
  {
    issueId: "linkdeveloper.qa",
    roleId: "qa_linkbot",
    runtimeTier: "agent_zero",
    displayName: "QA validation",
  },
  {
    issueId: "linkdeveloper.security",
    roleId: "security_linkbot",
    runtimeTier: "agent_zero",
    displayName: "Security review",
  },
  {
    issueId: "linkdeveloper.devops",
    roleId: "devops_linkbot",
    runtimeTier: "agent_zero",
    displayName: "DevOps lane",
  },
  {
    issueId: "linkdeveloper.code.implement",
    runtimeTier: "codex_lane",
    displayName: "Code implementation",
  },
  {
    issueId: "linkdeveloper.bootstrap",
    runtimeTier: "automation",
    workflowHandle: "autowork.linkdeveloper.product_run_bootstrap",
    displayName: "Product run bootstrap",
  },
  {
    issueId: "linkdeveloper.validation.record",
    runtimeTier: "automation",
    workflowHandle: "autowork.linkdeveloper.validation_record",
    displayName: "Validation record",
  },
  {
    issueId: "linkdeveloper.gate.council",
    runtimeTier: "council",
    displayName: "Council gate deliberation",
  },
];

export const LINKSUITEGEN_ISSUE_TEMPLATES: SuiteIssueTemplate[] = [
  {
    issueId: "linksuitegen.orchestrator.cycle",
    roleId: "suitegen_orchestrator_linkbot",
    runtimeTier: "openclaw_head",
    displayName: "Factory orchestrator cycle",
  },
  {
    issueId: "linksuitegen.handoff",
    roleId: "handoff_coordinator_linkbot",
    runtimeTier: "openclaw_head",
    displayName: "Admin handoff",
  },
  {
    issueId: "linksuitegen.discovery.analyst",
    roleId: "discovery_analyst_linkbot",
    runtimeTier: "agent_zero",
    displayName: "Discovery analyst",
  },
  {
    issueId: "linksuitegen.bop.architect",
    roleId: "bop_architect_linkbot",
    runtimeTier: "agent_zero",
    displayName: "BOP architect",
  },
  {
    issueId: "linksuitegen.validation.qa",
    roleId: "validation_qa_linkbot",
    runtimeTier: "agent_zero",
    displayName: "Factory validation QA",
  },
  {
    issueId: "linksuitegen.crm.classifier",
    roleId: "linksuitegen_crm_classifier_linkbot",
    runtimeTier: "agent_zero",
    displayName: "CRM classifier",
  },
  {
    issueId: "linksuitegen.discovery.collect",
    runtimeTier: "automation",
    workflowHandle: "autowork.linksuitegen.discovery_collect",
    displayName: "Discovery collect",
  },
  {
    issueId: "linksuitegen.factory.generate",
    runtimeTier: "automation",
    workflowHandle: "autowork.linksuitegen.factory_generate",
    displayName: "Factory generate",
  },
];

export const PLATFORM_ISSUE_TEMPLATES: SuiteIssueTemplate[] = [
  {
    issueId: "platform.librarian",
    roleId: "librarian_bot",
    runtimeTier: "agent_zero",
    displayName: "LiNKbrain librarian",
  },
  {
    issueId: "platform.ceo.admin",
    roleId: "admin_openclaw_linkbot",
    runtimeTier: "openclaw_head",
    displayName: "Admin vendor CEO",
  },
  {
    issueId: "platform.ceo.client",
    roleId: "ceo_client_linkbot",
    runtimeTier: "openclaw_head",
    displayName: "Client CEO",
  },
];

export const ALL_SUITE_ISSUE_TEMPLATES: Record<string, SuiteIssueTemplate[]> = {
  linksites: LINKSITES_ISSUE_TEMPLATES,
  linkdeveloper: LINKDEVELOPER_ISSUE_TEMPLATES,
  linksuitegen: LINKSUITEGEN_ISSUE_TEMPLATES,
  platform: PLATFORM_ISSUE_TEMPLATES,
};

export function issueTemplateById(
  suiteId: string,
  issueId: string,
): SuiteIssueTemplate | undefined {
  return ALL_SUITE_ISSUE_TEMPLATES[suiteId]?.find((t) => t.issueId === issueId);
}
