import test from 'node:test';
import assert from 'node:assert/strict';
import { reconcileConsequences } from '../../src/domain/consequence-engine.ts';

const rule = {
  id: 'rule',
  goalId: 'goal',
  title: 'Cook dinner',
  category: 'service',
  trigger: 'period_miss' as const,
  active: true,
};
const period = {
  key: '2026-W37',
  endedAt: new Date('2026-09-13T23:59:59Z'),
  progress: 2,
  target: 4,
  responsibleUserId: 'a',
  beneficiaryUserId: 'b',
};
test('creates a consequence only for a closed missed period', () => {
  assert.equal(
    reconcileConsequences(
      [rule],
      [period],
      new Set(),
      new Date('2026-09-14T00:00:00Z'),
    ).length,
    1,
  );
  assert.equal(
    reconcileConsequences(
      [rule],
      [period],
      new Set(),
      new Date('2026-09-13T12:00:00Z'),
    ).length,
    0,
  );
});
test('never emits an existing obligation twice', () => {
  assert.equal(
    reconcileConsequences(
      [rule],
      [period],
      new Set(['rule:2026-W37']),
      new Date('2026-09-14T00:00:00Z'),
    ).length,
    0,
  );
});
