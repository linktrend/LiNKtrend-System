/**
 * LiNKdev factory — executor failure escalation and label normalization.
 */

export const FINISHED_NO_PR_MAX_HEALS = 2;
export const PRINCIPAL_STOP_MARKER = '[linkdev-principal-stop]';
export const LOCAL_FALLBACK_MARKER = '[linkdev-local-fallback]';

export function countFinishedNoPrHeals(comments, cycleStartAt) {
  const cycleStartMs = cycleStartAt ? new Date(cycleStartAt).getTime() : 0;
  return comments.filter(
    (c) =>
      (c.body?.includes('[linkdev-finished-no-pr]') ||
        (c.body?.includes('[linkdev-auto-heal]') && c.body?.includes('FINISHED without'))) &&
      new Date(c.createdAt).getTime() >= cycleStartMs,
  ).length;
}

export function hasPrincipalStop(comments) {
  return comments.some((c) => c.body?.includes(PRINCIPAL_STOP_MARKER));
}

export function shouldEscalateFinishedNoPr(comments, cycleStartAt) {
  if (hasPrincipalStop(comments)) return false;
  return countFinishedNoPrHeals(comments, cycleStartAt) >= FINISHED_NO_PR_MAX_HEALS;
}

/**
 * Normalize conflicting executor labels: in-progress wins over ready.
 * @param {string[]} labelNames
 * @returns {{ removeReady: boolean }}
 */
export function normalizeExecutorLabelPlan(labelNames) {
  const hasInProgress = labelNames.includes('linkdev:in-progress');
  const hasReady = labelNames.includes('linkdev:ready');
  return { removeReady: hasInProgress && hasReady };
}

/**
 * @param {import('node:child_process').spawnSync} ghFn
 */
export async function applyNormalizeExecutorLabels(repo, issueNum, labelNames, dryRun, gh) {
  const plan = normalizeExecutorLabelPlan(labelNames);
  if (!plan.removeReady || dryRun) return plan.removeReady;
  await gh(['issue', 'edit', String(issueNum), '--repo', repo, '--remove-label', 'linkdev:ready']).catch(() => {});
  return true;
}

/**
 * Stop auto-heal after repeated FINISHED-without-PR; queue local fallback marker.
 */
export async function escalateExecutorNoPr(repo, issueNum, ltsId, dryRun, gh) {
  const body = [
    PRINCIPAL_STOP_MARKER,
    LOCAL_FALLBACK_MARKER,
    `**Executor failed ${FINISHED_NO_PR_MAX_HEALS} times without opening a PR** (${ltsId}, #${issueNum}).`,
    'Cloud executor auto-heal paused. Local implementer or Principal agent should take over.',
    'Reply **Continue** after local PR is opened with `linkdev:review-ready`.',
  ].join('\n\n');

  if (dryRun) {
    console.log(`DRY_RUN escalate #${issueNum} (${ltsId})`);
    return;
  }

  await gh(['issue', 'comment', String(issueNum), '--repo', repo, '--body', body]);
  await gh(['issue', 'edit', String(issueNum), '--repo', repo, '--add-label', 'linkdev:principal-stop']).catch(() => {});
  await gh(['issue', 'edit', String(issueNum), '--repo', repo, '--remove-label', 'linkdev:in-progress']).catch(() => {});
  await gh(['issue', 'edit', String(issueNum), '--repo', repo, '--remove-label', 'linkdev:ready']).catch(() => {});
  console.log(`escalated #${issueNum} (${ltsId}) to principal-stop after ${FINISHED_NO_PR_MAX_HEALS} FINISHED-without-PR heals`);
}
