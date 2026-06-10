/** Admin-only project type labels shown in the Projects table. */
export type AdminProjectType = "suite_gen" | "librarian_filings" | "platform_ops";

export type AdminProjectTypeLabel = "Suite Gen" | "Librarian Filings" | "Platform Ops";

const SUITE_GEN_IDS = new Set(["linksuitegen", "link-suitegen", "suitegen"]);
const LIBRARIAN_SUITE_IDS = new Set(["linkbrain", "librarian"]);
const LIBRARIAN_MODULE_PREFIXES = ["librarian", "brain-librarian", "linksites.librarian"];

export function classifyAdminProjectType(
  suiteId: string | null | undefined,
  moduleIds: string[] | null | undefined,
): AdminProjectType {
  const suite = suiteId?.trim().toLowerCase() ?? "";
  const modules = (moduleIds ?? []).map((m) => m.trim().toLowerCase());

  if (SUITE_GEN_IDS.has(suite) || modules.some((m) => m.includes("suitegen") || m.includes("suite-gen"))) {
    return "suite_gen";
  }

  if (
    LIBRARIAN_SUITE_IDS.has(suite) ||
    modules.some((m) => LIBRARIAN_MODULE_PREFIXES.some((prefix) => m.includes(prefix)))
  ) {
    return "librarian_filings";
  }

  return "platform_ops";
}

export function adminProjectTypeLabel(type: AdminProjectType): AdminProjectTypeLabel {
  switch (type) {
    case "suite_gen":
      return "Suite Gen";
    case "librarian_filings":
      return "Librarian Filings";
    default:
      return "Platform Ops";
  }
}

/** Governed create presets for Admin Launch wizard — maps to linkaios.create_project fields. */
export const ADMIN_PROJECT_CREATE_PRESETS: Record<
  AdminProjectType,
  { suiteId: string; moduleIds: string[]; summary: string }
> = {
  suite_gen: {
    suiteId: "linksuitegen",
    moduleIds: ["suite-gen-catalogue"],
    summary: "LiNKsuitegen vendor catalogue and publish pipeline.",
  },
  librarian_filings: {
    suiteId: "linkbrain",
    moduleIds: ["linksites.librarian"],
    summary: "Collective knowledge filings and librarian review queue.",
  },
  platform_ops: {
    suiteId: "linktrend-platform",
    moduleIds: ["platform-ops"],
    summary: "Studio platform operations and governance tasks.",
  },
};

export function resolveAdminProjectCreatePreset(type: AdminProjectType) {
  return ADMIN_PROJECT_CREATE_PRESETS[type];
}

export function isAdminProjectType(value: unknown): value is AdminProjectType {
  return value === "suite_gen" || value === "librarian_filings" || value === "platform_ops";
}
