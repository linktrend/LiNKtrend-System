/**
 * Copy for demo / mock catalogue rows (`LINKAIOS_UI_MOCKS`). Shown only on injected fixture rows.
 */
export const CATALOGUE_FIXTURE_LABEL = "Preview only";

export const CATALOGUE_FIXTURE_TITLE =
  "Sample row for layout when the catalogue API or database is unavailable. It is not stored in your workspace — open, toggles, and archive have no effect on real data.";

/** Row tint for preview fixtures and draft lifecycle rows (no separate badge). */
export function catalogueRowHighlightClass(row: { isFixture?: boolean; status: string }): string {
  if (row.isFixture || row.status === "draft") {
    return "bg-amber-50/40 dark:bg-amber-950/15 ";
  }
  return "";
}

/** Single class string for the Actions cell toolbar — skills and tools must match. */
export const CATALOGUE_ACTIONS_ROW_CLASS =
  "flex flex-nowrap items-center justify-center gap-2 whitespace-nowrap";
