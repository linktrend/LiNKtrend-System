/**
 * STATE.md DAG helpers — preserve done rows and infer satisfied dependencies.
 */
import { readFileSync } from 'node:fs';

/** @param {string} programPath */
export function parseProgramIssues(programPath) {
  const text = readFileSync(programPath, 'utf8');
  /** @type {Record<string, { depends: string[], wave: number, runtime: string, tier: string }>} */
  const issues = {};
  for (const line of text.split('\n')) {
    const m = line.match(/^\|\s*(LTS-\d+)\s*\|/);
    if (!m) continue;
    const parts = line.split('|').map((p) => p.trim());
    if (parts.length < 7) continue;
    const id = parts[1];
    const runtime = parts[3] || 'cursor';
    const tier = parts[4] || 'standard';
    const depcol = parts[5] ?? '';
    const waveCol = parts[6] ?? '';
    const depends =
      !depcol || depcol === '[]' || depcol === '—'
        ? []
        : depcol.split(',').map((d) => d.trim()).filter(Boolean);
    const waveMatch = waveCol.match(/W(\d+)/);
    const wave = waveMatch ? Number(waveMatch[1]) : 999;
    issues[id] = { depends, wave, runtime, tier };
  }
  return issues;
}

/**
 * Collect explicit `done` issue ids from STATE.
 * @param {object} stateJson
 * @returns {Set<string>}
 */
export function explicitDoneIds(stateJson) {
  return new Set(
    Object.entries(stateJson.issues ?? {})
      .filter(([, v]) => v?.status === 'done')
      .map(([k]) => k),
  );
}

/**
 * Expand done set: any dependency of a done issue is treated as satisfied for DAG checks.
 * Fixes orchestrator "active wave only" pruning that dropped LTS-001 / LTS-010 from STATE.
 *
 * @param {Set<string>} doneIds
 * @param {Record<string, { depends?: string[] }>} programIssues
 * @returns {Set<string>}
 */
export function expandDoneWithAncestors(doneIds, programIssues) {
  const expanded = new Set(doneIds);
  let changed = true;
  while (changed) {
    changed = false;
    for (const id of [...expanded]) {
      for (const dep of programIssues[id]?.depends ?? []) {
        if (!expanded.has(dep) && programIssues[dep]) {
          expanded.add(dep);
          changed = true;
        }
      }
    }
  }
  return expanded;
}

/**
 * @param {object} stateJson
 * @param {Record<string, { depends?: string[] }>} programIssues
 */
export function buildDoneIdSet(stateJson, programIssues) {
  return expandDoneWithAncestors(explicitDoneIds(stateJson), programIssues);
}

/**
 * Ensure ancestor dependencies of done issues remain in STATE as `done` (never prune).
 * @param {object} stateJson
 * @param {Record<string, { depends: string[], runtime: string, tier: string }>} programIssues
 * @param {string} programId
 * @returns {boolean} whether STATE issues map changed
 */
export function seedDoneAncestorsInState(stateJson, programIssues, programId) {
  if (!stateJson.issues) stateJson.issues = {};
  const doneIds = explicitDoneIds(stateJson);
  const expanded = expandDoneWithAncestors(doneIds, programIssues);
  let changed = false;

  for (const id of expanded) {
    if (doneIds.has(id)) continue;
    const meta = programIssues[id];
    if (!meta) continue;
    stateJson.issues[id] = {
      status: 'done',
      runtime: meta.runtime,
      tier: meta.tier,
      depends_on: meta.depends,
      report:
        stateJson.issues[id]?.report ??
        `LiNKdev/product/reports/${programId}/${id}.md`,
      inferred_done: true,
    };
    changed = true;
  }
  return changed;
}
