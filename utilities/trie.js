const fs = require('fs');

function buildTrie(index) {
  const path = `lists/list${index}.txt`;
  const start = Date.now();
  const words = loadList(path);
  const trie = words.reduce((trie, word) => addWord(trie, word), {});
  trie.length = words.length;

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
  const all = letters.split('');
  const center = all[0];
  let queue = [...all];

  while (queue.length > 0) {
    const input = queue.shift();
    const [isValid, isWord] = checkInput(trie, input);

    if (isWord && input.length >= 4 && input.includes(center)) {
        found.push(input);
    }

    if (isValid) {
      const nexts = all.map((letter) => input + letter);
      queue.push(...nexts);
    }
  }

  return found;
}

function checkInput(trie, input) {
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
exports.matchLetters = matchLetters;
