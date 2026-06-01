#!/usr/bin/env node
/**
 * LiNKdev — optional Principal Slack alerts via incoming webhook.
 * Called from sync-agent-watch.mjs (GitHub Actions). No-op if LINKDEV_SLACK_WEBHOOK_URL unset.
 *
 * Notifies on:
 * - linkdev:principal-stop (your turn)
 * - linkdev:blocked (factory stuck)
 * - active-wave stall: in-progress/ready, no PR, 30+ min without factory progress
 */
const SLACK_MARKER = '[linkdev-slack-sent]';
const STALL_NOTIFY_MINUTES = 30;
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
  const hit = [...comments].reverse().find((c) => c.body?.includes(SLACK_MARKER) && c.body?.includes(`event=${eventKey}`));
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

function lastFactoryActivityAt(comments) {
  let latest = 0;
  for (const c of comments) {
    if (!c.body?.match(/\[linkdev-(dispatch|agent-watch|auto-heal)\]/)) continue;
    const t = new Date(c.createdAt).getTime();
    if (t > latest) latest = t;
  }
  return latest ? new Date(latest).toISOString() : null;
}

async function notifyIssue(repo, { number, title, ltsId, eventKey, message, comments, dryRun }) {
  if (recentSlackSent(comments, eventKey)) return false;
  const sent = dryRun ? true : await postSlack(message);
  if (!sent) return false;
  await recordSlackSent(repo, number, eventKey, message.split('\n')[0], dryRun);
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

  for (const [ltsId, meta] of Object.entries(issueMap)) {
    const num = meta.github_number;
    if (activeIssueNumbers.size > 0 && !activeIssueNumbers.has(num)) continue;

    const view = JSON.parse(
      await gh(['issue', 'view', String(num), '--repo', repo, '--json', 'title,labels,comments']),
    );
    const labels = view.labels?.map((l) => l.name) ?? [];
    if (labels.includes('linkdev:review-ready') || labels.includes('linkdev:done')) continue;
    if (labels.includes('linkdev:blocked') || labels.includes('linkdev:principal-stop')) continue;
    if (!labels.includes('linkdev:in-progress') && !labels.includes('linkdev:ready')) continue;
    if (await issueHasOpenPr(repo, ltsId)) continue;

    const comments = view.comments ?? [];
    const lastActivity = lastFactoryActivityAt(comments);
    if (minutesSince(lastActivity) < STALL_NOTIFY_MINUTES) continue;

    const eventKey = `stall_${num}`;
    const message = [
      ':hourglass_flowing_sand: *LiNKdev — task stalled*',
      `*${view.title}* (${ltsId}, #${num})`,
      `No PR for ${STALL_NOTIFY_MINUTES}+ minutes. Factory auto-heal may retry; no action needed unless this repeats.`,
      issueUrl(repo, num),
    ].join('\n');
    if (await notifyIssue(repo, { number: num, title: view.title, ltsId, eventKey, message, comments, dryRun })) {
      sent += 1;
    }
  }

  console.log(`SLACK_OK sent=${sent}`);
  return sent;
}
