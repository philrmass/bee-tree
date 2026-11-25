import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildTrie } from '../utilities/trie.js';
import { findWords, compareLists, checkGuess, isPossibleWord, puzzleUpdate } from '../utilities/solver.js';

const words = [
  'ambient', 'ambit', 'bite', 'mitt', 'mitten', 'tint',
  'iamb', 'emit', 'beam', // beam lacks the center letter
  'bit', // too short
  'ambits', // uses a letter outside the puzzle
  'intimate',
];
const trie = buildTrie(words);
const center = 'i';
const outer = 'abemnt';

test('findWords keeps 4+ letter words with the center, using only puzzle letters', () => {
  assert.deepEqual(findWords(trie, center, outer), [
    'ambient', 'ambit', 'bite', 'emit', 'iamb', 'intimate', 'mitt', 'mitten', 'tint',
  ]);
});

test('findWords accepts outer letters as an array', () => {
  assert.deepEqual(findWords(trie, center, [...outer]), findWords(trie, center, outer));
});

test('compareLists splits matched, missed and extra', () => {
  const result = compareLists(['ambit', 'bite', 'tibia'], ['bite', 'ambit', 'emit']);
  assert.deepEqual(result, {
    matched: ['ambit', 'bite'],
    missed: ['tibia'],
    extra: ['emit'],
  });
});

test('checkGuess reports why a guess fails', () => {
  const puzzle = { center, outer, answers: ['ambit', 'bite'] };
  assert.deepEqual(checkGuess('bit', puzzle), { ok: false, reason: 'too-short' });
  assert.deepEqual(checkGuess('bites', puzzle), { ok: false, reason: 'bad-letters' });
  assert.deepEqual(checkGuess('beam', puzzle), { ok: false, reason: 'missing-center' });
  assert.deepEqual(checkGuess('emit', puzzle), { ok: false, reason: 'not-in-list' });
  assert.deepEqual(checkGuess('bite', puzzle, ['bite']), { ok: false, reason: 'already-found' });
  assert.deepEqual(checkGuess(' Bite ', puzzle), { ok: true, word: 'bite' });
});

test('isPossibleWord rejects words that can never be answers', () => {
  assert.equal(isPossibleWord('mitten'), true);
  assert.equal(isPossibleWord("don't"), false);
  assert.equal(isPossibleWord('a-ok'), false);
  assert.equal(isPossibleWord('Paris'), false);
  assert.equal(isPossibleWord('bit'), false);
  assert.equal(isPossibleWord('abcdefgh'), false); // 8 different letters
  assert.equal(isPossibleWord('intimate'), true); // 8 letters, 5 different
});

test('puzzleUpdate adds missing answers and optionally trims extras', () => {
  const list = ['ambit', 'bite', 'emit', 'mitt'];
  const found = ['ambit', 'bite', 'emit', 'mitt']; // what the list solves
  const answers = ['ambit', 'bite', 'tibia'];
  assert.deepEqual(puzzleUpdate(list, found, answers, { trim: false }), { add: ['tibia'], remove: [] });
  assert.deepEqual(puzzleUpdate(new Set(list), found, answers, { trim: true }), {
    add: ['tibia'],
    remove: ['emit', 'mitt'],
  });
});
