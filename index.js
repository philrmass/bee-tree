const { findWords } = require('./utilities/game.js');
const {
  getListPath,
  getTriePath,
  loadWords,
  saveTrie,
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
  //??? load the trie, or build and save if undefined
  const words = loadWords(getListPath(index));
  const trie = buildTrie(words);
  saveTrie(trie, getTriePath(index));

  const found = findWords(trie, game); 

  const time = Date.now() - start;
  console.log(` Matched ${found.length} words in ${time} ms`);
  console.log(printWords(found.sort()));
} else {
  console.log('huh?');
}
