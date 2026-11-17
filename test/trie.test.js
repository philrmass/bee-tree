import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildTrie, addWord, hasWord } from '../utilities/trie.js';

test('buildTrie stores words with ok markers', () => {
  const trie = buildTrie(['an', 'ant']);
  assert.deepEqual(trie, { a: { n: { ok: true, t: { ok: true } } } });
});

test('hasWord distinguishes words from prefixes', () => {
  const trie = buildTrie(['bee', 'beetle']);
  assert.equal(hasWord(trie, 'bee'), true);
  assert.equal(hasWord(trie, 'beetle'), true);
  assert.equal(hasWord(trie, 'beet'), false);
  assert.equal(hasWord(trie, 'bat'), false);
  assert.equal(hasWord(trie, ''), false);
});

test('addWord mutates and returns the trie', () => {
  const trie = buildTrie(['tree']);
  assert.equal(addWord(trie, 'trees'), trie);
  assert.equal(hasWord(trie, 'trees'), true);
});
