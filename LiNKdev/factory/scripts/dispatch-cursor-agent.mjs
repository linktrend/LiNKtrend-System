#!/usr/bin/env node
/**
 * LiNKdev dispatch v2 — launch a Cursor Cloud Agent for a factory role.
 * Node 22+. No npm dependencies (uses global fetch).
 *
 * Usage:
 *   node dispatch-cursor-agent.mjs --role <orchestrator|executor|reviewer|integrator> \
 *     [--repo owner/name] [--issue N] [--pr N] [--branch NAME] [--dry-run]
 */
import { readFileSync, appendFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildAgentRequestBody } from './linkdev-dispatch-payload.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FACTORY_ROOT = join(__dirname, '..');
const API_URL = 'https://api.cursor.com/v1/agents';

const ROLE_DIRS = {
  orchestrator: 'orchestrator',
  executor: 'executor-cursor',
  reviewer: 'reviewer',
  integrator: 'integrator',
};

function parseArgs(argv) {
  const out = {
    role: null,
    repo: process.env.GITHUB_REPOSITORY ?? null,
    issue: null,
    pr: null,
    branch: process.env.LINKDEV_EXECUTOR_BRANCH ?? null,
    hardened: process.env.LINKDEV_EXECUTOR_HARDENED === '1',
    dryRun: false,
  };
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--role') out.role = argv[++i];
    else if (a === '--repo') out.repo = argv[++i];
    else if (a === '--issue') out.issue = Number(argv[++i]);
    else if (a === '--pr') out.pr = Number(argv[++i]);
    else if (a === '--branch') out.branch = argv[++i];
    else if (a === '--dry-run') out.dryRun = true;
    else if (a === '-h' || a === '--help') {
      console.log(
        'Usage: node dispatch-cursor-agent.mjs --role <orchestrator|executor|reviewer|integrator> [--repo owner/name] [--issue N] [--pr N] [--branch NAME] [--dry-run]',
      );
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${a}`);
    }
  }
  if (!out.role || !ROLE_DIRS[out.role]) {
    throw new Error('--role is required (orchestrator|executor|reviewer|integrator)');
  }
  if (!out.repo) {
    throw new Error('--repo or GITHUB_REPOSITORY is required');
  }
  return out;
}

function readRoleMd(role) {
  const dir = ROLE_DIRS[role];
  const path = join(FACTORY_ROOT, 'prompts', dir, 'ROLE.md');
  return readFileSync(path, 'utf8');
}

function buildPrompt({ role, repo, issue, pr, branch }) {
  const roleMd = readRoleMd(role);
  const lines = [
    `You are the LiNKdev **${role}** role for repository **${repo}**.`,
    'Dispatch v2 started you via GitHub Actions and the Cursor Cloud Agents API.',
    'Coordination: GitHub labels + `LiNKdev/factory/STATE.md` (read before acting).',
    '',
  ];
  if (issue) lines.push(`**Issue:** #${issue}`, '');
  if (pr) lines.push(`**Pull request:** #${pr}`, '');
  if (branch) lines.push(`**Working branch (LAW-05):** \`${branch}\` — commit and push here.`, '');
  if (role === 'executor') {
    lines.push(
      '**Mandatory handoff (do not finish until all are true):**',
      '1. Implement the issue spec; push commits to the working branch.',
      '2. Open a PR targeting **`development`** (API `autoCreatePR` may do this — verify on GitHub).',
      '3. Add label **`linkdev:review-ready`** on the PR.',
      '4. Reply with the **PR URL** in your final message.',
      '',
      '**Failure mode:** FINISHED without a PR on GitHub triggers factory auto-heal and stalls the wave.',
      '',
    );
  }
  lines.push('## Role contract (`LiNKdev/factory/prompts/.../ROLE.md)', '', roleMd, '', '---', 'Execute this role now in the repository.');
  return lines.join('\n');
}

async function dispatchAgent(body) {
  const apiKey = process.env.CURSOR_API_KEY;
  if (!apiKey) {
    throw new Error('CURSOR_API_KEY is not set');
  }
  const auth = Buffer.from(`${apiKey}:`, 'utf8').toString('base64');
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    throw new Error(`Cursor API ${res.status}: ${JSON.stringify(json)}`);
  }
  return json;
}

async function main() {
  const args = parseArgs(process.argv);
  const prompt = buildPrompt(args);
  const body = buildAgentRequestBody(prompt, args);

  if (args.dryRun) {
    console.log('DRY_RUN: would POST /v1/agents');
    console.log(JSON.stringify({ role: args.role, repo: args.repo, body }, null, 2));
    process.exit(0);
  }

  const result = await dispatchAgent(body);
  const agent = result?.agent ?? result;
  const run = result?.run;
  const agentId = agent?.id ?? result?.id ?? 'unknown';
  const agentUrl = agent?.url ?? '';
  const runStatus = run?.status ?? 'unknown';
  const runId = run?.id ?? '';
  const payload = {
    agent_id: agentId,
    agent_url: agentUrl,
    run_status: runStatus,
    run_id: runId,
    auto_create_pr: body.autoCreatePR ?? false,
    work_on_branch: body.workOnCurrentBranch ?? false,
    starting_ref: body.repos?.[0]?.startingRef ?? '',
  };
  console.log(`DISPATCH_JSON=${JSON.stringify(payload)}`);
  console.log(`DISPATCH_OK role=${args.role} agent=${agentId} run_status=${runStatus} url=${agentUrl}`);
  if (process.env.GITHUB_OUTPUT) {
    for (const [key, value] of Object.entries(payload)) {
      appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
    }
  }
}

main().catch((err) => {
  console.error(`DISPATCH_FAIL: ${err.message}`);
  process.exit(1);
});

export { buildPrompt, parseArgs };
