import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildDoneIdSet,
  expandDoneWithAncestors,
  seedDoneAncestorsInState,
} from './linkdev-state-dag.mjs';

const programIssues = {
  'LTS-001': { depends: [], wave: 1, runtime: 'cursor', tier: 'standard' },
  'LTS-010': { depends: ['LTS-001'], wave: 1, runtime: 'cursor', tier: 'standard' },
  'LTS-011': { depends: ['LTS-010'], wave: 4, runtime: 'cursor', tier: 'standard' },
  'LTS-002': { depends: ['LTS-001'], wave: 2, runtime: 'cursor', tier: 'standard' },
};

test('expandDoneWithAncestors infers pruned wave-1 deps', () => {
  const done = expandDoneWithAncestors(new Set(['LTS-011', 'LTS-002']), programIssues);
  assert.ok(done.has('LTS-001'));
  assert.ok(done.has('LTS-010'));
  assert.ok(done.has('LTS-011'));
});

test('seedDoneAncestorsInState writes missing ancestors as done', () => {
  const state = {
    program_id: 'linktrend-system',
    issues: {
      'LTS-011': { status: 'done', runtime: 'cursor', tier: 'standard', depends_on: ['LTS-010'] },
    },
  };
  const changed = seedDoneAncestorsInState(state, programIssues, 'linktrend-system');
  assert.equal(changed, true);
  assert.equal(state.issues['LTS-010'].status, 'done');
  assert.equal(state.issues['LTS-001'].status, 'done');
});

test('buildDoneIdSet blocks re-promotion of inferred LTS-001', () => {
  const state = {
    issues: {
      'LTS-002': { status: 'done', runtime: 'cursor', tier: 'standard', depends_on: ['LTS-001'] },
    },
  };
  const doneIds = buildDoneIdSet(state, programIssues);
  assert.ok(doneIds.has('LTS-001'));
});
