import type { ModuleCatalogueItem, ModuleProcess } from "@/lib/ui-mocks/modules-catalog-demo";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function catalogProcess(moduleId: string, name: string): ModuleProcess {
  const slug = slugify(name);
  const id = `${moduleId}-${slug}`;
  return {
    id,
    moduleId,
    name,
    published: true,
    summary: `Governed ${name} process — intake through review with LinkSkills leases and audit.`,
    rerunsAutomatically: false,
    workflows: [
      {
        id: `${id}-wf`,
        name,
        stage: "Delivery",
        summary: `Phase steps for ${name}.`,
        issues: [
          {
            id: `${id}-task`,
            title: `Execute ${name}`,
            inputContract: "Validated intake payload and module lease",
            outputContract: "Signed-off output artefact with trace id",
            executors: [
              { kind: "agent", name: "Module operator", description: "Apply module policy and review exceptions before sign-off." },
              { kind: "automation", name: "Module operator", description: "Run deterministic intake, routing, and audit writes for this process." },
            ],
          },
        ],
      },
    ],
  };
}

function businessModule(
  id: string,
  name: string,
  summary: string,
  marketingDescription: string,
  audienceWho: string,
  priceMonthlyUsd: number,
  processNames: string[],
  stats: {
    linkbots: number;
    automations: number;
    capabilities: number;
    outputTypes?: number;
    sideEffects?: number;
  },
): { module: ModuleCatalogueItem; processes: ModuleProcess[] } {
  return {
    module: {
      id,
      name,
      summary,
      published: true,
      clientLicensed: false,
      vendorOwner: "Linktrend",
      marketingDescription,
      audienceWho,
      priceMonthlyUsd,
      linkbotCount: stats.linkbots,
      automationCount: stats.automations,
      capabilityCount: stats.capabilities,
      outputTypeCount: stats.outputTypes ?? Math.max(2, processNames.length),
      sideEffectCount: stats.sideEffects ?? Math.max(2, Math.round(stats.capabilities * 0.55)),
    },
    processes: processNames.map((p) => catalogProcess(id, p)),
  };
}

const PACKAGES = [
  businessModule(
    "research-development",
    "Research & Development",
    "Market insight and product design processes for innovation teams.",
    "Industrialize market research and product design with governed LiNKbot judgment, deterministic research automations, and auditable artefacts from hypothesis through validated concept.",
    "Product strategy, innovation, and R&D teams building new offerings.",
    2800,
    ["Market Research", "Product Design"],
    { linkbots: 4, automations: 5, capabilities: 7 },
  ),
  businessModule(
    "marketing",
    "Marketing",
    "Full-funnel marketing operations from strategy through brand governance.",
    "Run digital marketing, SEO, content distribution, engagement, PR, and brand management as linked processes — with capability leases on publishing and analytics capabilities.",
    "Marketing leaders and growth teams managing multi-channel programs.",
    3200,
    [
      "Digital Marketing",
      "Content Strategy & SEO",
      "Content Distribution & Analytics",
      "Content Engagement & Public Relations",
      "Brand Management",
    ],
    { linkbots: 6, automations: 8, capabilities: 12 },
  ),
  businessModule(
    "sales",
    "Sales",
    "Lead generation through closed-won operations with CRM governance.",
    "Coordinate lead generation and sales operations with LiNKbots for qualification and LiNKautowork for CRM updates, pipeline hygiene, and forecast-ready artefacts.",
    "Revenue teams scaling outbound and pipeline operations.",
    2600,
    ["Lead Generation", "Sales Operations"],
    { linkbots: 4, automations: 6, capabilities: 8 },
  ),
  businessModule(
    "customer-success",
    "Customer Success",
    "Support tiers and account lifecycle from help desk through strategic success.",
    "Package help desk, customer success, account management, and tiered technical support as governed processes with escalation rules and SLA-aware automations.",
    "Customer success, support, and account teams serving B2B clients.",
    2900,
    [
      "Help Desk",
      "Customer Success",
      "Account Management",
      "Technical Support (Tier 1)",
      "Technical Support (Tier 2)",
      "Technical Support (Tier 3)",
    ],
    { linkbots: 5, automations: 7, capabilities: 9 },
  ),
  businessModule(
    "finance-accounting",
    "Finance & Accounting",
    "AP, AR, FP&A, and payroll with deterministic controls.",
    "Run accounts payable, receivable, FP&A, and payroll processes with strict approval gates, capability leases to ERP systems, and full audit visibility.",
    "Finance controllers and accounting operations teams.",
    3500,
    [
      "Accounts Payable (Billing/Vendors)",
      "Accounts Receivable (Collections)",
      "Financial Planning & Analysis (FP&A)",
      "Payroll",
    ],
    { linkbots: 3, automations: 10, capabilities: 11 },
  ),
  businessModule(
    "human-resources",
    "Human Resources",
    "Recruiting through employee relations with policy-aware memory.",
    "Talent acquisition, compensation, training, and employee relations as separate processes — humans approve sensitive HR actions; agents draft and automate repeatable steps.",
    "HR business partners and people operations teams.",
    2400,
    ["Talent Acquisition (Recruiting)", "Compensation & Benefits", "Training & Development", "Employee Relations"],
    { linkbots: 4, automations: 5, capabilities: 6 },
  ),
  businessModule(
    "legal-compliance",
    "Legal & Compliance",
    "Corporate counsel, regulatory compliance, and data privacy programs.",
    "Govern legal review, regulatory filings, and privacy operations with partitioned LiNKbrain memory, human approval on external communications, and traceable compliance artefacts.",
    "Legal, compliance, and privacy officers in regulated industries.",
    4200,
    ["Corporate Counsel", "Regulatory Compliance", "Data Privacy"],
    { linkbots: 4, automations: 4, capabilities: 9 },
  ),
  businessModule(
    "administration",
    "Administration",
    "Facilities, records, and executive support operations.",
    "Facilities management, records and filing, and executive assistance processes with deterministic scheduling automations and agent-drafted briefings.",
    "Executive offices and administrative operations teams.",
    1800,
    ["Facilities Management", "Records and Filing", "Executive Assistance"],
    { linkbots: 3, automations: 4, capabilities: 5 },
  ),
  businessModule(
    "business-development",
    "Business Development",
    "Partnerships, market expansion, and distribution strategy.",
    "Strategic partnerships, market expansion, and distribution processes with research agents, CRM side effects under lease, and partnership artefact tracking.",
    "BD leaders exploring partnerships and new markets.",
    3100,
    ["Strategic Partnerships", "Market Expansion", "Distribution"],
    { linkbots: 4, automations: 5, capabilities: 8 },
  ),
  businessModule(
    "software-development",
    "Software Development",
    "Product through DevSecOps delivery with QA and infra gates.",
    "Product management, core engineering, QA, DevOps, and DevSecOps as linked processes — automations run CI/CD checks; agents handle design and code review judgment.",
    "Engineering organizations shipping software products.",
    4500,
    [
      "Product Management & Design",
      "Core Engineering / Development",
      "Quality Assurance (QA) & Testing",
      "DevOps & Infrastructure",
      "Security (DevSecOps)",
    ],
    { linkbots: 6, automations: 9, capabilities: 10 },
  ),
  businessModule(
    "content-creation",
    "Content Creation",
    "Ideation through multi-format production pipelines.",
    "Ideation, copywriting, video, design, and audio production as governed creative processes with draft-only side effects until approval.",
    "Creative studios and in-house content teams.",
    2700,
    [
      "Ideation",
      "Copywriting & Editorial",
      "Video Production & Animation",
      "Graphic Design & Visual Arts",
      "Audio Production",
    ],
    { linkbots: 5, automations: 6, capabilities: 8 },
  ),
];

export const BUSINESS_MODULE_PACKAGES = PACKAGES;

export const BUSINESS_MODULES: ModuleCatalogueItem[] = PACKAGES.map((p) => p.module);

export const BUSINESS_PROCESSES: ModuleProcess[] = PACKAGES.flatMap((p) => p.processes);
