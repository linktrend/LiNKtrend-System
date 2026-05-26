import {
  MODULES_CATALOG_DEMO,
  processesForModule,
  type ModuleCatalogueItem,
  type ModuleProcess,
} from "@/lib/ui-mocks/modules-catalog-demo";

export type LicensorSuitePublishState = "draft" | "ready" | "published";

export type LicensorSuiteProduct = {
  id: string;
  name: string;
  summary: string;
  publishState: LicensorSuitePublishState;
  stripeProductId: string | null;
  modules: ModuleProcess[];
  moduleCount: number;
  phaseCount: number;
  issueCount: number;
  linkbotCount: number;
  automationCount: number;
};

function countComposition(processes: ModuleProcess[]) {
  let phaseCount = 0;
  let issueCount = 0;
  let linkbotCount = 0;
  let automationCount = 0;

  for (const process of processes) {
    phaseCount += process.workflows.length;
    for (const workflow of process.workflows) {
      issueCount += workflow.issues.length;
      for (const issue of workflow.issues) {
        for (const ex of issue.executors) {
          if (ex.kind === "agent") linkbotCount += 1;
          else if (ex.kind === "automation") automationCount += 1;
          else if (ex.kind === "hybrid") {
            linkbotCount += 1;
            automationCount += 1;
          }
        }
      }
    }
  }

  return {
    moduleCount: processes.length,
    phaseCount,
    issueCount,
    linkbotCount,
    automationCount,
  };
}

function productFromModule(
  mod: ModuleCatalogueItem,
  publishState: LicensorSuitePublishState,
  stripeProductId: string | null,
): LicensorSuiteProduct {
  const modules = processesForModule(mod.id);
  const counts = countComposition(modules);
  return {
    id: mod.id,
    name: mod.name,
    summary: mod.summary,
    publishState,
    stripeProductId,
    modules,
    ...counts,
  };
}

/** Licensor-managed suite products — composition + publish lifecycle (demo). */
export const LICENSOR_SUITE_PRODUCTS: LicensorSuiteProduct[] = [
  productFromModule(MODULES_CATALOG_DEMO.modules.find((m) => m.id === "linksites")!, "published", "prod_linksites"),
  productFromModule(MODULES_CATALOG_DEMO.modules.find((m) => m.id === "linkapps")!, "published", "prod_linkapps"),
  productFromModule(MODULES_CATALOG_DEMO.modules.find((m) => m.id === "lexos-litigation")!, "ready", "prod_lexos_litigation"),
  {
    id: "venture-media",
    name: "Venture Media",
    summary: "Content and campaign operations for media studios — in progress.",
    publishState: "draft",
    stripeProductId: null,
    modules: [],
    moduleCount: 0,
    phaseCount: 0,
    issueCount: 0,
    linkbotCount: 0,
    automationCount: 0,
  },
];

export function resolveLicensorSuiteProduct(suiteId: string): LicensorSuiteProduct | undefined {
  return LICENSOR_SUITE_PRODUCTS.find((row) => row.id === suiteId);
}

export function licensorSuitePublishLabel(state: LicensorSuitePublishState): string {
  if (state === "draft") return "Draft";
  if (state === "ready") return "Ready";
  return "Published";
}

export function licensorSuitePublishTone(state: LicensorSuitePublishState): "neutral" | "warning" | "success" {
  if (state === "draft") return "neutral";
  if (state === "ready") return "warning";
  return "success";
}

export function suiteBuilderCompleteness(product: LicensorSuiteProduct): number {
  if (product.publishState === "published") return 100;
  const checks = [
    product.name.trim().length > 0,
    product.summary.trim().length > 0,
    product.moduleCount > 0,
    product.phaseCount > 0,
    product.issueCount > 0,
    product.linkbotCount > 0,
    product.automationCount > 0,
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

export function canMarkSuiteReady(product: LicensorSuiteProduct): boolean {
  return product.publishState === "draft" && suiteBuilderCompleteness(product) >= 85;
}

export function canPublishSuite(product: LicensorSuiteProduct): boolean {
  return product.publishState === "ready" && product.stripeProductId != null;
}
