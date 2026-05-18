import path from "node:path";

/**
 * PRISM `cleanup_events.action` vocabulary (subset used by FS policy).
 * @see docs/PRISM-Defender-PRD.md §8
 */

/** Resolved file path must be exactly the root or strictly under it (prefix + sep). */
export function pathIsUnderResolvedRoot(fileResolved: string, rootResolved: string): boolean {
  const normFile = path.normalize(fileResolved);
  const normRoot = path.normalize(rootResolved);
  if (normFile === normRoot) return true;
  const prefix = normRoot.endsWith(path.sep) ? normRoot : normRoot + path.sep;
  return normFile.startsWith(prefix);
}

/** Resolve deny prefixes to absolute normalized paths; drop invalid entries. */
export function resolveDenyPrefixes(prefixes: string[], cwd: string = process.cwd()): string[] {
  const out: string[] = [];
  for (const p of prefixes) {
    const t = p.trim();
    if (!t) continue;
    const abs = path.isAbsolute(t) ? path.normalize(t) : path.normalize(path.resolve(cwd, t));
    out.push(abs.endsWith(path.sep) ? abs.slice(0, -1) || abs : abs);
  }
  return out;
}

export function matchesAnyDenyPrefix(fileResolved: string, denyResolved: string[]): boolean {
  const normFile = path.normalize(fileResolved);
  for (const d of denyResolved) {
    const normDeny = path.normalize(d);
    if (normFile === normDeny) return true;
    const prefix = normDeny.endsWith(path.sep) ? normDeny : normDeny + path.sep;
    if (normFile.startsWith(prefix)) return true;
  }
  return false;
}

/** True if file is old enough to delete (mtime preferred, then ctime). */
export function fileMtimeEligible(
  mtimeMs: number,
  ctimeMs: number,
  nowMs: number,
  minAgeSec: number,
): boolean {
  const ageMs = minAgeSec * 1000;
  const t = Number.isFinite(mtimeMs) && mtimeMs > 0 ? mtimeMs : ctimeMs;
  if (!Number.isFinite(t)) return false;
  return nowMs - t >= ageMs;
}
