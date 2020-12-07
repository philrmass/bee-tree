const { findWords } = require('./utilities/game.js');
const {
  getListPath,
  getTriePath,
  loadWords,
  saveTrie,
  loadTrie,
} = require('./utilities/input.js');
const { printWords } = require('./utilities/print.js');
const { buildTrie } = require('./utilities/trie.js');

console.log('Bee Tree');
const cmd = process.argv[2];
const input0 = process.argv[3];
const input1 = process.argv[4];
const start = Date.now();
let index = 0;

if (cmd === 'b' && input0) {
  index = input0;

  console.log(`Build trie${index}`);
  const words = loadWords(getListPath(index));
  const trie = buildTrie(words);
  saveTrie(trie, getTriePath(index));

  const time = Date.now() - start;
  console.log(` Added ${words.length} words in ${time} ms`);
} else if (cmd === 'p' && input0) {
  const game = input0;
  index = input1 || index;

  console.log(`Play ${game} with trie${index}`);
  let trie = loadTrie(getTriePath(index));
  if (!trie) {
    const words = loadWords(getListPath(index));
    trie = buildTrie(words);
    saveTrie(trie, getTriePath(index));
  }
  const found = findWords(trie, game); 

  const time = Date.now() - start;
  console.log(` Matched ${found.length} words in ${time} ms`);
  console.log(printWords(found, game));
} else if (cmd === 't' && input0) {
  console.log('Test');
} else {
  console.log('huh?');
}
