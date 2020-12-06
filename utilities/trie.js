const fs = require('fs');

function buildTrie(words) {
  return words.reduce((trie, word) => addWord(trie, word), {});
}

function addWord(trie, word) {
  const letters = word.split('');
  let node = trie;

  for (let i = 0; i < letters.length; i++) {
    const letter = letters[i];
    if (!node[letter]) {
      node[letter] = {};
    }
    node = node[letter];
    if (i === letters.length - 1) {
      node.ok = true;
    }
  }

  return { ...trie };
}

function testTrie(trie, input) {
  const node = input.split('').reduce((node, letter) => {
    return node && node[letter];
  }, trie);

  return [node, node && node.ok];
}

exports.buildTrie = buildTrie;
exports.testTrie = testTrie;
