#!/usr/bin/env node
/**
 * Poll Cursor Cloud Agents for LiNKdev runs; post GitHub issue/PR status comments.
 * Requires CURSOR_API_KEY and GH_TOKEN (or gh auth).
 *
 * Usage: node sync-agent-watch.mjs [--repo owner/name] [--dry-run]
 */
import { appendFileSync } from 'node:fs';
import {
  applyNormalizeExecutorLabels,
  countFinishedNoPrHeals,
  escalateExecutorNoPr,
  shouldEscalateFinishedNoPr,
} from './linkdev-factory-escalation.mjs';
import { isIncompleteExecutorFinish } from './linkdev-dispatch-payload.mjs';
import {
  issueHasMergedPr,
  shouldSkipFactoryIssue,
} from './linkdev-issue-terminal.mjs';
import { minutesSinceStallCycleStart, minutesSinceLastHealInCycle, stallCycleStartAt } from './linkdev-stall-clock.mjs';
import { createGhClient } from './linkdev-gh-api.mjs';

const API = 'https://api.cursor.com/v1';
const MARKER = '[linkdev-agent-watch]';
const TERMINAL = new Set(['FINISHED', 'ERROR', 'CANCELLED', 'EXPIRED']);

function parseArgs(argv) {
  const out = { repo: process.env.GITHUB_REPOSITORY ?? null, dryRun: false };
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--repo') out.repo = argv[++i];
    else if (a === '--dry-run') out.dryRun = true;
    else throw new Error(`Unknown argument: ${a}`);
  }
  if (!out.repo) throw new Error('--repo or GITHUB_REPOSITORY is required');
  return out;
}

async function cursorApi(path) {
  const apiKey = process.env.CURSOR_API_KEY;
  if (!apiKey) throw new Error('CURSOR_API_KEY is not set');
  const auth = Buffer.from(`${apiKey}:`, 'utf8').toString('base64');
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  if (!res.ok) throw new Error(`Cursor API ${res.status} ${path}: ${JSON.stringify(json)}`);
  return json;
}

let ghClient = null;

function ensureGhClient() {
  if (!ghClient) ghClient = createGhClient();
  return ghClient;
}

async function gh(args) {
  return ensureGhClient().call(args);
}

function ghBound(args) {
  return ensureGhClient().call(args);
}

function issueFromLtsToken(token, issueMap) {
  if (!token) return null;
  for (const [ltsId, meta] of Object.entries(issueMap)) {
    if (token.includes(ltsId)) {
      return { kind: 'issue', number: meta.github_number };
    }
  }
  return null;
}

function parseAgentTarget(name, run, agent, issueMap) {
  const issue = name.match(/^LiNKdev-(?:orchestrator|executor|reviewer|integrator)-issue-(\d+)-/);
  if (issue) return { kind: 'issue', number: Number(issue[1]) };
  const pr = name.match(/^LiNKdev-(?:orchestrator|executor|reviewer|integrator)-pr-(\d+)-/);
  if (pr) return { kind: 'pr', number: Number(pr[1]) };

  for (const repo of agent?.repos ?? []) {
    const prUrl = repo.prUrl ?? '';
    const prNum = prUrl.match(/\/pull\/(\d+)/)?.[1];
    if (prNum) return { kind: 'pr', number: Number(prNum) };
  }

  const branches = run?.git?.branches ?? [];
  for (const b of branches) {
    const hit = issueFromLtsToken(b.branch ?? '', issueMap);
    if (hit) return hit;
  }
  return null;
}

async function resolveTargetFromPr(repo, prNumber, issueMap) {
  try {
    const pr = ensureGhClient().prView(repo, prNumber, 'title,headRefName,body');
    const title = pr.title ?? '';
    if (/orchestrator/i.test(title)) {
      return { kind: 'pr', number: prNumber };
    }
    const titleHit = title.match(/^(LTS-\d+)\b/);
    if (titleHit) {
      const hit = issueFromLtsToken(titleHit[1], issueMap);
      if (hit) return hit;
    }
    const headHit = issueFromLtsToken(pr.headRefName ?? '', issueMap);
    if (headHit) return headHit;
    const bodyMatches = [...(pr.body ?? '').matchAll(/\bLTS-\d+\b/g)].map((m) => m[0]);
    const unique = [...new Set(bodyMatches)];
    if (unique.length === 1) {
      const hit = issueFromLtsToken(unique[0], issueMap);
      if (hit) return hit;
    }
    return { kind: 'pr', number: prNumber };
  } catch {
    return { kind: 'pr', number: prNumber };
  }
}

async function loadIssueMap() {
  const { readFileSync, existsSync } = await import('node:fs');
  const { join } = await import('node:path');
  const candidates = [
    'LiNKdev/product/reports/linktrend-system/github-issues.json',
  ];
  for (const p of candidates) {
    if (!existsSync(p)) continue;
    const data = JSON.parse(readFileSync(p, 'utf8'));
    return data.issues ?? {};
  }
  return {};
}

const DISPATCH_MARKER = '[linkdev-dispatch]';
const AGENT_ID_RE = /\| Agent \| `([^`]+)` \|/;

/** Cursor API often ignores custom agent names — map agent id → issue/pr from dispatch comments. */
async function buildDispatchAgentMap(repo, issueMap, activeIssueNumbers) {
  const client = ensureGhClient();
  const map = new Map();
  const finishedAgentIds = new Set();
  const issueNumbers = [...new Set(Object.values(issueMap).map((m) => m.github_number))].filter(
    (num) => activeIssueNumbers.size === 0 || activeIssueNumbers.has(num),
  );

  for (const num of issueNumbers) {
    let view;
    try {
      view = client.issueView(repo, num);
    } catch {
      continue;
    }
    if (view.state === 'CLOSED') continue;
    for (const comment of view.comments ?? []) {
      if (comment.body?.includes(MARKER) && comment.body?.includes('FINISHED')) {
        const finishedId = comment.body.match(AGENT_ID_RE)?.[1];
        if (finishedId) finishedAgentIds.add(finishedId);
      }
      if (!comment.body?.includes(DISPATCH_MARKER)) continue;
      const agentId = comment.body.match(AGENT_ID_RE)?.[1];
      if (agentId) map.set(agentId, { kind: 'issue', number: num });
    }
  }

  try {
    const prs = JSON.parse(
      await gh(['pr', 'list', '--repo', repo, '--state', 'open', '--json', 'number', '--limit', '15']),
    );
    for (const pr of prs) {
      let comments;
      try {
        comments = JSON.parse(await gh(['api', `repos/${repo}/issues/${pr.number}/comments`, '--paginate']));
      } catch {
        continue;
      }
      for (const comment of Array.isArray(comments) ? comments : comments.items ?? []) {
        if (comment.body?.includes(MARKER) && comment.body?.includes('FINISHED')) {
          const finishedId = comment.body.match(AGENT_ID_RE)?.[1];
          if (finishedId) finishedAgentIds.add(finishedId);
        }
        if (!comment.body?.includes(DISPATCH_MARKER)) continue;
        const agentId = comment.body.match(AGENT_ID_RE)?.[1];
        if (agentId) map.set(agentId, { kind: 'pr', number: pr.number });
      }
    }
  } catch {
    /* optional PR scan */
  }

  return { map, finishedAgentIds };
}

function roleFromAgentName(name) {
  const m = name?.match(/^LiNKdev-(orchestrator|executor|reviewer|integrator)-/);
  return m?.[1] ?? 'unknown';
}

function statusEmoji(status, incompleteFinish) {
  if (status === 'RUNNING' || status === 'CREATING') return '🔄';
  if (status === 'FINISHED' && incompleteFinish) return '⚠️';
  if (status === 'FINISHED') return '✅';
  if (status === 'ERROR' || status === 'EXPIRED') return '❌';
  if (status === 'CANCELLED') return '⏹️';
  return 'ℹ️';
}

function buildWatchBody({ agent, run, roleHint }) {
  const role = roleHint ?? roleFromAgentName(agent.name);
  const incompleteFinish = isIncompleteExecutorFinish(role, run);
  const status = run.status;
  const emoji = statusEmoji(status, incompleteFinish);
  const branch = run.git?.branches?.[0]?.branch;
  const prUrl = run.git?.branches?.[0]?.prUrl;
  const lines = [
    `${MARKER} ${emoji} **Agent ${incompleteFinish ? 'finished without PR' : status.toLowerCase()}**`,
    '',
    '| Field | Value |',
    '|-------|-------|',
    `| Agent | \`${agent.id}\` |`,
    `| Name | ${agent.name} |`,
    `| Run | \`${run.id}\` |`,
    `| Status | \`${status}\` |`,
  ];
  if (run.durationMs) lines.push(`| Duration | ${Math.round(run.durationMs / 1000)}s |`);
  if (branch) lines.push(`| Branch | \`${branch}\` |`);
  if (prUrl) lines.push(`| PR | ${prUrl} |`);
  lines.push(`| Cursor | [Open agent](${agent.url}) |`);
  lines.push('');
  if (incompleteFinish) {
    lines.push(
      '**Incomplete handoff:** Cursor reported FINISHED but no PR URL. Factory auto-heal will retry or escalate.',
    );
  } else if (status === 'FINISHED') {
    lines.push('**Done signal:** PR should exist with `linkdev:review-ready`. Integrator merges after review.');
  } else if (TERMINAL.has(status) && status !== 'FINISHED') {
    lines.push('**Action:** Run failed or stopped. Tell your LiNKdev agent to investigate, or re-dispatch after fixing the blocker.');
  } else {
    lines.push('**Still running.** Next automatic update in ~10 minutes unless status changes.');
  }
  return lines.join('\n');
}

async function recentHasMarker(repo, target, agentId) {
  try {
    let comments;
    if (target.kind === 'issue') {
      comments = JSON.parse(await gh(['issue', 'view', String(target.number), '--repo', repo, '--json', 'comments']));
      const body = comments.comments?.map((c) => c.body).join('\n') ?? '';
      return body.includes(`${MARKER}`) && body.includes(agentId) && body.includes('FINISHED');
    }
    comments = JSON.parse(await gh(['api', `repos/${repo}/issues/${target.number}/comments`, '--paginate']));
    const body = (Array.isArray(comments) ? comments : comments.items ?? [])
      .map((c) => c.body)
      .join('\n');
    return body.includes(MARKER) && body.includes(agentId) && body.includes('FINISHED');
  } catch {
    return false;
  }
}

async function postComment(repo, target, body, dryRun) {
  if (dryRun) {
    console.log('DRY_RUN comment', target, body.slice(0, 120));
    return;
  }
  if (target.kind === 'issue') {
    await gh(['issue', 'comment', String(target.number), '--repo', repo, '--body', body]);
    return;
  }
  await gh(['pr', 'comment', String(target.number), '--repo', repo, '--body', body]);
}

async function applyTerminalLabels(repo, target, status, dryRun) {
  if (target.kind !== 'issue' || dryRun) return;
  if (status === 'ERROR' || status === 'EXPIRED') {
    await gh(['issue', 'edit', String(target.number), '--repo', repo, '--add-label', 'linkdev:blocked']).catch(() => {});
  }
}

const HEAL_MARKER = '[linkdev-auto-heal]';
const FINISHED_NO_PR_MARKER = '[linkdev-finished-no-pr]';
const STALL_MINUTES = 10;
const FINISHED_NO_PR_MINUTES = 0;
const HEAL_COOLDOWN_MINUTES = 60;

async function issueHasOpenPr(repo, ltsId) {
  try {
    const prs = JSON.parse(await gh(['pr', 'list', '--repo', repo, '--state', 'open', '--json', 'number,title,headRefName', '--limit', '50']));
    return prs.some((p) => (p.title + p.headRefName).includes(ltsId));
  } catch {
    return false;
  }
}

async function branchHasCommitsAhead(repo, branch, base = 'development') {
  try {
    const out = await gh([
      'api',
      `repos/${repo}/compare/${base}...${branch}`,
      '--jq',
      '.ahead_by',
    ]);
    return Number(out) > 0;
  } catch {
    return false;
  }
}

async function tryCreatePrFromBranch(repo, branch, ltsId, issueNum, dryRun) {
  if (!branch || dryRun) return false;
  try {
    const remote = await gh(['api', `repos/${repo}/git/ref/heads/${branch}`, '--jq', '.object.sha']).catch(() => null);
    if (!remote) return false;
    if (!(await branchHasCommitsAhead(repo, branch))) {
      console.warn(`auto-heal skip PR: branch ${branch} has no commits ahead of development`);
      return false;
    }
    const title = `${ltsId}: auto-opened from executor branch`;
    const body = `[linkdev-auto-heal] Opened PR from remote branch \`${branch}\` after executor FINISHED without PR.`;
    await gh([
      'pr', 'create', '--repo', repo, '--base', 'development', '--head', branch,
      '--title', title, '--body', body,
    ]);
    await gh(['issue', 'comment', String(issueNum), '--repo', repo, '--body', `${FINISHED_NO_PR_MARKER} Opened PR from branch \`${branch}\`.`]);
    console.log(`auto-heal created PR from branch ${branch} for ${ltsId}`);
    return true;
  } catch (err) {
    console.warn(`auto-heal pr create failed for ${branch}: ${err.message}`);
    return false;
  }
}

async function minutesSinceLastDispatch(comments) {
  return minutesSinceStallCycleStart(comments);
}

async function minutesSinceLastHeal(comments) {
  return minutesSinceLastHealInCycle(comments);
}

async function issueHasRecentFinishedNoPr(comments, agentId) {
  const body = comments.map((c) => c.body).join('\n');
  return body.includes(MARKER) && body.includes(agentId) && body.includes('FINISHED') && body.includes(FINISHED_NO_PR_MARKER);
}

async function normalizeIssueLabels(repo, num, labels, dryRun) {
  const labelNames = labels?.map((l) => (typeof l === 'string' ? l : l.name)) ?? [];
  await applyNormalizeExecutorLabels(repo, num, labelNames, dryRun, ghBound);
}

async function triggerActionsExecutorFallback(repo, issueNum, dryRun) {
  if (dryRun) {
    console.log(`DRY_RUN actions executor fallback issue #${issueNum}`);
    return true;
  }
  try {
    await gh([
      'workflow', 'run', 'LiNKdev executor actions',
      '--repo', repo,
      '--ref', 'development',
      '-f', `issue_number=${issueNum}`,
    ]);
    console.log(`auto-heal triggered Actions executor fallback for #${issueNum}`);
    return true;
  } catch (err) {
    console.warn(`actions executor fallback failed for #${issueNum}: ${err.message}`);
    return false;
  }
}

async function redispatchIssue(repo, num, ltsId, reason, dryRun, comments = []) {
  const cycleStart = stallCycleStartAt(comments);
  if (shouldEscalateFinishedNoPr(comments, cycleStart)) {
    await escalateExecutorNoPr(repo, num, ltsId, dryRun, ghBound);
    return;
  }

  const healCount = countFinishedNoPrHeals(comments, cycleStart);
  const useActionsFallback = healCount >= 1;

  const body = useActionsFallback
    ? `${HEAL_MARKER} **Auto-heal:** ${reason} — triggering **GitHub Actions hardened executor** (branch prep + \`autoCreatePR\`).`
    : `${HEAL_MARKER} **Auto-heal:** ${reason} — re-dispatching executor automatically. No Principal action needed.`;
  if (dryRun) {
    console.log(`DRY_RUN heal issue #${num}: ${reason} actions=${useActionsFallback}`);
    return;
  }
  await gh(['issue', 'comment', String(num), '--repo', repo, '--body', body]);

  if (useActionsFallback && (await triggerActionsExecutorFallback(repo, num, dryRun))) {
    console.log(`auto-heal actions fallback issue #${num} (${ltsId}): ${reason}`);
    return;
  }

  await gh(['issue', 'edit', String(num), '--repo', repo, '--remove-label', 'linkdev:ready']).catch(() => {});
  await gh(['issue', 'edit', String(num), '--repo', repo, '--remove-label', 'runtime:cursor']).catch(() => {});
  await gh(['issue', 'edit', String(num), '--repo', repo, '--add-label', 'linkdev:ready']).catch(() => {});
  await gh(['issue', 'edit', String(num), '--repo', repo, '--add-label', 'runtime:cursor']).catch(() => {});
  await gh(['issue', 'edit', String(num), '--repo', repo, '--add-label', 'linkdev:in-progress']).catch(() => {});
  if (process.env.CURSOR_API_KEY) {
    const { spawnSync } = await import('node:child_process');
    const { fileURLToPath } = await import('node:url');
    const { dirname, join } = await import('node:path');
    const script = join(dirname(fileURLToPath(import.meta.url)), 'dispatch-cursor-agent.mjs');
    const r = spawnSync(
      process.execPath,
      [script, '--role', 'executor', '--repo', repo, '--issue', String(num)],
      { encoding: 'utf8', env: { ...process.env, LINKDEV_EXECUTOR_HARDENED: '1' } },
    );
    if (r.status === 0) {
      console.log(`auto-heal direct executor dispatch issue #${num} (${ltsId})`);
    } else {
      console.warn(`auto-heal label toggle only for #${num}: ${r.stderr || r.stdout}`);
    }
  }
  console.log(`auto-heal redispatch issue #${num} (${ltsId}): ${reason}`);
}

async function autoHealStalls(repo, issueMap, activeIssueNumbers, dryRun) {
  let healed = 0;
  if (activeIssueNumbers.size === 0) {
    console.log('auto-heal skip: no active program issues in STATE');
    return 0;
  }

  for (const [ltsId, meta] of Object.entries(issueMap)) {
    const num = meta.github_number;

    const view = ensureGhClient().issueView(repo, num);
    const labels = view.labels?.map((l) => l.name) ?? [];
    const hasMergedPr = await issueHasMergedPr(repo, ltsId, ghBound);
    if (
      shouldSkipFactoryIssue({
        state: view.state,
        labelNames: labels,
        githubNumber: num,
        ltsId,
        activeIssueNumbers,
        hasMergedPr,
      })
    ) {
      continue;
    }
    if (labels.includes('linkdev:principal-stop')) continue;
    const isActive = labels.includes('linkdev:in-progress') || labels.includes('linkdev:ready');
    if (!isActive) continue;
    await normalizeIssueLabels(repo, num, labels, dryRun);
    if (await issueHasOpenPr(repo, ltsId)) continue;

    const comments = view.comments ?? [];
    if (shouldEscalateFinishedNoPr(comments, stallCycleStartAt(comments))) continue;
    if ((await minutesSinceLastHeal(comments)) < HEAL_COOLDOWN_MINUTES) continue;

    const recentFinishedNoPr = comments.some(
      (c) =>
        c.body?.includes(MARKER) &&
        c.body?.includes('FINISHED') &&
        (c.body?.includes(FINISHED_NO_PR_MARKER) || !/\| PR \|/.test(c.body ?? '')),
    );
    const sinceDispatch = await minutesSinceLastDispatch(comments);
    const stallThreshold = recentFinishedNoPr ? FINISHED_NO_PR_MINUTES : STALL_MINUTES;
    if (sinceDispatch === Infinity || sinceDispatch < stallThreshold) continue;

    const reason = recentFinishedNoPr
      ? 'executor FINISHED without opening a PR'
      : `no PR after ${STALL_MINUTES}+ minutes`;
    await redispatchIssue(repo, num, ltsId, reason, dryRun, comments);
    healed += 1;
  }
  return healed;
}

async function healFinishedWithoutPr(repo, issueMap, target, agent, run, dryRun) {
  if (run.status !== 'FINISHED') return false;
  const prUrl = run.git?.branches?.[0]?.prUrl;
  if (prUrl) return false;

  let ltsId = null;
  for (const [id, meta] of Object.entries(issueMap)) {
    if (meta.github_number === target.number) {
      ltsId = id;
      break;
    }
  }
  if (!ltsId) return false;
  if (await issueHasOpenPr(repo, ltsId)) return false;

  const view = ensureGhClient().issueView(repo, target.number);
  const labels = view.labels?.map((l) => l.name) ?? [];
  if (
    shouldSkipFactoryIssue({
      state: view.state,
      labelNames: labels,
      githubNumber: target.number,
      ltsId,
      activeIssueNumbers: new Set([target.number]),
      hasMergedPr: await issueHasMergedPr(repo, ltsId, ghBound),
    })
  ) {
    return false;
  }
  if (labels.includes('linkdev:principal-stop')) return false;
  await normalizeIssueLabels(repo, target.number, labels, dryRun);
  const comments = view.comments ?? [];
  if (shouldEscalateFinishedNoPr(comments, stallCycleStartAt(comments))) {
    await escalateExecutorNoPr(repo, target.number, ltsId, dryRun, ghBound);
    return true;
  }
  if (await issueHasRecentFinishedNoPr(comments, agent.id)) return false;

  const branch = run.git?.branches?.[0]?.branch;
  if (branch && (await tryCreatePrFromBranch(repo, branch, ltsId, target.number, dryRun))) {
    return true;
  }

  const finishedBody = `${FINISHED_NO_PR_MARKER} Executor \`${agent.id}\` finished without a PR (branch \`${branch ?? 'unknown'}\`). Auto-heal will re-dispatch.`;
  if (!dryRun) {
    await gh(['issue', 'comment', String(target.number), '--repo', repo, '--body', finishedBody]);
  }
  await redispatchIssue(
    repo,
    target.number,
    ltsId,
    'executor FINISHED without opening a PR',
    dryRun,
    comments,
  );
  return true;
}

async function loadActiveIssueNumbers(issueMap) {
  const { readFileSync, existsSync } = await import('node:fs');
  const path = 'LiNKdev/factory/STATE.md';
  if (!existsSync(path)) return new Set();
  const text = readFileSync(path, 'utf8');
  const m = text.match(/```json\s*(\{[\s\S]*?\})\s*```/);
  if (!m) return new Set();
  try {
    const state = JSON.parse(m[1]);
    const nums = new Set();
    for (const w of state.active_waves ?? state.waves ?? []) {
      for (const id of w.issue_ids ?? w.issues ?? []) {
        if (typeof id === 'number') nums.add(id);
      }
    }
    for (const [ltsId, row] of Object.entries(state.issues ?? {})) {
      const status = row?.status ?? '';
      if (!['ready', 'in_progress', 'in-progress'].includes(status)) continue;
      const num = issueMap[ltsId]?.github_number;
      if (typeof num === 'number') nums.add(num);
    }
    return nums;
  } catch {
    return new Set();
  }
}

async function main() {
  const args = parseArgs(process.argv);
  ensureGhClient();
  const issueMap = await loadIssueMap();
  const activeIssues = await loadActiveIssueNumbers(issueMap);
  const { map: dispatchAgentMap, finishedAgentIds } = await buildDispatchAgentMap(
    args.repo,
    issueMap,
    activeIssues,
  );
  const list = await cursorApi('/agents?limit=50');
  const items = list.items ?? [];
  let updated = 0;
  let skippedFinished = 0;

  for (const agent of items) {
    if (!agent.name?.startsWith('LiNKdev-')) continue;
    if (!agent.latestRunId) continue;
    if (finishedAgentIds.has(agent.id)) {
      skippedFinished += 1;
      continue;
    }

    const run = await cursorApi(`/agents/${agent.id}/runs/${agent.latestRunId}`);
    let target = parseAgentTarget(agent.name, run, agent, issueMap);
    if (!target) target = dispatchAgentMap.get(agent.id) ?? null;
    if (!target) {
      console.log(`skip unmapped agent ${agent.id} name=${agent.name}`);
      continue;
    }
    if (target.kind === 'pr') {
      target = await resolveTargetFromPr(args.repo, target.number, issueMap);
    }
    const isTerminal = TERMINAL.has(run.status);
    const isActive = run.status === 'RUNNING' || run.status === 'CREATING';

    if (isTerminal && (await recentHasMarker(args.repo, target, agent.id))) {
      continue;
    }

    // Post on terminal always; post on active at most once per hour would need state file — post active every watch cycle is noisy
    // Only post active if no watch comment in last 30 min OR first time — simplify: post if no marker with this run id
    const body = buildWatchBody({ agent, run });
    const shouldPost =
      isTerminal ||
      isActive; // active: will post each cycle — too noisy. Fix: check last comment time

    if (!shouldPost) continue;

    if (isActive) {
      try {
        const json =
          target.kind === 'issue'
            ? JSON.parse(await gh(['issue', 'view', String(target.number), '--repo', args.repo, '--json', 'comments']))
            : { comments: [] };
        const recent = json.comments?.slice(-3) ?? [];
        if (recent.some((c) => c.body?.includes(MARKER) && c.body?.includes(run.status) && c.body?.includes(agent.id))) {
          continue;
        }
      } catch {
        /* post anyway */
      }
    }

    await postComment(args.repo, target, body, args.dryRun);
    await applyTerminalLabels(args.repo, target, run.status, args.dryRun);
    if (isTerminal && run.status === 'FINISHED' && target.kind === 'issue') {
      await healFinishedWithoutPr(args.repo, issueMap, target, agent, run, args.dryRun);
    }
    updated += 1;
    console.log(`updated ${target.kind} #${target.number} agent=${agent.id} status=${run.status}`);
  }

  const healed = await autoHealStalls(args.repo, issueMap, activeIssues, args.dryRun);

  const { notifyPrincipalSlack } = await import('./principal-slack-notify.mjs');
  const slackSent = await notifyPrincipalSlack({
    repo: args.repo,
    issueMap,
    activeIssueNumbers: activeIssues,
    dryRun: args.dryRun,
  });

  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(
      process.env.GITHUB_STEP_SUMMARY,
      `## LiNKdev agent watch\n\nUpdated **${updated}** issue/PR thread(s). Auto-healed **${healed}** stall(s). Slack **${slackSent}** alert(s).\n`,
    );
  }
  console.log(`WATCH_OK updated=${updated} skipped_finished=${skippedFinished} healed=${healed} slack=${slackSent}`);
}

main().catch((err) => {
  console.error(`WATCH_FAIL: ${err.message}`);
  process.exit(1);
});
