import { COLLECTIVE_TAG_OPTIONS, type CollectiveMemoryTags } from "@/lib/collective-linkbrain";

export type MemoryItemTags = Required<CollectiveMemoryTags>;

const TAG_KEYS = ["industry", "pattern", "useCase"] as const;

function allowedValues(key: (typeof TAG_KEYS)[number]): readonly string[] {
  const group = COLLECTIVE_TAG_OPTIONS.find((g) => g.key === key);
  return group?.values ?? [];
}

export function validateMemoryItemTags(input: Partial<CollectiveMemoryTags>): { ok: true; tags: MemoryItemTags } | { ok: false; error: string } {
  const industry = input.industry?.trim() ?? "";
  const pattern = input.pattern?.trim() ?? "";
  const useCase = input.useCase?.trim() ?? "";

  if (!industry) return { ok: false, error: "Industry is required." };
  if (!pattern) return { ok: false, error: "Pattern is required." };
  if (!useCase) return { ok: false, error: "Use Case is required." };

  if (!allowedValues("industry").includes(industry)) {
    return { ok: false, error: `Industry must be one of: ${allowedValues("industry").join(", ")}.` };
  }
  if (!allowedValues("pattern").includes(pattern)) {
    return { ok: false, error: `Pattern must be one of: ${allowedValues("pattern").join(", ")}.` };
  }
  if (!allowedValues("useCase").includes(useCase)) {
    return { ok: false, error: `Use Case must be one of: ${allowedValues("useCase").join(", ")}.` };
  }

  return { ok: true, tags: { industry, pattern, useCase } };
}

export function parseMemoryTagsFromForm(formData: FormData): { ok: true; tags: MemoryItemTags } | { ok: false; error: string } {
  return validateMemoryItemTags({
    industry: String(formData.get("tagIndustry") ?? ""),
    pattern: String(formData.get("tagPattern") ?? ""),
    useCase: String(formData.get("tagUseCase") ?? ""),
  });
}

/** Default tags for LiNKbot / automation submissions when skill metadata is not yet wired. */
export function automationMemoryItemTags(): MemoryItemTags {
  return {
    industry: COLLECTIVE_TAG_OPTIONS[0]!.values[0]!,
    pattern: "Governance",
    useCase: "Workflow Automation",
  };
}

export function memoryTagsFromJson(raw: unknown): CollectiveMemoryTags | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const industry = typeof o.industry === "string" ? o.industry : undefined;
  const pattern = typeof o.pattern === "string" ? o.pattern : undefined;
  const useCase = typeof o.useCase === "string" ? o.useCase : undefined;
  if (!industry && !pattern && !useCase) return null;
  return { industry, pattern, useCase };
}
