#!/usr/bin/env node
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  countFinishedNoPrHeals,
  normalizeExecutorLabelPlan,
  shouldEscalateFinishedNoPr,
  FINISHED_NO_PR_MAX_HEALS,
  PRINCIPAL_STOP_MARKER,
} from './linkdev-factory-escalation.mjs';

const t = (iso, body) => ({ createdAt: iso, body });

test('countFinishedNoPrHeals respects cycle start', () => {
  const comments = [
    t('2026-06-01T03:00:00Z', '[linkdev-finished-no-pr] old'),
    t('2026-06-01T04:12:00Z', '[linkdev-wave-ready]'),
    t('2026-06-01T04:13:00Z', '[linkdev-finished-no-pr] first'),
    t('2026-06-01T04:13:30Z', '[linkdev-auto-heal] FINISHED without opening a PR'),
  ];
  assert.equal(countFinishedNoPrHeals(comments, '2026-06-01T04:12:00Z'), 2);
  assert.equal(countFinishedNoPrHeals(comments, '2026-06-01T04:13:30Z'), 1);
});

test('shouldEscalateFinishedNoPr at threshold', () => {
  const cycle = '2026-06-01T04:12:00Z';
  const comments = [
    t('2026-06-01T04:13:00Z', '[linkdev-finished-no-pr]'),
    t('2026-06-01T04:13:30Z', '[linkdev-auto-heal] FINISHED without opening a PR'),
  ];
  assert.equal(shouldEscalateFinishedNoPr(comments, cycle), true);
  assert.equal(
    shouldEscalateFinishedNoPr([...comments, t('2026-06-01T04:14:00Z', PRINCIPAL_STOP_MARKER)], cycle),
    false,
  );
});

test('normalizeExecutorLabelPlan removes ready when in-progress', () => {
  assert.deepEqual(normalizeExecutorLabelPlan(['linkdev:in-progress', 'linkdev:ready']), { removeReady: true });
  assert.deepEqual(normalizeExecutorLabelPlan(['linkdev:ready']), { removeReady: false });
  assert.deepEqual(normalizeExecutorLabelPlan(['linkdev:in-progress']), { removeReady: false });
});

test('FINISHED_NO_PR_MAX_HEALS is 2', () => {
  assert.equal(FINISHED_NO_PR_MAX_HEALS, 2);
});
