/**
 * Pure helpers for Cursor Cloud Agents API dispatch payloads (LiNKdev).
 */

/** @typedef {{ role: string, repo: string, issue?: number, pr?: number, branch?: string, hardened?: boolean }} DispatchArgs */

/**
 * Derive a LAW-05 branch name from issue id and title.
 * @param {string} issueId e.g. LTS-005
 * @param {string} title issue title
 */
export function issueBranchName(issueId, title) {
  const slug = title
    .replace(new RegExp(`^${issueId}:\\s*`, 'i'), '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  return `issue/${issueId}-${slug || 'work'}`;
}

/**
 * Build repos[] entry for POST /v1/agents.
 * @param {DispatchArgs} args
 */
export function repoPayload(args) {
  const url = `https://github.com/${args.repo}`;
  const entry = { url };
  if (args.pr) {
    entry.prUrl = `${url}/pull/${args.pr}`;
  } else if (args.branch) {
    entry.startingRef = args.branch;
  } else {
    entry.startingRef = process.env.LINKDEV_DISPATCH_REF ?? 'development';
  }
  return [entry];
}

/**
 * Top-level API body fields beyond prompt/repos/name.
 * @param {DispatchArgs} args
 */
export function agentOptions(args) {
  const opts = { mode: 'agent' };

  if (args.role === 'executor') {
    opts.autoCreatePR = true;
    opts.skipReviewerRequest = true;
    if (args.branch || args.hardened) {
      opts.workOnCurrentBranch = true;
    }
  }

  if (args.pr && (args.role === 'reviewer' || args.role === 'integrator')) {
    opts.workOnCurrentBranch = true;
  }

  const modelId = process.env.LINKDEV_EXECUTOR_MODEL;
  if (args.role === 'executor' && modelId) {
    opts.model = { id: modelId };
  }

  return opts;
}

/**
 * Full POST /v1/agents body.
 * @param {string} prompt
 * @param {DispatchArgs} args
 */
export function buildAgentRequestBody(prompt, args) {
  return {
    prompt: { text: prompt },
    repos: repoPayload(args),
    name: agentDisplayName(args),
    ...agentOptions(args),
  };
}

/**
 * @param {DispatchArgs} args
 */
export function agentDisplayName(args) {
  const slug = args.repo.split('/').pop() ?? 'repo';
  if (args.issue) return `LiNKdev-${args.role}-issue-${args.issue}-${slug}`;
  if (args.pr) return `LiNKdev-${args.role}-pr-${args.pr}-${slug}`;
  return `LiNKdev-${args.role}-${slug}`;
}

/**
 * Executor FINISHED is only success when a PR exists (API or GitHub).
 * @param {{ status: string, git?: { branches?: Array<{ prUrl?: string, branch?: string }> } }} run
 * @param {boolean} [remoteBranchExists]
 */
export function executorRunHasPrProof(run, remoteBranchExists = false) {
  const prUrl = run?.git?.branches?.[0]?.prUrl;
  if (prUrl) return true;
  if (run?.status !== 'FINISHED') return false;
  return false;
}

/**
 * Watch treats FINISHED-without-PR as incomplete handoff.
 * @param {string} roleHint
 * @param {{ status: string, git?: { branches?: Array<{ prUrl?: string }> } }} run
 */
export function isIncompleteExecutorFinish(roleHint, run) {
  if (roleHint !== 'executor') return false;
  if (run.status !== 'FINISHED') return false;
  return !run.git?.branches?.[0]?.prUrl;
}
