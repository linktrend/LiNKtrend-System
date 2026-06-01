#!/usr/bin/env node
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  minutesSinceLastHealInCycle,
  minutesSinceStallCycleStart,
  stallCycleStartAt,
  stallEventKey,
} from './linkdev-stall-clock.mjs';

const t = (iso) => ({ createdAt: iso, body: '' });

test('stall cycle starts at dispatch after wave-ready', () => {
  const comments = [
    { ...t('2026-06-01T03:00:00Z'), body: '[linkdev-dispatch] old cycle' },
    { ...t('2026-06-01T03:23:52Z'), body: '[linkdev-wave-ready] wave 2' },
    { ...t('2026-06-01T03:24:00Z'), body: '[linkdev-dispatch] executor' },
  ];
  assert.equal(stallCycleStartAt(comments), '2026-06-01T03:24:00Z');
});

test('stall cycle ignores pre-heal dispatch comments', () => {
  const comments = [
    { ...t('2026-06-01T03:00:00Z'), body: '[linkdev-dispatch] first' },
    { ...t('2026-06-01T03:10:00Z'), body: '[linkdev-auto-heal] retry' },
    { ...t('2026-06-01T03:10:05Z'), body: '[linkdev-dispatch] redispatch' },
  ];
  assert.equal(stallCycleStartAt(comments), '2026-06-01T03:10:05Z');
});

test('heal cooldown ignores heals from prior cycles', () => {
  const comments = [
    { ...t('2026-06-01T03:00:00Z'), body: '[linkdev-auto-heal] old heal' },
    { ...t('2026-06-01T03:20:00Z'), body: '[linkdev-wave-ready]' },
    { ...t('2026-06-01T03:21:00Z'), body: '[linkdev-dispatch]' },
  ];
  assert.equal(minutesSinceLastHealInCycle(comments), Infinity);
});

test('minutesSinceStallCycleStart is Infinity without dispatch', () => {
  const comments = [{ ...t('2026-06-01T03:00:00Z'), body: '[linkdev-wave-ready]' }];
  assert.equal(minutesSinceStallCycleStart(comments), Infinity);
});

test('stallEventKey includes cycle start suffix', () => {
  const comments = [
    { ...t('2026-06-01T03:24:00Z'), body: '[linkdev-dispatch]' },
  ];
  const key = stallEventKey(18, comments);
  assert.match(key, /^stall_18_2026-06-01T032400Z$/);
});
