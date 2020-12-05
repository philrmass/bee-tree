const fs = require('fs');

function getListPath(index) {
  return `lists/list${index}.txt`;
}

function getTriePath(index) {
  return `tries/trie${index}.json`;
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

exports.getListPath = getListPath;
exports.getTriePath = getTriePath;
exports.loadWords = loadWords;
exports.saveTrie = saveTrie;
exports.loadTrie = loadTrie;
