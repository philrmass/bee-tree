const { buildTrie, matchLetters } = require('./utilities/trie.js');
const { printWords } = require('./utilities/print.js');

console.log('Bee Tree');
const index = 3;
const input = 'iabemnt';

const start0 = Date.now();
const trie = buildTrie(index);
const time0 = Date.now() - start0;

const start1 = Date.now();
const found = matchLetters(trie, input); 
const time1 = Date.now() - start1;

console.log(` built trie${index} in ${time0} ms (${trie.length} words)`);
console.log(` matched ${found.length} words in ${time1} ms`);
console.log(printWords(found));
