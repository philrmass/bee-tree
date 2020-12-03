const fs = require('fs');

function buildTrie(words) {
  return words.reduce((trie, word) => addWord(trie, word), {});
}

//??? use reduce
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

function checkWithTrie(trie, input) {
  let node = trie;

  for (let i = 0; i < input.length; i++) {
    const letter = input[i];
    node = node[letter];
    if (!node) {
      return [false, false];
    }
  }

  return [true, Boolean(node.ok)];
}

exports.buildTrie = buildTrie;
exports.checkWithTrie = checkWithTrie;
