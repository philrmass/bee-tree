const fs = require('fs');

function getListPath(index) {
  return `lists/list${index}.txt`;
}

function getPuzzlePath(index) {
  return `puzzles/puzzle${index}.txt`;
}

function getTriePath(index) {
  return `tries/trie${index}.json`;
}

function saveWords(words, path) {
  console.log('SAVE-WORDS', path);
}

function loadWords(path) {
  const data = fs.readFileSync(path, 'utf8');
  const lines = data.split('\n').map((line) => line.trim());
  const words = lines.filter((line) => line.length > 0);

  return words;
}

function saveTrie(trie, path) {
  try {
    const data = JSON.stringify(trie);
    fs.writeFileSync(path, data);
  } catch (error) {
    console.error('saveTrie', error);
  }
}

function loadTrie(path) {
  try {
    if (fs.existsSync(path)) {
      const data = fs.readFileSync(path, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('loadTrie', error);
  }
}

function removeTrie(path) {
}

exports.getListPath = getListPath;
exports.getPuzzlePath = getPuzzlePath;
exports.getTriePath = getTriePath;
exports.saveWords = saveWords;
exports.loadWords = loadWords;
exports.saveTrie = saveTrie;
exports.loadTrie = loadTrie;
exports.removeTrie = removeTrie;
