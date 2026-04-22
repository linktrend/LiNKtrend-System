import type { SkillAssetTableRow, SkillReferenceTableRow } from "@/lib/skills-admin";

const MOCK_ASSETS: SkillAssetTableRow[] = [
  {
    id: "11111111-1111-4111-8111-111111111101",
    name: "brand-kit.zip",
    storage_uri: "",
    byte_size: 245_760,
    step_ordinal: null,
  },
  {
    id: "11111111-1111-4111-8111-111111111102",
    name: "sample-cv.pdf",
    storage_uri: "",
    byte_size: 89_432,
    step_ordinal: null,
  },
];

const MOCK_REFERENCES: SkillReferenceTableRow[] = [
  {
    id: "22222222-2222-4222-8222-222222222201",
    label: "STYLE.md",
    kind: "brain_path",
    target: "/memory/company/style-guide",
    step_ordinal: null,
  },
  {
    id: "22222222-2222-4222-8222-222222222202",
    label: "API-notes",
    kind: "brain_path",
    target: "/memory/company/api-notes",
    step_ordinal: null,
  },
];

export type DevTableRefAssetMocksResult = {
  assets: SkillAssetTableRow[];
  references: SkillReferenceTableRow[];
  previewOnlyFileIds: string[];
};

/**
 * In development, when DB-backed reference/asset lists are empty, show sample rows for layout review.
 */
export function applyDevTableRefAssetMocksIfEmpty(
  references: SkillReferenceTableRow[],
  assets: SkillAssetTableRow[],
): DevTableRefAssetMocksResult {
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
