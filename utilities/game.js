const { testTrie } = require('./trie.js');

function findWords(trie, letters) {
  const found = [];
  const all = letters.split('');
  const center = all[0];
  let queue = [...all];

  while (queue.length > 0) {
    const input = queue.shift();
    const [isValid, isWord] = testTrie(trie, input);

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

function compareLists(list0, list1) {
  list0.sort();
  list1.sort();

  const both = []
  const only0 = [];
  const only1 = [];

  let i0 = 0;
  let i1 = 0;
  let word0 = list0[i0];
  let word1 = list1[i1];

  while (word0 || word1) {
    if (word0 && !word1) {
      only0.push(word0);
      word0 = list0[++i0];
    } else if (word1 && !word0) {
      only1.push(word1);
      word1 = list1[++i1];
    } else {
      if (word0 < word1) {
        only0.push(word0);
        word0 = list0[++i0];
      } else if (word1 < word0) {
        only1.push(word1);
        word1 = list1[++i1];
      } else {
        both.push(word0);
        word0 = list0[++i0];
        word1 = list1[++i1];
      }
    }
  }

  return [both, only0, only1];
}

exports.findWords = findWords;
exports.compareLists = compareLists;
