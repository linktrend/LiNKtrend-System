/** Agent daily log virtual files use paths like `memory/YYYY-MM-DD.md`. */
export const MEMORY_DAILY_LOG_PATH_RE = /^memory\/(\d{4}-\d{2}-\d{2})\.md$/;

export function parseDailyLogDateFromPath(logicalPath: string): string | null {
  const m = logicalPath.match(MEMORY_DAILY_LOG_PATH_RE);
  return m?.[1] ?? null;
}

/**
 * Merge append-only daily log lines into a published body preview for retrieval.
 * Used when virtual file kind is `daily_log`.
 */
export function mergeDailyLogLinesIntoPublishedBody(publishedBody: string, lines: string[]): string {
  if (!lines.length) return publishedBody;
  const block = lines.map((l) => `- ${l}`).join("\n");
  if (!publishedBody.trim()) {
    return `## Daily log\n\n${block}\n`;
  }
  return `${publishedBody.trimEnd()}\n\n## Appended lines\n\n${block}\n`;
}
