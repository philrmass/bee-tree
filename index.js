const { buildTrie, matchLetters } = require('./utilities/trie.js');

console.log('Bee Tree');

const index = 0;
const start0 = Date.now();
const trie = buildTrie(index);
const json = JSON.stringify(trie);
console.log(`build (${Date.now() - start0}) [${json.length}]`);

const input = 'iabemnt';
const start1 = Date.now();
const found = matchLetters(trie, input); 
console.log(`match t=${Date.now() - start1} [${found}]`);
