const { matchLetters } = require('./utilities/game.js');
const { getListPath, loadWords } = require('./utilities/input.js');
const { printWords } = require('./utilities/print.js');
const { buildTrie } = require('./utilities/trie.js');

const index = 3;
//const input = 'iabemnt';
const input = 'ghortuw';
//const input = 'tbilmoy';

const cmd = process.argv[2];
const input0 = process.argv[3];
const input1 = process.argv[4];
const start = Date.now();

console.log('Bee Tree');

if (cmd === 'b') {
  console.log('BUILD');
  //??? delete old trie
  // build and save trie
  const words = loadWords(getListPath(index));
  const trie = buildTrie(words);
} else if (cmd === 'p') {
  console.log('PLAY');
  //??? load, or build and save trie
  const words = loadWords(getListPath(index));
  const trie = buildTrie(words);
  const time1 = Date.now() - start;

  const found = matchLetters(trie, input); 
  console.log(` matched ${found.length} words in ${time1} ms`);
  console.log(printWords(found.sort()));
} else {
  console.log('huh?');
}

/*
const time0 = Date.now() - start0;

const start1 = Date.now();
const found = matchLetters(trie, input); 
const time1 = Date.now() - start1;

console.log(` built trie${index} in ${time0} ms (${trie.length} words)`);
console.log(` matched ${found.length} words in ${time1} ms`);
console.log(printWords(found.sort()));
*/
