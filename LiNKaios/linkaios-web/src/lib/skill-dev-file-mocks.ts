import type { SkillFileRow } from "@/lib/skills-admin";

/** Stable ids so the UI can treat these rows as preview-only (dev). */
const MOCK_ASSETS: SkillFileRow[] = [
  { id: "11111111-1111-4111-8111-111111111101", name: "brand-kit.zip", kind: "asset", bytes: 245_760 },
  { id: "11111111-1111-4111-8111-111111111102", name: "sample-cv.pdf", kind: "asset", bytes: 89_432 },
  { id: "11111111-1111-4111-8111-111111111103", name: "hero-banner.png", kind: "asset", bytes: 512_000 },
];

const MOCK_REFERENCES: SkillFileRow[] = [
  { id: "22222222-2222-4222-8222-222222222201", name: "STYLE.md", kind: "reference", bytes: 4_096 },
  { id: "22222222-2222-4222-8222-222222222202", name: "API-notes.txt", kind: "reference", bytes: 1_024 },
  { id: "22222222-2222-4222-8222-222222222203", name: "glossary.json", kind: "reference", bytes: 2_048 },
];

export type DevFileMocksResult = {
  assets: SkillFileRow[];
  references: SkillFileRow[];
  /** Ids injected for layout preview only; archive is disabled for these. */
  previewOnlyFileIds: string[];
};

/**
 * In development, when a list is empty, show sample rows so file lists can be reviewed without seeding the DB.
 */
export function applyDevFileMocksIfEmpty(assets: SkillFileRow[], references: SkillFileRow[]): DevFileMocksResult {
  if (process.env.NODE_ENV !== "development") {
    return { assets, references, previewOnlyFileIds: [] };
  }
  const previewOnlyFileIds: string[] = [];
  const nextAssets = assets.length === 0 ? [...MOCK_ASSETS] : assets;
  const nextRefs = references.length === 0 ? [...MOCK_REFERENCES] : references;
  if (assets.length === 0) previewOnlyFileIds.push(...MOCK_ASSETS.map((a) => a.id));
  if (references.length === 0) previewOnlyFileIds.push(...MOCK_REFERENCES.map((r) => r.id));
  return { assets: nextAssets, references: nextRefs, previewOnlyFileIds };
}
