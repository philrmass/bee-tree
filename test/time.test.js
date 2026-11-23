import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nyDate, nyToUtc, expectedPuzzleDate, nextDailyRun } from '../server/time.js';
import { nextRunAfter } from '../server/scheduler.js';

const iso = (ms) => new Date(ms).toISOString();

test('nyToUtc handles standard and daylight time', () => {
  assert.equal(iso(nyToUtc(2026, 1, 15, 3, 15)), '2026-01-15T08:15:00.000Z'); // EST, UTC-5
  assert.equal(iso(nyToUtc(2026, 7, 15, 3, 15)), '2026-07-15T07:15:00.000Z'); // EDT, UTC-4
});

test('nyDate uses the New York calendar day', () => {
  assert.equal(nyDate(Date.parse('2026-11-17T03:00:00Z')), '2026-11-16'); // 10pm NY
  assert.equal(nyDate(Date.parse('2026-11-17T06:00:00Z')), '2026-11-17'); // 1am NY
});

test('expectedPuzzleDate switches at 3am New York', () => {
  assert.equal(expectedPuzzleDate(Date.parse('2026-11-17T07:59:00Z')), '2026-11-16'); // 2:59am
  assert.equal(expectedPuzzleDate(Date.parse('2026-11-17T08:00:00Z')), '2026-11-17'); // 3:00am
});

test('nextDailyRun is the next 3:15am New York', () => {
  // 1am NY -> 3:15am same day
  assert.equal(iso(nextDailyRun(Date.parse('2026-11-17T06:00:00Z'))), '2026-11-17T08:15:00.000Z');
  // exactly 3:15am -> tomorrow
  assert.equal(iso(nextDailyRun(Date.parse('2026-11-17T08:15:00Z'))), '2026-11-18T08:15:00.000Z');
  // across a month end
  assert.equal(iso(nextDailyRun(Date.parse('2026-11-30T12:00:00Z'))), '2026-12-01T08:15:00.000Z');
});

test('nextDailyRun crosses DST changes', () => {
  // DST ends Sun 2026-11-01: Saturday noon EDT -> Sunday 3:15am EST
  assert.equal(iso(nextDailyRun(Date.parse('2026-10-31T16:00:00Z'))), '2026-11-01T08:15:00.000Z');
  // DST starts Sun 2026-03-08: Saturday noon EST -> Sunday 3:15am EDT
  assert.equal(iso(nextDailyRun(Date.parse('2026-03-07T17:00:00Z'))), '2026-03-08T07:15:00.000Z');
});

test('nextRunAfter backs off 5, 15, 30, 60 min, then hourly, capped at the daily run', () => {
  const now = Date.parse('2026-11-17T12:00:00Z'); // 7am NY
  const minutes = (n) => (nextRunAfter(now, n) - now) / 60000;
  assert.deepEqual([1, 2, 3, 4, 5, 9].map(minutes), [5, 15, 30, 60, 60, 60]);
  assert.equal(iso(nextRunAfter(now, 0)), '2026-11-18T08:15:00.000Z');

  const late = Date.parse('2026-11-18T08:00:00Z'); // 3:00am NY, daily run in 15 min
  assert.equal(iso(nextRunAfter(late, 4)), '2026-11-18T08:15:00.000Z');
});
