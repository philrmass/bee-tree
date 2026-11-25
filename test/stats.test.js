import { test } from 'node:test';
import assert from 'node:assert/strict';
import { countRuns, letterRuns } from '../utilities/stats.js';

test('countRuns counts every position, overlapping and repeated in a word', () => {
  const counts = countRuns(['banana']);
  assert.equal(counts.get('an'), 2);
  assert.equal(counts.get('ana'), 2);
  assert.equal(counts.get('na'), 2);
  assert.equal(counts.get('ba'), 1);
  assert.equal(counts.get('a'), undefined);
});

test('letterRuns keeps runs seen 2+ times and hides ones a longer run covers', () => {
  const groups = letterRuns(['nation', 'motion', 'lotion', 'onto']);
  // "tion" x3 hides "tio", "ion", "ti", "io" (all x3); "otion" x2 hides
  // "otio", "oti", "ot" (all x2); "on" x4 stays since nothing longer has 4.
  assert.deepEqual(groups['5+'], [{ run: 'otion', count: 2 }]);
  assert.deepEqual(groups['4'], [{ run: 'tion', count: 3 }]);
  assert.deepEqual(groups['3'], []);
  assert.deepEqual(groups['2'], [{ run: 'on', count: 4 }]);
});
