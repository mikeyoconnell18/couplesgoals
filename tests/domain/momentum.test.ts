import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateMomentum, extendsMomentumStreak } from '../../src/domain/momentum.ts';

test('normalizes and caps action progress', () => assert.equal(calculateMomentum([
  { id: 'a', progress: 5, target: 4, contributesToMomentum: true },
  { id: 'b', progress: 1, target: 2, contributesToMomentum: true },
]), 75));

test('excludes future and opted-out actions', () => assert.equal(calculateMomentum([
  { id: 'active', progress: 1, target: 2, contributesToMomentum: true },
  { id: 'future', progress: 0, target: 10, contributesToMomentum: true, occursInFuture: true },
  { id: 'optional', progress: 0, target: 10, contributesToMomentum: false },
]), 50));

test('does not double-count a competition based on an included action', () => assert.equal(calculateMomentum([
  { id: 'workout', progress: 3, target: 4, contributesToMomentum: true },
  { id: 'competition', competitionSourceActionId: 'workout', progress: 1, target: 4, contributesToMomentum: true },
]), 75));

test('uses the 70 percent streak threshold', () => { assert.equal(extendsMomentumStreak(70), true); assert.equal(extendsMomentumStreak(69), false); });
