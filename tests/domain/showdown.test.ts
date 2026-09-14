import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateShowdown } from '../../src/domain/showdown.ts';

test('showdown remains open until the week closes', () => {
  const result = calculateShowdown(
    'a',
    'b',
    [{ userId: 'a', value: 4 }],
    new Date('2026-09-20T23:59:59Z'),
    new Date('2026-09-20T12:00:00Z'),
  );
  assert.equal(result.finalized, false);
  assert.equal(result.winnerId, undefined);
});
test('showdown calculates a winner and loser after close', () => {
  const result = calculateShowdown(
    'a',
    'b',
    [
      { userId: 'a', value: 4 },
      { userId: 'b', value: 2 },
    ],
    new Date('2026-09-20T23:59:59Z'),
    new Date('2026-09-21T00:00:00Z'),
  );
  assert.equal(result.winnerId, 'a');
  assert.equal(result.loserId, 'b');
  assert.equal(result.tied, false);
});
test('showdown produces no winner for a tie', () => {
  const result = calculateShowdown(
    'a',
    'b',
    [
      { userId: 'a', value: 2 },
      { userId: 'b', value: 2 },
    ],
    new Date('2026-09-20T23:59:59Z'),
    new Date('2026-09-21T00:00:00Z'),
  );
  assert.equal(result.tied, true);
  assert.equal(result.winnerId, undefined);
});
