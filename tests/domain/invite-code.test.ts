import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeInviteCode } from '../../src/domain/invite-code.ts';
test('invite codes are case and separator insensitive', () =>
  assert.equal(normalizeInviteCode(' ab-cd 12! '), 'ABCD12'));
test('invite codes are limited to eight characters', () =>
  assert.equal(normalizeInviteCode('abcdefghijk'), 'ABCDEFGH'));
