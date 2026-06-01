/**
 * Skip factory watch / Slack / auto-heal for issues that are no longer active work.
 */

const DONE_LABELS = new Set(['linkdev:done', 'linkdev:review-ready']);

/**
 * @param {string[]} labelNames
 */
export function labelsIndicateDone(labelNames) {
  return labelNames.some((n) => DONE_LABELS.has(n));
}

/**
 * @param {string | undefined} state OPEN | CLOSED
 */
export function issueIsClosed(state) {
  return state === 'CLOSED';
}

/**
 * @param {Set<number>} activeIssueNumbers
 * @param {number} githubNumber
 */
export function isActiveProgramIssue(activeIssueNumbers, githubNumber) {
  if (activeIssueNumbers.size === 0) return false;
  return activeIssueNumbers.has(githubNumber);
}

/**
 * @param {import('node:child_process').spawnSync} gh
 * @param {string} repo
 * @param {string} ltsId
 */
export async function issueHasMergedPr(repo, ltsId, gh) {
  try {
    const prs = JSON.parse(
      await gh(['pr', 'list', '--repo', repo, '--state', 'merged', '--json', 'title,headRefName', '--limit', '100']),
    );
    return prs.some((p) => `${p.title}${p.headRefName}`.includes(ltsId));
  } catch {
    return false;
  }
}

/**
 * @param {{
 *   state?: string,
 *   labelNames: string[],
 *   githubNumber: number,
 *   ltsId: string,
 *   activeIssueNumbers: Set<number>,
 *   hasMergedPr?: boolean,
 * }} ctx
 */
export function shouldSkipFactoryIssue(ctx) {
  const { state, labelNames, githubNumber, activeIssueNumbers, hasMergedPr = false } = ctx;
  if (issueIsClosed(state)) return true;
  if (labelsIndicateDone(labelNames)) return true;
  if (hasMergedPr) return true;
  if (!isActiveProgramIssue(activeIssueNumbers, githubNumber)) return true;
  return false;
}
