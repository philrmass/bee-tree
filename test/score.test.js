import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isPangram, wordScore, totalScore, rankThresholds, getRank } from '../utilities/score.js';

const letters = 'iabemnt';

test('isPangram needs every letter', () => {
  assert.equal(isPangram('ambient', letters), true);
  assert.equal(isPangram('ambit', letters), false);
});

test('wordScore: 4 letters = 1, longer = length, pangram +7', () => {
  assert.equal(wordScore('bite', letters), 1);
  assert.equal(wordScore('ambit', letters), 5);
  assert.equal(wordScore('ambient', letters), 14);
});

test('totalScore sums word scores', () => {
  assert.equal(totalScore(['bite', 'ambit', 'ambient'], letters), 20);
  assert.equal(totalScore([], letters), 0);
});

test('rankThresholds rounds each fraction of the max', () => {
  const mins = rankThresholds(100).map((r) => r.min);
  assert.deepEqual(mins, [0, 2, 5, 8, 15, 25, 40, 50, 70, 100]);
  // 0.15 * 37 = 5.55 -> 6, 0.02 * 37 = 0.74 -> 1
  const solid = rankThresholds(37).find((r) => r.name === 'Solid');
  assert.equal(solid.min, 6);
  assert.equal(rankThresholds(37)[1].min, 1);
});

test('getRank returns the current and next rank', () => {
  assert.equal(getRank(0, 100).name, 'Beginner');
  assert.equal(getRank(0, 100).next.name, 'Good Start');
  assert.equal(getRank(69, 100).name, 'Amazing');
  assert.equal(getRank(70, 100).name, 'Genius');
  const queen = getRank(100, 100);
  assert.equal(queen.name, 'Queen Bee');
  assert.equal(queen.next, null);
});
