/**
 * Composed class strings for Data Table (Family A).
 * Change layout once here (via DATA_TABLE / TABLE tokens) — all tables pick it up.
 */
import { DATA_TABLE, TABLE } from "@/lib/ui-standards";

function cn(...parts: (string | false | undefined | null)[]) {
  return parts.filter(Boolean).join(" ");
}

/** Pre-composed header + cell classes for {@link DataTable} surfaces. */
export const DT = {
  thead: TABLE.thead,
  theadBordered: TABLE.theadBordered,
  tbody: DATA_TABLE.tbody,
  tr: DATA_TABLE.tr,
  trCompact: DATA_TABLE.trCompact,
  trMultiline: DATA_TABLE.trMultiline,
  tdCompactInset: DATA_TABLE.tdCompactInset,
  thText: cn(DATA_TABLE.td, TABLE.thText),
  thTextInset: cn(DATA_TABLE.tdInset, TABLE.thText),
  thControl: cn(DATA_TABLE.td, TABLE.thControl),
  thNumeric: cn(DATA_TABLE.td, TABLE.thNumeric),
  td: DATA_TABLE.td,
  tdInset: DATA_TABLE.tdInset,
  tdClip: cn(DATA_TABLE.td, DATA_TABLE.tdClip),
  tdClipInset: cn(DATA_TABLE.tdInset, DATA_TABLE.tdClip),
  tdClipCompactInset: cn(DATA_TABLE.tdCompactInset, DATA_TABLE.tdClip),
  tdControl: cn(DATA_TABLE.td, DATA_TABLE.tdControl),
  tdControlCompact: cn(DATA_TABLE.tdCompactInset, DATA_TABLE.tdControl),
  tdNumeric: cn(DATA_TABLE.td, DATA_TABLE.tdClip, DATA_TABLE.tdNumeric),
  tdTextSpan: DATA_TABLE.tdText,
  tdWrapSpan: DATA_TABLE.tdWrap,
  actionsRow: DATA_TABLE.actionsRow,
  emptyCell: DATA_TABLE.emptyCell,
  controlInner: TABLE.thControlInner,
} as const;
