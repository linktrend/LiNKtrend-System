#!/usr/bin/env node
import {
  countFinishedNoPrHeals,
  FINISHED_NO_PR_MAX_HEALS,
} from './linkdev-factory-escalation.mjs';
import { issueHasMergedPr, shouldSkipFactoryIssue } from './linkdev-issue-terminal.mjs';
import { stallCycleStartAt, stallEventKey } from './linkdev-stall-clock.mjs';

/**
 * LiNKdev — optional Principal Slack alerts via incoming webhook.
 * Called from sync-agent-watch.mjs (GitHub Actions). No-op if LINKDEV_SLACK_WEBHOOK_URL unset.
 *
 * Notifies on:
 * - linkdev:principal-stop (your turn)
 * - linkdev:blocked (factory stuck)
 * - active-wave stall: in-progress/ready, no PR, 15+ min without factory progress
 */
const SLACK_MARKER = '[linkdev-slack-sent]';
const STALL_NOTIFY_MINUTES = 15;
const NOTIFY_COOLDOWN_MINUTES = 60;

async function gh(args) {
  const { spawnSync } = await import('node:child_process');
  const r = spawnSync('gh', args, { encoding: 'utf8' });
  if (r.status !== 0) {
    throw new Error(`gh ${args.join(' ')} failed: ${r.stderr || r.stdout}`);
  }
  return r.stdout;
}

function issueUrl(repo, number) {
  return `https://github.com/${repo}/issues/${number}`;
}

function minutesSince(iso) {
  if (!iso) return Infinity;
  return (Date.now() - new Date(iso).getTime()) / 60000;
}

function recentSlackSent(comments, eventKey) {
  const cycleStart = stallCycleStartAt(comments);
  const cycleStartMs = cycleStart ? new Date(cycleStart).getTime() : 0;
  const hit = [...comments]
    .reverse()
    .find(
      (c) =>
        c.body?.includes(SLACK_MARKER) &&
        c.body?.includes(`event=${eventKey}`) &&
        new Date(c.createdAt).getTime() >= cycleStartMs,
    );
  if (!hit?.createdAt) return false;
  return minutesSince(hit.createdAt) < NOTIFY_COOLDOWN_MINUTES;
}

async function postSlack(text) {
  const url = process.env.LINKDEV_SLACK_WEBHOOK_URL;
  if (!url) return false;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Slack webhook ${res.status}: ${body.slice(0, 200)}`);
  }
  return true;
}

async function recordSlackSent(repo, issueNumber, eventKey, summary, dryRun) {
  const body = `${SLACK_MARKER} event=${eventKey} — ${summary}`;
  if (dryRun) {
    console.log(`DRY_RUN slack record #${issueNumber} ${eventKey}`);
    return;
  }
  await gh(['issue', 'comment', String(issueNumber), '--repo', repo, '--body', body]);
}

async function issueHasOpenPr(repo, ltsId) {
  try {
    const prs = JSON.parse(
      await gh(['pr', 'list', '--repo', repo, '--state', 'open', '--json', 'number,title,headRefName', '--limit', '50']),
    );
    return prs.some((p) => `${p.title}${p.headRefName}`.includes(ltsId));
  } catch {
    return false;
  }
}

function lastStallActivityAt(comments) {
  return stallCycleStartAt(comments);
}

async function refreshIssueComments(repo, number) {
  try {
    const view = JSON.parse(await gh(['issue', 'view', String(number), '--repo', repo, '--json', 'comments']));
    return view.comments ?? [];
  } catch {
    return [];
  }
}

async function notifyIssue(repo, { number, title, ltsId, eventKey, message, comments, dryRun }) {
  if (recentSlackSent(comments, eventKey)) return false;
  // Record marker before Slack post to dedupe parallel watch runs (L-014).
  if (!dryRun) {
    await recordSlackSent(repo, number, eventKey, message.split('\n')[0], dryRun);
    const fresh = await refreshIssueComments(repo, number);
    if (fresh.filter((c) => c.body?.includes(SLACK_MARKER) && c.body?.includes(`event=${eventKey}`)).length > 1) {
      console.log(`slack dedupe skip #${number} event=${eventKey} (parallel marker)`);
      return false;
    }
  }
  const sent = dryRun ? true : await postSlack(message);
  if (!sent) return false;
  if (dryRun) {
    await recordSlackSent(repo, number, eventKey, message.split('\n')[0], dryRun);
  }
  console.log(`slack notify #${number} event=${eventKey}`);
  return true;
}

/**
 * @param {{ repo: string, issueMap: Record<string, { github_number: number, title?: string }>, activeIssueNumbers: Set<number>, dryRun?: boolean }} opts
 * @returns {Promise<number>} count of Slack messages sent
 */
export async function notifyPrincipalSlack(opts) {
  const { repo, issueMap, activeIssueNumbers, dryRun = false } = opts;
  if (!process.env.LINKDEV_SLACK_WEBHOOK_URL && !dryRun) {
    console.log('SLACK_SKIP webhook not configured');
    return 0;
  }

  let sent = 0;

  for (const label of ['linkdev:principal-stop', 'linkdev:blocked']) {
    let items;
    try {
      items = JSON.parse(await gh(['issue', 'list', '--repo', repo, '--state', 'open', '--label', label, '--json', 'number,title,labels,comments', '--limit', '20']));
    } catch {
      continue;
    }
    for (const item of items) {
      const eventKey = label === 'linkdev:principal-stop' ? 'principal_stop' : 'blocked';
      const action =
        label === 'linkdev:principal-stop'
          ? 'Reply *Continue* or *Stop* in Cursor (or ask your LiNKdev agent).'
          : 'Factory is stuck — ask your LiNKdev agent to investigate.';
      const message = [
        label === 'linkdev:principal-stop' ? ':raised_hand: *LiNKdev — your turn*' : ':octagonal_sign: *LiNKdev — blocked*',
        `*${item.title}* (#${item.number})`,
        action,
        issueUrl(repo, item.number),
      ].join('\n');
      if (await notifyIssue(repo, { number: item.number, title: item.title, eventKey, message, comments: item.comments ?? [], dryRun })) {
        sent += 1;
      }
    }
  }

  if (activeIssueNumbers.size === 0) {
    console.log('SLACK_SKIP no active program issues in STATE');
  }

  for (const [ltsId, meta] of Object.entries(issueMap)) {
    const num = meta.github_number;

    const view = JSON.parse(
      await gh(['issue', 'view', String(num), '--repo', repo, '--json', 'title,state,labels,comments']),
    );
    const labels = view.labels?.map((l) => l.name) ?? [];
    const hasMergedPr = await issueHasMergedPr(repo, ltsId, gh);
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
    if (labels.includes('linkdev:blocked') || labels.includes('linkdev:principal-stop')) continue;
    const isActive = labels.includes('linkdev:in-progress') || labels.includes('linkdev:ready');
    if (!isActive) continue;
    if (await issueHasOpenPr(repo, ltsId)) continue;

    const comments = view.comments ?? [];
    const cycleStart = stallCycleStartAt(comments);
    const finishedNoPrCount = countFinishedNoPrHeals(comments, cycleStart);
    if (finishedNoPrCount >= FINISHED_NO_PR_MAX_HEALS) {
      const eventKey = `finished_no_pr_escalation_${num}`;
      const message = [
        ':rotating_light: *LiNKdev — executor failed twice without PR*',
        `*${view.title}* (${ltsId}, #${num})`,
        'Auto-heal paused; issue labeled `linkdev:principal-stop`. Local implementer should open PR.',
        issueUrl(repo, num),
      ].join('\n');
      if (await notifyIssue(repo, { number: num, title: view.title, ltsId, eventKey, message, comments, dryRun })) {
        sent += 1;
        continue;
      }
    }

    const recentFinishedNoPr = comments.some(
      (c) => c.body?.includes('[linkdev-finished-no-pr]') || (c.body?.includes('[linkdev-agent-watch]') && c.body?.includes('FINISHED') && !/\| PR \|/.test(c.body ?? '')),
    );
    const stallThreshold = recentFinishedNoPr ? 0 : STALL_NOTIFY_MINUTES;
    const lastActivity = lastStallActivityAt(comments);
    if (!lastActivity) continue;
    if (minutesSince(lastActivity) < stallThreshold) continue;

    const eventKey = recentFinishedNoPr ? `finished_no_pr_${num}` : stallEventKey(num, comments);
    const message = [
      recentFinishedNoPr ? ':warning: *LiNKdev — executor finished without PR*' : ':hourglass_flowing_sand: *LiNKdev — task stalled*',
      `*${view.title}* (${ltsId}, #${num})`,
      recentFinishedNoPr
        ? 'Cloud executor reported FINISHED but no PR exists. Factory auto-heal is re-dispatching.'
        : `No PR for ${STALL_NOTIFY_MINUTES}+ minutes. Factory auto-heal may retry; no action needed unless this repeats.`,
      issueUrl(repo, num),
    ].join('\n');
    if (await notifyIssue(repo, { number: num, title: view.title, ltsId, eventKey, message, comments, dryRun })) {
      sent += 1;
    }
  }

  console.log(`SLACK_OK sent=${sent}`);
  return sent;
}
