import type { OperatorAccessItem } from "@/lib/operator-access-scope";

export const PROCESS_CATALOG_CATEGORIES = [
  "Marketing",
  "Sales",
  "Finance & Accounting",
  "Human Resources",
  "Legal & Compliance",
  "Administration",
  "Customer Success",
] as const;

export type ProcessCatalogCategory = (typeof PROCESS_CATALOG_CATEGORIES)[number];

export type ProcessCatalogGroup = {
  category: ProcessCatalogCategory;
  processes: OperatorAccessItem[];
};

const MODULE_CATEGORY_HINTS: { pattern: RegExp; category: ProcessCatalogCategory }[] = [
  { pattern: /market|media|brand|content|seo|creative|linksites|website/i, category: "Marketing" },
  { pattern: /sales|pipeline|outbound|revenue|partnership|biz-dev/i, category: "Sales" },
  { pattern: /finance|account|billing|invoice|payroll|expense/i, category: "Finance & Accounting" },
  { pattern: /hr|human|talent|hiring|recruit|employee/i, category: "Human Resources" },
  { pattern: /legal|lexos|litigation|compliance|contract/i, category: "Legal & Compliance" },
  { pattern: /customer|success|support|helpdesk|cs/i, category: "Customer Success" },
];

function inferCategory(item: OperatorAccessItem): ProcessCatalogCategory {
  const haystack = `${item.id} ${item.label} ${item.detail ?? ""}`;
  for (const hint of MODULE_CATEGORY_HINTS) {
    if (hint.pattern.test(haystack)) return hint.category;
  }
  return "Administration";
}

export function groupProcessesByCategory(processes: OperatorAccessItem[]): ProcessCatalogGroup[] {
  const buckets = new Map<ProcessCatalogCategory, OperatorAccessItem[]>();
  for (const category of PROCESS_CATALOG_CATEGORIES) {
    buckets.set(category, []);
  }

  for (const process of processes) {
    const category = inferCategory(process);
    buckets.get(category)!.push(process);
  }

  return PROCESS_CATALOG_CATEGORIES.map((category) => ({
    category,
    processes: buckets.get(category) ?? [],
  })).filter((group) => group.processes.length > 0);
}

export function filterProcessCatalog(
  groups: ProcessCatalogGroup[],
  query: string,
  categoryFilter: ProcessCatalogCategory | "all"
): ProcessCatalogGroup[] {
  const normalized = query.trim().toLowerCase();
  return groups
    .filter((group) => categoryFilter === "all" || group.category === categoryFilter)
    .map((group) => ({
      ...group,
      processes: group.processes.filter((process) => {
        if (!normalized) return true;
        return (
          process.label.toLowerCase().includes(normalized) ||
          (process.detail?.toLowerCase().includes(normalized) ?? false)
        );
      }),
    }))
    .filter((group) => group.processes.length > 0);
}
