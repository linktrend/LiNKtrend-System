#!/usr/bin/env node
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  agentDisplayName,
  agentOptions,
  buildAgentRequestBody,
  issueBranchName,
  isIncompleteExecutorFinish,
  repoPayload,
} from './linkdev-dispatch-payload.mjs';

test('issueBranchName derives LAW-05 branch from title', () => {
  assert.equal(
    issueBranchName('LTS-005', 'LTS-005: Admin fleet LiNKbots and troubleshooting surfaces'),
    'issue/LTS-005-admin-fleet-linkbots-and-troubleshooting-surface',
  );
});

test('executor agentOptions sets autoCreatePR and workOnCurrentBranch with branch', () => {
  const opts = agentOptions({ role: 'executor', repo: 'linktrend/LiNKtrend-System', branch: 'issue/LTS-003-traces' });
  assert.equal(opts.autoCreatePR, true);
  assert.equal(opts.workOnCurrentBranch, true);
  assert.equal(opts.mode, 'agent');
});

test('reviewer with pr uses workOnCurrentBranch', () => {
  const opts = agentOptions({ role: 'reviewer', repo: 'linktrend/LiNKtrend-System', pr: 57 });
  assert.equal(opts.workOnCurrentBranch, true);
  assert.equal(opts.autoCreatePR, undefined);
});

test('buildAgentRequestBody includes autoCreatePR for executor', () => {
  const body = buildAgentRequestBody('do work', {
    role: 'executor',
    repo: 'linktrend/LiNKtrend-System',
    issue: 19,
    branch: 'issue/LTS-003-client-traces',
  });
  assert.equal(body.autoCreatePR, true);
  assert.equal(body.repos[0].startingRef, 'issue/LTS-003-client-traces');
  assert.match(body.name, /LiNKdev-executor-issue-19/);
});

test('repoPayload uses development when no branch or pr', () => {
  const repos = repoPayload({ role: 'orchestrator', repo: 'linktrend/LiNKtrend-System' });
  assert.equal(repos[0].startingRef, 'development');
});

test('isIncompleteExecutorFinish when FINISHED without prUrl', () => {
  assert.equal(isIncompleteExecutorFinish('executor', { status: 'FINISHED', git: { branches: [{}] } }), true);
  assert.equal(
    isIncompleteExecutorFinish('executor', {
      status: 'FINISHED',
      git: { branches: [{ prUrl: 'https://github.com/x/y/pull/1' }] },
    }),
    false,
  );
  assert.equal(isIncompleteExecutorFinish('reviewer', { status: 'FINISHED', git: { branches: [{}] } }), false);
});

test('agentDisplayName encodes issue number', () => {
  assert.equal(
    agentDisplayName({ role: 'executor', repo: 'linktrend/LiNKtrend-System', issue: 17 }),
    'LiNKdev-executor-issue-17-LiNKtrend-System',
  );
});
