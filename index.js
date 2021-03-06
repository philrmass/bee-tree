const { findWords, compareLists, countLetters } = require('./utilities/game.js');
const { get } = require('./utilities/network.js');
const {
  getListPath,
  getPuzzlePath,
  getTriePath,
  saveWords,
  loadWords,
  saveTrie,
  loadTrie,
  removeTrie,
  ask,
} = require('./utilities/input.js');
const { printWords } = require('./utilities/print.js');
const { buildTrie } = require('./utilities/trie.js');

function getTrie(index) {
  let trie = loadTrie(getTriePath(index));
  if (!trie) {
    const words = loadWords(getListPath(index));
    trie = buildTrie(words);
    saveTrie(trie, getTriePath(index));
  }

  return trie;
}

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
  const trie = getTrie(index);
  const found = findWords(trie, game); 

  const time = Date.now() - start;
  console.log(`\n Matched ${found.length} words in ${time} ms`);
  console.log(printWords(found));
} else if (cmd === 'u' && input0) {
  const puzzle = input0;
  index = input1 || index;

  console.log(`Update list with puzzle${puzzle}`);
  const all = loadWords(getPuzzlePath(puzzle));
  const game = all[0];
  const answers = all.slice(1);
  console.log(` Loaded ${game} with ${answers.length} answers`);

  const trie = getTrie(index);
  const found = findWords(trie, game); 
  const time = Date.now() - start;
  console.log(` Tested and got ${found.length} words in ${time} ms`);

  const [common, add, remove] = compareLists(answers, found);
  console.log(`\n Found ${common.length} common words\n${printWords(common)}`);
  console.log(` Found ${add.length} words to add to the list\n${printWords(add)}`);
  console.log(` Found ${remove.length} words to remove from the list\n${printWords(remove)}`);

  if (add.length > 0 || remove.length > 0) {
    ask('\nShould the list be updated? (y to save) ').then((answer) => {
      if (answer === 'y') {
        const words = loadWords(getListPath(index));
        const filtered = words.filter((word) => !remove.includes(word));
        const all = [...filtered, ...add];
        saveWords(all.sort(), getListPath(index));
        removeTrie(getTriePath(index));
        console.log(`Added ${add.length} and removed ${remove.length} words from list${index}`);
      }
    });
  }
} else if (cmd === 'y') {
  console.log("Get yesterday's answers from NY Times");
  get('www.nytimes.com', '/puzzles/spelling-bee').then((data) => {
    console.log(`GOT ${data.length} bytes\n`, data);
    const find = data.indexOf('Answers');
    console.log('FIND', find);
  });
} else if (cmd === 'l') {
  index = input0 || index;

  console.log(`Find longest word in list${index}`);
  const words = loadWords(getListPath(index));
  words.sort((a, b) => b.length - a.length);
  console.log(` Loaded ${words.length} words`);

  const limit = 7;
  const valid = words.filter((word) => countLetters(word) <= limit);
  console.log(` Found ${valid.length} words with ${limit} or fewer letters`);
  const show = 30;
  const print = valid.slice(0, show).reduce((p, w) => p + '  ' + w + '\n', '');
  console.log(` Longest valid words:\n${print}`);
} else {
  console.log(`Huh? [${cmd}, ${input0}, ${input1}]`);
}
