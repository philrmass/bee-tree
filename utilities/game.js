const { checkWithTrie } = require('./trie.js');

function matchLetters(trie, letters) {
  const found = [];
  const all = letters.split('');
  const center = all[0];
  let queue = [...all];

  while (queue.length > 0) {
    const input = queue.shift();
    const [isValid, isWord] = checkWithTrie(trie, input);

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

exports.matchLetters = matchLetters;
