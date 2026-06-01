/**
 * Stall timer helpers — count from the current executor cycle only.
 * After auto-heal or wave-ready, ignore older dispatch comments from prior cycles.
 */

const CYCLE_MARKERS = ['[linkdev-auto-heal]', '[linkdev-wave-ready]'];
const DISPATCH_MARKER = '[linkdev-dispatch]';

function markerTime(comments, marker) {
  const hit = [...comments].reverse().find((c) => c.body?.includes(marker));
  return hit?.createdAt ? new Date(hit.createdAt).getTime() : 0;
}

/**
 * Start of the current stall window: latest dispatch at or after the latest cycle reset.
 * @param {Array<{ body?: string, createdAt?: string }>} comments
 * @returns {string | null} ISO timestamp
 */
export function stallCycleStartAt(comments) {
  let epoch = 0;
  for (const marker of CYCLE_MARKERS) {
    epoch = Math.max(epoch, markerTime(comments, marker));
  }
  for (const c of [...comments].reverse()) {
    if (!c.body?.includes(DISPATCH_MARKER)) continue;
    const t = new Date(c.createdAt).getTime();
    if (t >= epoch) return c.createdAt;
  }
  return null;
}

export function minutesSinceStallCycleStart(comments) {
  const start = stallCycleStartAt(comments);
  if (!start) return Infinity;
  return (Date.now() - new Date(start).getTime()) / 60000;
}
