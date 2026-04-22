/**
 * Short operator-facing summary for inbox / draft rows (not a full diff engine).
 */
export function summarizeBrainInboxTextDiff(
  predecessorBody: string | null | undefined,
  body: string,
): { summary: string } {
  const a = (predecessorBody ?? "").trim();
  const b = (body ?? "").trim();
  if (a === b) {
    return { summary: "No text changes." };
  }
  return { summary: `Edited (${a.length} → ${b.length} chars)` };
}
