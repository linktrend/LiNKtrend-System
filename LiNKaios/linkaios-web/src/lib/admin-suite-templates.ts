import type { SuiteCatalogueItem, SuiteModuleTemplate } from "@/lib/ui-mocks/modules-catalog-demo";

/** Vendor-only suite catalogue entries for LiNKaios Admin programs (not client marketplace). */
export const ADMIN_VENDOR_SUITES: SuiteCatalogueItem[] = [
  {
    id: "linksuitegen",
    name: "LiNKsuitegen",
    summary: "Vendor suite catalogue generation and marketplace publish pipeline.",
    published: true,
    clientLicensed: false,
    vendorOwner: "Platform Engineering",
    marketingDescription:
      "LiNKsuitegen industrializes suite variant authoring, bundle validation, and governed marketplace publish for the licensor catalogue.",
    audienceWho: "LiNKtrend studio operators managing vendor suite recipes.",
    priceMonthlyUsd: 0,
    linkbotCount: 2,
    automationCount: 3,
    capabilityCount: 4,
    outputTypeCount: 2,
    sideEffectCount: 2,
  },
  {
    id: "linkbrain",
    name: "LiNKbrain Librarian",
    summary: "Collective knowledge filings and librarian review for vendor brain.",
    published: true,
    clientLicensed: false,
    vendorOwner: "Knowledge Operations",
    marketingDescription:
      "Governed librarian filings queue, collective memory promotion, and audit for the vendor shared brain.",
    audienceWho: "LiNKtrend studio operators curating vendor institutional memory.",
    priceMonthlyUsd: 0,
    linkbotCount: 2,
    automationCount: 2,
    capabilityCount: 3,
    outputTypeCount: 2,
    sideEffectCount: 1,
  },
  {
    id: "linktrend-platform",
    name: "Platform Ops",
    summary: "Studio platform operations and governance execution.",
    published: true,
    clientLicensed: false,
    vendorOwner: "Studio Operations",
    marketingDescription:
      "Platform operations runbook for studio infrastructure, governance checks, and release coordination.",
    audienceWho: "LiNKtrend studio operators running vendor platform work.",
    priceMonthlyUsd: 0,
    linkbotCount: 1,
    automationCount: 2,
    capabilityCount: 5,
    outputTypeCount: 1,
    sideEffectCount: 3,
  },
];

/** Module templates keyed by suite id — used for Plane bootstrap and Admin project tabs. */
export const ADMIN_VENDOR_PROCESSES: SuiteModuleTemplate[] = [
  {
    id: "suite-gen-catalogue",
    moduleId: "linksuitegen",
    name: "Suite catalogue pipeline",
    published: true,
    summary: "Author suite variants, validate bundles, and publish to the vendor marketplace.",
    rerunsAutomatically: true,
    workflows: [
      {
        id: "sg-intake",
        name: "Catalogue intake",
        stage: "Intake",
        summary: "Define suite variant inputs and seed fixture sources for generation.",
        issues: [
          {
            id: "sg-intake-1",
            title: "Define suite variant schema",
            description: "Capture variant metadata, connector requirements, and module bindings.",
            inputContract: "Suite variant brief; licensor tenant scope",
            outputContract: "Variant schema artefact with validation rules",
            executors: [{ kind: "agent", name: "Suite Architect", description: "Draft governed variant schema for LiNKsuitegen." }],
          },
          {
            id: "sg-intake-2",
            title: "Seed fixture sources",
            inputContract: "Variant schema; fixture catalogue",
            outputContract: "Seeded fixture manifest for generator",
            executors: [{ kind: "automation", name: "Fixture seed automation", description: "Populate fixture sources for bundle generation." }],
          },
        ],
      },
      {
        id: "sg-generate",
        name: "Generate and validate",
        stage: "Build",
        summary: "Run bundle generation and validate export artefacts.",
        issues: [
          {
            id: "sg-generate-1",
            title: "Run bundle generator",
            inputContract: "Fixture manifest; variant schema",
            outputContract: "Generated suite bundle export",
            executors: [{ kind: "automation", name: "Bundle generator", description: "Execute LiNKsuitegen generate pipeline." }],
          },
          {
            id: "sg-generate-2",
            title: "Validate export bundle",
            inputContract: "Generated bundle path",
            outputContract: "Validation report with pass/fail gates",
            executors: [{ kind: "agent", name: "Suite Validator", description: "Review bundle validation output before publish." }],
          },
        ],
      },
      {
        id: "sg-publish",
        name: "Publish pipeline",
        stage: "Publish",
        summary: "Promote validated bundles to the vendor marketplace with audit.",
        issues: [
          {
            id: "sg-publish-1",
            title: "Publish to marketplace",
            inputContract: "Validated bundle; publish lease",
            outputContract: "Marketplace listing revision",
            executors: [{ kind: "human", name: "Principal", description: "Approve marketplace publish when gated." }],
          },
          {
            id: "sg-publish-2",
            title: "Record audit trace",
            inputContract: "Publish outcome; trace envelope",
            outputContract: "LiNKbrain audit event and project trace",
            executors: [{ kind: "automation", name: "Audit writer", description: "Persist governed audit for publish step." }],
          },
        ],
      },
    ],
  },
  {
    id: "linksites.librarian",
    moduleId: "linkbrain",
    name: "Librarian filings",
    published: true,
    summary: "Collective knowledge intake, review, and promotion for vendor brain.",
    rerunsAutomatically: true,
    workflows: [
      {
        id: "lb-intake",
        name: "Filing intake",
        stage: "Intake",
        summary: "Accept collective knowledge filings into the librarian queue.",
        issues: [
          {
            id: "lb-intake-1",
            title: "Triage filing submission",
            inputContract: "Filing payload; collective inbox item",
            outputContract: "Triage verdict and routing tags",
            executors: [{ kind: "agent", name: "Librarian Bot", description: "Classify filing priority and scope." }],
          },
        ],
      },
      {
        id: "lb-review",
        name: "Review queue",
        stage: "Review",
        summary: "Human or agent review before collective memory promotion.",
        issues: [
          {
            id: "lb-review-1",
            title: "Review filing for promotion",
            inputContract: "Triaged filing; memory policy",
            outputContract: "Approved or rejected promotion decision",
            executors: [{ kind: "human", name: "Principal", description: "Approve collective memory promotion." }],
          },
        ],
      },
      {
        id: "lb-publish",
        name: "Collective memory publish",
        stage: "Publish",
        summary: "Promote approved filings into vendor shared brain partitions.",
        issues: [
          {
            id: "lb-publish-1",
            title: "Promote to collective memory",
            inputContract: "Approved filing; brain write lease",
            outputContract: "Memory object with audit reference",
            executors: [{ kind: "automation", name: "Brain writer", description: "Persist promoted memory with audit hooks." }],
          },
        ],
      },
    ],
  },
  {
    id: "platform-ops",
    moduleId: "linktrend-platform",
    name: "Platform operations",
    published: true,
    summary: "Studio infrastructure checks, governance tasks, and release coordination.",
    rerunsAutomatically: false,
    workflows: [
      {
        id: "po-intake",
        name: "Operations intake",
        stage: "Intake",
        summary: "Capture platform ops work item with scope and approvals.",
        issues: [
          {
            id: "po-intake-1",
            title: "Define ops work scope",
            inputContract: "Ops brief; capability requirements",
            outputContract: "Scoped ops checklist with owners",
            executors: [{ kind: "agent", name: "Platform Operator", description: "Draft governed ops scope." }],
          },
        ],
      },
      {
        id: "po-execute",
        name: "Governance execution",
        stage: "Execute",
        summary: "Run deterministic automations and agent judgment steps.",
        issues: [
          {
            id: "po-execute-1",
            title: "Execute governed change",
            inputContract: "Ops checklist; capability leases",
            outputContract: "Change execution trace with evidence",
            executors: [{ kind: "automation", name: "Ops automation", description: "Run governed platform change workflow." }],
          },
        ],
      },
      {
        id: "po-close",
        name: "Audit and close",
        stage: "Close",
        summary: "Record audit artefacts and close the ops run.",
        issues: [
          {
            id: "po-close-1",
            title: "Close ops run with audit",
            inputContract: "Execution trace; audit envelope",
            outputContract: "Closed run record in LiNKbrain",
            executors: [{ kind: "automation", name: "Audit writer", description: "Finalize ops audit and close run." }],
          },
        ],
      },
    ],
  },
];

const ADMIN_SUITE_IDS = new Set(ADMIN_VENDOR_SUITES.map((suite) => suite.id));

export function isAdminVendorSuiteId(suiteId: string | null | undefined): boolean {
  return Boolean(suiteId && ADMIN_SUITE_IDS.has(suiteId));
}

/** Published module templates for a vendor admin suite. */
export function adminProcessesForSuite(suiteId: string): SuiteModuleTemplate[] {
  return ADMIN_VENDOR_PROCESSES.filter((process) => process.moduleId === suiteId && process.published);
}

/** Resolve a module template by id across admin vendor catalogue. */
export function adminProcessById(processId: string): SuiteModuleTemplate | undefined {
  return ADMIN_VENDOR_PROCESSES.find((process) => process.id === processId && process.published);
}
