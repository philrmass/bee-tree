const fs = require('fs');

function buildTrie(index) {
  const path = `data/list${index}.txt`;
  const start = Date.now();
  const words = loadList(path);
  const trie = words.reduce((trie, word) => addWord(trie, word), {});

  return trie;
}

function loadList(path) {
  const data = fs.readFileSync(path, 'utf8');
  const lines = data.split('\n').map((line) => line.trim());
  const words = lines.filter((line) => line.length > 0);

  return words;
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

function matchLetters(trie, letters) {
  const found = [];
  const queue = [...letters];
  let i = 0;
  const steps = 10;

  while (queue.length > 0 && i < steps) {
    const input = queue.shift();
    const w = isWord(trie, input);
    console.log(`${i}> [${input}] (${w})`);

    // if isWord(trie, input) {
    //   if has first letter
    //   found.push(input);
    // } else if isValid(trie, input) {
    //   queue.push(input + letter) x 7
    // }

    i++;
  }

  return found;
}

function isValid(trie, input) {
}

function isWord(trie, input) {
  return false;
}

// is valid
// is word
// if is word & has first letter, put in found
exports.buildTrie = buildTrie;
exports.matchLetters = matchLetters;
