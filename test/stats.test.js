import { test } from 'node:test';
import assert from 'node:assert/strict';
import { countRuns, letterRuns, letterUse, histogram } from '../utilities/stats.js';

test('countRuns counts every position, overlapping and repeated in a word', () => {
  const counts = countRuns(['banana']);
  assert.equal(counts.get('an'), 2);
  assert.equal(counts.get('ana'), 2);
  assert.equal(counts.get('na'), 2);
  assert.equal(counts.get('ba'), 1);
  assert.equal(counts.get('a'), undefined);
});

test('letterRuns keeps 3+ letter runs seen 2+ times and hides ones a longer run covers', () => {
  const groups = letterRuns(['nation', 'motion', 'lotion', 'onto']);
  // Only 3+ letters. "tion" x3 hides "tio" and "ion" (x3); "otion" x2
  // hides "otio" and "oti" (x2).
  assert.deepEqual(Object.keys(groups), ['3', '4', '5+']);
  assert.deepEqual(groups['5+'], [{ run: 'otion', count: 2 }]);
  assert.deepEqual(groups['4'], [{ run: 'tion', count: 3 }]);
  assert.deepEqual(groups['3'], []);
});

test('letterUse gives percents with the center first, then most used', () => {
  const use = letterUse(['abcd', 'abce', 'abde', 'acef'], 'a', 'bcdefg');
  assert.deepEqual(use, [
    { letter: 'a', percent: 100 },
    { letter: 'b', percent: 75 },
    { letter: 'c', percent: 75 },
    { letter: 'e', percent: 75 },
    { letter: 'd', percent: 50 },
    { letter: 'f', percent: 25 },
    { letter: 'g', percent: 0 },
  ]);
});

test('histogram picks a nice bin width and keeps empty bins', () => {
  const { width, bins } = histogram([21, 23, 38, 44, 45, 67]);
  assert.equal(width, 5);
  assert.equal(bins.length, 10);
  assert.deepEqual(bins[0], { from: 20, to: 24, count: 2 });
  assert.deepEqual(bins[3], { from: 35, to: 39, count: 1 });
  assert.equal(bins[2].count, 0);
  assert.deepEqual(bins.at(-1), { from: 65, to: 69, count: 1 });
  assert.deepEqual(histogram([]), { width: 1, bins: [] });
});
