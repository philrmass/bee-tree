// A trie is nested objects keyed by letter; `ok: true` marks the end of a word.
// Shape matches the old CLI tries so cached JSON stays compatible.

export function buildTrie(words) {
  const trie = {};
  for (const word of words) {
    addWord(trie, word);
  }
  return trie;
}

export function addWord(trie, word) {
  let node = trie;
  for (const letter of word) {
    node[letter] ??= {};
    node = node[letter];
  }
  node.ok = true;
  return trie;
}

export function hasWord(trie, word) {
  let node = trie;
  for (const letter of word) {
    node = node[letter];
    if (!node) {
      return false;
    }
  }
  return node.ok === true;
}
