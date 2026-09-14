import test from 'node:test';
import assert from 'node:assert/strict';
import {
  dailyCompletion,
  periodCompletion,
} from '../../src/domain/completion.ts';
test('daily completion is idempotently capped', () =>
  assert.equal(
    dailyCompletion(
      [
        { localDate: '2026-09-14', value: 1 },
        { localDate: '2026-09-14', value: 1 },
      ],
      '2026-09-14',
    ),
    1,
  ));
test('weekly completion includes both period boundaries', () =>
  assert.deepEqual(
    periodCompletion(
      [
        { localDate: '2026-09-14', value: 1 },
        { localDate: '2026-09-20', value: 2 },
        { localDate: '2026-09-21', value: 5 },
      ],
      '2026-09-14',
      '2026-09-20',
      3,
    ),
    { progress: 3, target: 3, ratio: 1, complete: true },
  ));
