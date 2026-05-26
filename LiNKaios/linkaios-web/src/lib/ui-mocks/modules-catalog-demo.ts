import { BUSINESS_MODULES, BUSINESS_PROCESSES } from "@/lib/ui-mocks/modules-catalog-business";

export type IssueExecutorKind = "automation" | "agent" | "human" | "hybrid";

export type ModuleIssueTemplate = {
  id: string;
  title: string;
  /** Shown under the issue title — up to three lines in the process tree. */
  description?: string;
  inputContract: string;
  outputContract: string;
  executors: { kind: IssueExecutorKind; name: string; description?: string }[];
};

export type ModuleWorkflow = {
  id: string;
  name: string;
  stage: string;
  summary: string;
  issues: ModuleIssueTemplate[];
};

/** One Process = one startable project type (1:1). */
export type ModuleProcess = {
  id: string;
  name: string;
  moduleId: string;
  published: boolean;
  summary: string;
  rerunsAutomatically: boolean;
  workflows: ModuleWorkflow[];
};

export type ModuleCatalogueItem = {
  id: string;
  name: string;
  summary: string;
  published: boolean;
  /** Fixture default subscription — overridden by demo checkout in localStorage. */
  clientLicensed: boolean;
  vendorOwner: string;
  marketingDescription: string;
  audienceWho: string;
  /** List price in USD per month (annual billing = 20% discount, shown as per-month equivalent). */
  priceMonthlyUsd: number;
  linkbotCount: number;
  automationCount: number;
  capabilityCount: number;
  /** Distinct deliverable / artefact families when sample outputs are not seeded. */
  outputTypeCount: number;
  /** Governed external actions (CRM, publish, email, billing, etc.) requiring capability leases. */
  sideEffectCount: number;
};

export type ModuleSampleOutput = {
  id: string;
  moduleId: string;
  processId: string;
  processName: string;
  artifactType: string;
  title: string;
  summary: string;
  updatedAt: string;
  /** Opens when the row is clicked (internal path or external preview URL). */
  artifactHref: string;
};

export type WorkflowStageStatus = "completed" | "running" | "pending" | "skipped";

export type WorkflowStageFixture = {
  order: number;
  stageId: string;
  label: string;
  summary: string;
  status: WorkflowStageStatus;
  primaryPlane: string;
};

export type ModulesCatalogModel = {
  modules: ModuleCatalogueItem[];
  processes: ModuleProcess[];
  sampleOutputs: ModuleSampleOutput[];
};

/** @deprecated Use ModuleProcess — kept for imports during migration. */
export type ModuleProjectType = ModuleProcess;

export const LINKSITES_MVO_STAGES: WorkflowStageFixture[] = [
  { order: 1, stageId: "linksites.run.bootstrap", label: "Bootstrap", summary: "Bind tenant run to mock CRM lead and site identities", status: "completed", primaryPlane: "LiNKaios" },
  { order: 2, stageId: "linksites.lead_scout.skip", label: "Lead scout", summary: "Lead Scout role declared; mock substitution only (MVO skip)", status: "skipped", primaryPlane: "LiNKbot" },
  { order: 3, stageId: "linksites.research.enrich", label: "Research", summary: "Governed public research with provenance", status: "completed", primaryPlane: "LiNKbot" },
  { order: 4, stageId: "linksites.template_select_package", label: "Template & copy", summary: "Template-guided copy, media plan, and style proposal", status: "completed", primaryPlane: "LiNKbot" },
  { order: 5, stageId: "linksites.artifact.write_local", label: "Artifact write", summary: "Persist generated package to local artifact folder", status: "running", primaryPlane: "LiNKautowork" },
  { order: 6, stageId: "linksites.supabase.mirror_upsert", label: "Mirror upsert", summary: "Structured content and asset refs to Supabase mirror", status: "pending", primaryPlane: "LiNKautowork" },
  { order: 7, stageId: "linksites.payload.sync_local", label: "Payload sync", summary: "Sync mirror to local Payload CMS", status: "pending", primaryPlane: "LiNKautowork" },
  { order: 8, stageId: "linksites.preview.verify", label: "Preview verify", summary: "Deterministic checks against preview frontend", status: "pending", primaryPlane: "LiNKautowork" },
  { order: 9, stageId: "linksites.crm.promote_ready", label: "CRM promote", summary: "Mock CRM lead status update to ready_to_contact", status: "pending", primaryPlane: "LiNKautowork" },
  { order: 10, stageId: "linksites.outreach.declared_skip", label: "Outreach", summary: "Outreach Bot declared disabled (MVO skip)", status: "skipped", primaryPlane: "LiNKbot" },
];

export const MODULES_CATALOG_DEMO: ModulesCatalogModel = {
  modules: [
    {
      id: "linksites",
      name: "LinkSites",
      summary: "Lead-to-preview website delivery for growth teams.",
      published: true,
      clientLicensed: true,
      vendorOwner: "Growth Operations",
      marketingDescription:
        "LinkSites industrializes lead-to-preview-site delivery: intake a lead, generate governed copy and layout, publish a reviewable preview, and record CRM and audit outcomes — without ad-hoc agent prompts.",
      audienceWho: "Agencies, SMB growth teams, and venture studios running repeatable website outreach.",
      priceMonthlyUsd: 2499,
      linkbotCount: 3,
      automationCount: 6,
      capabilityCount: 8,
      outputTypeCount: 4,
      sideEffectCount: 6,
    },
    {
      id: "linkapps",
      name: "LiNKapps",
      summary: "App factory execution with milestone governance.",
      published: true,
      clientLicensed: false,
      vendorOwner: "Product Engineering",
      marketingDescription:
        "LiNKapps coordinates venture software creation from scoped concept through architecture fit, build checkpoints, and release readiness — with LiNKbots for judgment and LiNKautowork for deterministic gates.",
      audienceWho: "Product studios and internal platform teams shipping multiple apps per quarter.",
      priceMonthlyUsd: 3499,
      linkbotCount: 4,
      automationCount: 5,
      capabilityCount: 6,
      outputTypeCount: 3,
      sideEffectCount: 5,
    },
    {
      id: "lexos-litigation",
      name: "LEXOS Litigation",
      summary: "Litigation practice processes with governed evidence and strategy workspaces.",
      published: true,
      clientLicensed: false,
      vendorOwner: "Legal Practice",
      marketingDescription:
        "LEXOS Litigation packages intake, research, evidence, strategy, and output workspaces for law firms — with strict memory partitions and human approval gates on sensitive actions.",
      audienceWho: "Boutique and mid-size litigation practices modernizing matter processes.",
      priceMonthlyUsd: 4999,
      linkbotCount: 5,
      automationCount: 4,
      capabilityCount: 10,
      outputTypeCount: 5,
      sideEffectCount: 8,
    },
    ...BUSINESS_MODULES,
  ],
  processes: [
    {
      id: "website-factory",
      moduleId: "linksites",
      name: "Lead to preview site",
      published: true,
      summary: "End-to-end WebsiteFactory flow from lead selection through preview publish and CRM stub.",
      rerunsAutomatically: true,
      workflows: [
        {
          id: "wf-intake",
          name: "Lead intake & qualification",
          stage: "Intake",
          summary:
            "Capture lead context, validate schema, and bind project identities. Normalizes imports from CSV, CRM webhooks, or manual selection into tenant-scoped lead records ready for qualification and downstream phases.",
          issues: [
            {
              id: "t-intake-1",
              title: "Import or select lead",
              description:
                "Task template with input and output contracts. Defines governed inputs, expected outputs, and audit hooks for this issue. LiNKbots and automations reference these contracts when executing the issue.",
              inputContract: "Lead CSV row or CRM id; tenant module lease",
              outputContract: "Normalized lead record with project_id",
              executors: [{ kind: "automation", name: "Lead import automation", description: "Parse CSV or CRM webhook and normalize lead fields into tenant schema." }],
            },
            {
              id: "t-intake-2",
              title: "Qualify lead against ICP",
              inputContract: "Normalized lead + company memory slice",
              outputContract: "Qualification verdict + rationale artefact",
              executors: [{ kind: "agent", name: "Website Scout", description: "Score lead fit against ICP rules and draft qualification rationale for review." }],
            },
          ],
        },
        {
          id: "wf-research",
          name: "Research & enrichment",
          stage: "Research",
          summary: "Governed public research with provenance for copy and positioning.",
          issues: [
            {
              id: "t-research-1",
              title: "Enrich company profile",
              inputContract: "Lead domain + allowed research capabilities",
              outputContract: "Research brief JSON with citations",
              executors: [{ kind: "agent", name: "Website Scout", description: "Run governed public research and assemble a cited company brief for copy generation." }],
            },
          ],
        },
        {
          id: "wf-preview",
          name: "Preview generation",
          stage: "Build",
          summary: "Template selection, copy generation, artifact write, and preview verify.",
          issues: [
            {
              id: "t-preview-1",
              title: "Select template & generate copy",
              inputContract: "Research brief + template catalogue",
              outputContract: "Copy package + media plan",
              executors: [
                {
                  kind: "hybrid",
                  name: "Studio Manager + copy automation",
                  description: "Studio Manager orchestrates template choice; copy automation generates governed page content.",
                },
              ],
            },
            {
              id: "t-preview-2",
              title: "Publish preview site",
              inputContract: "Copy package + Payload mirror refs",
              outputContract: "Preview URL + verification report",
              executors: [{ kind: "automation", name: "Preview publish automation", description: "Write artifact package, sync Payload mirror, and verify preview URL health checks." }],
            },
          ],
        },
      ],
    },
    {
      id: "site-refresh",
      moduleId: "linksites",
      name: "Site refresh audit",
      published: true,
      summary: "Audit an existing site and produce a prioritized refresh recommendation pack.",
      rerunsAutomatically: true,
      workflows: [
        {
          id: "wf-audit",
          name: "Site audit",
          stage: "Audit",
          summary: "Crawl, SEO check, and gap analysis against module standards.",
          issues: [
            {
              id: "t-audit-1",
              title: "Run SEO & performance audit",
              inputContract: "Live site URL + audit capability lease",
              outputContract: "Audit JSON + executive summary",
              executors: [
                { kind: "automation", name: "SEO audit automation", description: "Crawl site, run Lighthouse and on-page SEO checks, emit structured audit JSON." },
                { kind: "agent", name: "SEO Analyst", description: "Summarize audit findings and prioritize refresh recommendations for the client." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "lead-qualification-pack",
      moduleId: "linksites",
      name: "Lead qualification pack",
      published: true,
      summary: "One-time ICP score and outreach brief for an imported lead batch.",
      rerunsAutomatically: false,
      workflows: [
        {
          id: "wf-qualify-batch",
          name: "Batch qualification",
          stage: "Intake",
          summary: "Score leads, draft rationale, and produce a contact-ready brief.",
          issues: [
            {
              id: "t-qualify-1",
              title: "Score batch against ICP",
              inputContract: "Lead CSV batch + tenant ICP rules",
              outputContract: "Qualification spreadsheet + outreach brief",
              executors: [
                { kind: "agent", name: "Website Scout", description: "Score each lead, explain fit, and draft outreach angles for approved rows." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "app-factory-operator",
      moduleId: "linkapps",
      name: "App factory operator",
      published: true,
      summary: "Concept-to-delivery checkpoints for venture app builds.",
      rerunsAutomatically: false,
      workflows: [
        {
          id: "wf-scope",
          name: "Scope & architecture fit",
          stage: "Scoping",
          summary: "Confirm delivery stages, acceptance gates, and squad allocation.",
          issues: [
            {
              id: "t-scope-1",
              title: "Architecture fit review",
              inputContract: "Venture brief + stack constraints",
              outputContract: "Architecture decision record",
              executors: [{ kind: "agent", name: "Venture Architect" }],
            },
            {
              id: "t-scope-2",
              title: "Create Plane milestone map",
              inputContract: "Approved ADR + module phase map",
              outputContract: "Plane project + phase tasks",
              executors: [{ kind: "automation", name: "Plane bootstrap automation" }],
            },
          ],
        },
      ],
    },
    {
      id: "lexos-matter-intake",
      moduleId: "lexos-litigation",
      name: "Matter intake to strategy",
      published: true,
      summary: "Intake a new matter, assemble evidence workspace, and produce initial strategy brief.",
      rerunsAutomatically: false,
      workflows: [
        {
          id: "wf-lex-intake",
          name: "Matter intake",
          stage: "Intake",
          summary: "Structured intake with privilege-aware memory partitioning.",
          issues: [
            {
              id: "t-lex-1",
              title: "Capture matter facts",
              inputContract: "Client intake form + document uploads",
              outputContract: "Matter record + partitioned memory refs",
              executors: [{ kind: "human", name: "Responsible attorney" }],
            },
            {
              id: "t-lex-2",
              title: "Draft initial strategy brief",
              inputContract: "Matter record + research lease",
              outputContract: "Strategy brief draft for review",
              executors: [{ kind: "agent", name: "Litigation Strategist" }],
            },
          ],
        },
      ],
    },
    ...BUSINESS_PROCESSES,
  ],
  sampleOutputs: [
    {
      id: "out-ls-1",
      moduleId: "linksites",
      processId: "website-factory",
      processName: "Lead to preview site",
      artifactType: "Preview site",
      title: "Northwind HVAC preview",
      summary: "Hosted preview URL + Payload mirror package for sales review.",
      updatedAt: new Date(Date.now() - 5 * 86_400_000).toISOString(),
      artifactHref: "https://northwind-hvac.preview.linksites.demo",
    },
    {
      id: "out-ls-2",
      moduleId: "linksites",
      processId: "website-factory",
      processName: "Lead to preview site",
      artifactType: "Copy package",
      title: "SMB hero & services copy",
      summary: "Structured markdown copy blocks aligned to template slots.",
      updatedAt: new Date(Date.now() - 4 * 86_400_000).toISOString(),
      artifactHref: "/memory?tab=inbox",
    },
    {
      id: "out-ls-3",
      moduleId: "linksites",
      processId: "website-factory",
      processName: "Lead to preview site",
      artifactType: "CRM record",
      title: "Lead ready_to_contact",
      summary: "Mock CRM promotion artefact with audit trace id.",
      updatedAt: new Date(Date.now() - 3 * 86_400_000).toISOString(),
      artifactHref: "/work",
    },
    {
      id: "out-ls-4",
      moduleId: "linksites",
      processId: "site-refresh",
      processName: "Site refresh audit",
      artifactType: "Audit report",
      title: "Acme Dental SEO audit",
      summary: "Lighthouse, Core Web Vitals, and on-page SEO findings JSON.",
      updatedAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
      artifactHref: "/metrics",
    },
    {
      id: "out-la-1",
      moduleId: "linkapps",
      processId: "app-factory-operator",
      processName: "App factory operator",
      artifactType: "ADR",
      title: "Venture stack decision",
      summary: "Architecture decision record for starter-kit Next.js deployment.",
      updatedAt: new Date(Date.now() - 6 * 86_400_000).toISOString(),
      artifactHref: "/suites/linkapps/factory",
    },
    {
      id: "out-ls-5",
      moduleId: "linksites",
      processId: "website-factory",
      processName: "Lead to preview site",
      artifactType: "Preview site",
      title: "Summit Plumbing preview",
      summary: "Trade services template with emergency callout block.",
      updatedAt: new Date(Date.now() - 7 * 86_400_000).toISOString(),
      artifactHref: "https://summit-plumbing.preview.linksites.demo",
    },
    {
      id: "out-ls-6",
      moduleId: "linksites",
      processId: "website-factory",
      processName: "Lead to preview site",
      artifactType: "Copy package",
      title: "Bright Smile Dental copy",
      summary: "Hero, services grid, and testimonial slots for dental vertical.",
      updatedAt: new Date(Date.now() - 8 * 86_400_000).toISOString(),
      artifactHref: "/memory?tab=inbox",
    },
    {
      id: "out-ls-7",
      moduleId: "linksites",
      processId: "website-factory",
      processName: "Lead to preview site",
      artifactType: "CRM record",
      title: "Lead qualified — Oak Street Legal",
      summary: "CRM stub with practice area tags and intake notes.",
      updatedAt: new Date(Date.now() - 9 * 86_400_000).toISOString(),
      artifactHref: "/work",
    },
    {
      id: "out-ls-8",
      moduleId: "linksites",
      processId: "site-refresh",
      processName: "Site refresh audit",
      artifactType: "Audit report",
      title: "Harbor View Realty SEO audit",
      summary: "Index coverage, schema markup, and local pack readiness.",
      updatedAt: new Date(Date.now() - 10 * 86_400_000).toISOString(),
      artifactHref: "/metrics",
    },
    {
      id: "out-ls-9",
      moduleId: "linksites",
      processId: "website-factory",
      processName: "Lead to preview site",
      artifactType: "Preview site",
      title: "GreenLeaf Landscaping preview",
      summary: "Seasonal services carousel and quote request form.",
      updatedAt: new Date(Date.now() - 11 * 86_400_000).toISOString(),
      artifactHref: "https://greenleaf-landscaping.preview.linksites.demo",
    },
    {
      id: "out-ls-10",
      moduleId: "linksites",
      processId: "lead-qualification-pack",
      processName: "Lead qualification pack",
      artifactType: "Copy package",
      title: "Metro Fitness studio copy",
      summary: "Class schedule, trainer bios, and membership tiers.",
      updatedAt: new Date(Date.now() - 12 * 86_400_000).toISOString(),
      artifactHref: "/memory?tab=inbox",
    },
    {
      id: "out-ls-11",
      moduleId: "linksites",
      processId: "website-factory",
      processName: "Lead to preview site",
      artifactType: "CRM record",
      title: "Lead contacted — Cascade Auto Repair",
      summary: "Follow-up task created with preview link attached.",
      updatedAt: new Date(Date.now() - 13 * 86_400_000).toISOString(),
      artifactHref: "/work",
    },
    {
      id: "out-ls-12",
      moduleId: "linksites",
      processId: "website-factory",
      processName: "Lead to preview site",
      artifactType: "Preview site",
      title: "Pioneer Accounting preview",
      summary: "Professional services layout with trust badges and CTA band.",
      updatedAt: new Date(Date.now() - 14 * 86_400_000).toISOString(),
      artifactHref: "https://pioneer-accounting.preview.linksites.demo",
    },
    {
      id: "out-ls-13",
      moduleId: "linksites",
      processId: "site-refresh",
      processName: "Site refresh audit",
      artifactType: "Audit report",
      title: "Westside Cafe performance audit",
      summary: "LCP regression on menu page; image lazy-load recommendations.",
      updatedAt: new Date(Date.now() - 15 * 86_400_000).toISOString(),
      artifactHref: "/metrics",
    },
    {
      id: "out-ls-14",
      moduleId: "linksites",
      processId: "website-factory",
      processName: "Lead to preview site",
      artifactType: "Copy package",
      title: "Riverstone Veterinary copy",
      summary: "Pet care services, hours, and emergency contact blocks.",
      updatedAt: new Date(Date.now() - 16 * 86_400_000).toISOString(),
      artifactHref: "/memory?tab=inbox",
    },
    {
      id: "out-ls-15",
      moduleId: "linksites",
      processId: "website-factory",
      processName: "Lead to preview site",
      artifactType: "Preview site",
      title: "Atlas Roofing preview",
      summary: "Storm damage landing page with insurance FAQ module.",
      updatedAt: new Date(Date.now() - 17 * 86_400_000).toISOString(),
      artifactHref: "https://atlas-roofing.preview.linksites.demo",
    },
    {
      id: "out-ls-16",
      moduleId: "linksites",
      processId: "lead-qualification-pack",
      processName: "Lead qualification pack",
      artifactType: "CRM record",
      title: "Lead nurture — Blue Horizon Travel",
      summary: "Qualification score 78; destination interest captured.",
      updatedAt: new Date(Date.now() - 18 * 86_400_000).toISOString(),
      artifactHref: "/work",
    },
    {
      id: "out-ls-17",
      moduleId: "linksites",
      processId: "website-factory",
      processName: "Lead to preview site",
      artifactType: "Preview site",
      title: "Elm Street Bakery preview",
      summary: "Local bakery template with catering menu PDF embed.",
      updatedAt: new Date(Date.now() - 19 * 86_400_000).toISOString(),
      artifactHref: "https://elm-street-bakery.preview.linksites.demo",
    },
    {
      id: "out-ls-18",
      moduleId: "linksites",
      processId: "site-refresh",
      processName: "Site refresh audit",
      artifactType: "Audit report",
      title: "Northgate Physio accessibility audit",
      summary: "WCAG contrast failures on booking widget; remediation list.",
      updatedAt: new Date(Date.now() - 20 * 86_400_000).toISOString(),
      artifactHref: "/metrics",
    },
    {
      id: "out-ls-19",
      moduleId: "linksites",
      processId: "website-factory",
      processName: "Lead to preview site",
      artifactType: "Copy package",
      title: "Coastal Property Group copy",
      summary: "Listing highlights, agent roster, and market stats band.",
      updatedAt: new Date(Date.now() - 21 * 86_400_000).toISOString(),
      artifactHref: "/memory?tab=inbox",
    },
    {
      id: "out-ls-20",
      moduleId: "linksites",
      processId: "website-factory",
      processName: "Lead to preview site",
      artifactType: "Preview site",
      title: "Silverline Electric preview",
      summary: "Residential and commercial service areas with quote funnel.",
      updatedAt: new Date(Date.now() - 22 * 86_400_000).toISOString(),
      artifactHref: "https://silverline-electric.preview.linksites.demo",
    },
    {
      id: "out-ls-21",
      moduleId: "linksites",
      processId: "website-factory",
      processName: "Lead to preview site",
      artifactType: "CRM record",
      title: "Lead won — Sunrise Childcare",
      summary: "Preview approved; handoff to publishing automation stub.",
      updatedAt: new Date(Date.now() - 23 * 86_400_000).toISOString(),
      artifactHref: "/work",
    },
    {
      id: "out-ls-22",
      moduleId: "linksites",
      processId: "lead-qualification-pack",
      processName: "Lead qualification pack",
      artifactType: "Audit report",
      title: "Batch qualification summary — May 2026",
      summary: "67% pack completion rate across 12 active lead projects.",
      updatedAt: new Date(Date.now() - 24 * 86_400_000).toISOString(),
      artifactHref: "/metrics",
    },
  ],
};

/** @deprecated Alias for processes — project type id === process id. */
export const projectTypes = MODULES_CATALOG_DEMO.processes;

export function publishedMarketplaceModules(): ModuleCatalogueItem[] {
  return MODULES_CATALOG_DEMO.modules.filter((m) => m.published);
}

export function processesForModule(moduleId: string): ModuleProcess[] {
  return MODULES_CATALOG_DEMO.processes.filter((p) => p.moduleId === moduleId && p.published);
}

export function sampleOutputsForModule(moduleId: string): ModuleSampleOutput[] {
  return MODULES_CATALOG_DEMO.sampleOutputs.filter((o) => o.moduleId === moduleId);
}

export function moduleStats(moduleId: string) {
  const processes = processesForModule(moduleId);
  const workflows = processes.flatMap((p) => p.workflows);
  const issues = workflows.flatMap((w) => w.issues);
  const mod = MODULES_CATALOG_DEMO.modules.find((m) => m.id === moduleId);
  const samples = sampleOutputsForModule(moduleId);
  const distinctOutputTypes = new Set(samples.map((s) => s.artifactType)).size;
  return {
    processes: processes.length,
    workflows: workflows.length,
    issues: issues.length,
    linkbots: mod?.linkbotCount ?? 0,
    automations: mod?.automationCount ?? 0,
    capabilities: mod?.capabilityCount ?? 0,
    outputTypes:
      distinctOutputTypes > 0
        ? distinctOutputTypes
        : (mod?.outputTypeCount ?? Math.max(1, processes.length)),
    sideEffects: mod?.sideEffectCount ?? 0,
  };
}

export function fixtureLicensedByModule(): Record<string, boolean> {
  return Object.fromEntries(MODULES_CATALOG_DEMO.modules.map((m) => [m.id, m.clientLicensed]));
}
