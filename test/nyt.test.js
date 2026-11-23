import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseGameData, extractPuzzles, toPuzzle } from '../server/nyt.js';

const html = fs.readFileSync(new URL('./fixtures/nyt-2026-11-16.html', import.meta.url), 'utf8');

test('parseGameData finds today, yesterday and past puzzles', () => {
  const data = parseGameData(html);
  assert.equal(data.today.printDate, '2026-11-16');
  assert.equal(data.yesterday.printDate, '2026-11-15');
  assert.ok(Array.isArray(data.pastPuzzles.lastWeek));
});

test('extractPuzzles returns one puzzle per date, sorted', () => {
  const puzzles = extractPuzzles(parseGameData(html));
  const dates = puzzles.map((p) => p.date);
  assert.deepEqual(dates, [
    '2026-11-09', '2026-11-10', '2026-11-11', '2026-11-12',
    '2026-11-13', '2026-11-14', '2026-11-15', '2026-11-16',
  ]);
});

test('toPuzzle maps NYT fields to the stored shape', () => {
  const today = extractPuzzles(parseGameData(html)).at(-1);
  assert.equal(today.center, 'c');
  assert.deepEqual(today.outer, ['a', 'i', 'p', 'r', 'v', 'y']);
  assert.deepEqual(today.pangrams, ['privacy']);
  assert.equal(today.answers.length, 21);
  assert.deepEqual(today.answers, [...today.answers].sort());
  assert.equal(today.editor, 'Sam Ezersky');
});

test('parseGameData throws when the page has no gameData', () => {
  assert.throws(() => parseGameData('<html><body>Log in</body></html>'), /gameData not found/);
});

test('toPuzzle rejects a malformed puzzle', () => {
  assert.throws(() => toPuzzle({ printDate: '2026-11-16', centerLetter: 'c', outerLetters: ['a'], answers: ['x'] }));
});
