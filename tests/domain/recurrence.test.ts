import test from 'node:test';
import assert from 'node:assert/strict';
import { isActionDue } from '../../src/domain/recurrence.ts';

test('daily action honors inclusive dates in couple time zone', () => {
  const action = { cadence: 'daily' as const, startDate: '2026-09-14', endDate: '2026-09-14' };
  assert.equal(isActionDue(action, new Date('2026-09-15T02:00:00Z'), 'America/New_York'), true);
  assert.equal(isActionDue(action, new Date('2026-09-15T05:00:00Z'), 'America/New_York'), false);
});

test('selected weekday is evaluated in couple time zone', () => {
  assert.equal(isActionDue({ cadence: 'weekdays', selectedWeekdays: [1], startDate: '2026-09-01' }, new Date('2026-09-15T02:00:00Z'), 'America/New_York'), true);
});
