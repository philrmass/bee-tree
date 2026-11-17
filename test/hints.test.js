import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildHintRows, revealNext } from '../utilities/hints.js';

const answers = ['tint', 'bite', 'mitten', 'mitt', 'ambit', 'emit'];

test('rows group by first letter and length, sorted', () => {
  const rows = buildHintRows(answers);
  assert.deepEqual(rows.map((r) => r.key), ['a5', 'b4', 'e4', 'm4', 'm6', 't4']);
});

test('unfound words show the first letter; found words show in full', () => {
  const [m4] = buildHintRows(answers, ['mitt']).filter((r) => r.key === 'm4');
  assert.deepEqual(m4.words.map((w) => w.pattern), ['mitt']);
  assert.equal(m4.done, true);

  const [m6] = buildHintRows(answers, ['mitt']).filter((r) => r.key === 'm6');
  assert.deepEqual(m6.words.map((w) => w.pattern), ['m_____']);
  assert.equal(m6.foundCount, 0);
  assert.equal(m6.done, false);
});

test('revealNext adds one letter to one unfound word', () => {
  const two = ['bite', 'bits', 'bent'];
  let reveals = {};
  let [row] = buildHintRows(two, ['bits'], reveals);

  reveals = revealNext(row, reveals);
  assert.deepEqual(reveals, { bent: 2 });

  // Keeps revealing the same word until it's fully shown.
  reveals = revealNext(buildHintRows(two, ['bits'], reveals)[0], reveals);
  reveals = revealNext(buildHintRows(two, ['bits'], reveals)[0], reveals);
  assert.deepEqual(reveals, { bent: 4 });

  // Then moves on to the next unfound word.
  reveals = revealNext(buildHintRows(two, ['bits'], reveals)[0], reveals);
  assert.deepEqual(reveals, { bent: 4, bite: 2 });

  [row] = buildHintRows(two, ['bits'], reveals);
  assert.deepEqual(row.words.map((w) => w.pattern), ['bent', 'bi__', 'bits']);
});

test('revealNext returns the same reveals when nothing is left', () => {
  const [row] = buildHintRows(['tint'], ['tint']);
  const reveals = { other: 2 };
  assert.equal(revealNext(row, reveals), reveals);
});
