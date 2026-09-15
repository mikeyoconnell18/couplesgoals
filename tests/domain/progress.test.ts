import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildProgressSeries,
  normalizeProgress,
  paceForDay,
} from '../../src/domain/progress.ts';

test('normalizes every metric and caps displayed completion', () => {
  for (const metric of ['count', 'currency', 'duration', 'custom'] as const)
    assert.equal(normalizeProgress(metric, 75, 100), 0.75);
  assert.equal(normalizeProgress('boolean', 1, 1), 1);
  assert.equal(normalizeProgress('currency', 150, 100), 1);
  assert.equal(normalizeProgress('count', 5, 0), 0);
});

test('joint actions contribute once, regardless of logger', () => {
  const result = buildProgressSeries(
    [{ id: 'j', metric: 'count', target: 4, participation: 'joint' }],
    [
      { actionId: 'j', userId: 'a', value: 1, localDate: '2026-09-14' },
      { actionId: 'j', userId: 'b', value: 1, localDate: '2026-09-14' },
    ],
    ['2026-09-14'],
    ['a', 'b'],
  );
  assert.deepEqual(result.joint, [50]);
  assert.deepEqual(result.personal, { a: [0], b: [0] });
});

test('parallel actions create independent personal progress', () => {
  const result = buildProgressSeries(
    [
      {
        id: 'p',
        metric: 'duration',
        target: 30,
        participation: 'parallel',
        participantUserIds: ['a', 'b'],
      },
    ],
    [
      { actionId: 'p', userId: 'a', value: 30, localDate: '2026-09-14' },
      { actionId: 'p', userId: 'b', value: 15, localDate: '2026-09-14' },
    ],
    ['2026-09-14'],
    ['a', 'b'],
  );
  assert.deepEqual(result.personal, { a: [100], b: [50] });
});

test('mixed units are averaged only after normalization and accumulate by date', () => {
  const result = buildProgressSeries(
    [
      {
        id: 'money',
        metric: 'currency',
        target: 1000,
        participation: 'individual',
        assignedUserId: 'a',
      },
      {
        id: 'reps',
        metric: 'count',
        target: 10,
        participation: 'individual',
        assignedUserId: 'a',
      },
    ],
    [
      { actionId: 'money', userId: 'a', value: 500, localDate: '2026-09-14' },
      { actionId: 'reps', userId: 'a', value: 10, localDate: '2026-09-15' },
    ],
    ['2026-09-14', '2026-09-15'],
    ['a'],
  );
  assert.deepEqual(result.personal.a, [25, 75]);
});

test('pace is the expected cumulative share of a period', () => {
  assert.equal(paceForDay(0), 14);
  assert.equal(paceForDay(3), 57);
  assert.equal(paceForDay(6), 100);
});
