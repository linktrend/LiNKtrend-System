#!/usr/bin/env node
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  isActiveProgramIssue,
  issueIsClosed,
  labelsIndicateDone,
  shouldSkipFactoryIssue,
} from './linkdev-issue-terminal.mjs';

test('labelsIndicateDone includes review-ready and done', () => {
  assert.equal(labelsIndicateDone(['linkdev:done']), true);
  assert.equal(labelsIndicateDone(['linkdev:review-ready', 'tier:standard']), true);
  assert.equal(labelsIndicateDone(['linkdev:in-progress']), false);
});

test('shouldSkipFactoryIssue for closed or merged or inactive', () => {
  const active = new Set([42]);
  assert.equal(
    shouldSkipFactoryIssue({
      state: 'CLOSED',
      labelNames: ['linkdev:in-progress'],
      githubNumber: 20,
      ltsId: 'LTS-001',
      activeIssueNumbers: active,
    }),
    true,
  );
  assert.equal(
    shouldSkipFactoryIssue({
      state: 'OPEN',
      labelNames: ['linkdev:in-progress'],
      githubNumber: 20,
      ltsId: 'LTS-001',
      activeIssueNumbers: active,
      hasMergedPr: true,
    }),
    true,
  );
  assert.equal(
    shouldSkipFactoryIssue({
      state: 'OPEN',
      labelNames: ['linkdev:in-progress'],
      githubNumber: 42,
      ltsId: 'LTS-012',
      activeIssueNumbers: active,
    }),
    false,
  );
  assert.equal(
    shouldSkipFactoryIssue({
      state: 'OPEN',
      labelNames: ['linkdev:in-progress'],
      githubNumber: 42,
      ltsId: 'LTS-012',
      activeIssueNumbers: new Set(),
    }),
    true,
  );
});

test('isActiveProgramIssue requires non-empty active set', () => {
  assert.equal(isActiveProgramIssue(new Set(), 42), false);
  assert.equal(isActiveProgramIssue(new Set([42]), 42), true);
  assert.equal(isActiveProgramIssue(new Set([42]), 20), false);
});

test('issueIsClosed', () => {
  assert.equal(issueIsClosed('CLOSED'), true);
  assert.equal(issueIsClosed('OPEN'), false);
});
