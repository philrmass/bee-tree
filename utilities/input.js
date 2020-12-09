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
  try {
    const data = words.join('\n');
    fs.writeFileSync(path, data);
  } catch (error) {
    console.error('saveWords', error);
  }
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
  try {
    fs.unlinkSync(path)
  } catch (error) {
    console.error('removeTrie', error);
  }
}

function ask(question) {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    readline.question(question, (answer) => {
      readline.close();
      resolve(answer);
    });
  });
}

exports.getListPath = getListPath;
exports.getPuzzlePath = getPuzzlePath;
exports.getTriePath = getTriePath;
exports.saveWords = saveWords;
exports.loadWords = loadWords;
exports.saveTrie = saveTrie;
exports.loadTrie = loadTrie;
exports.removeTrie = removeTrie;
exports.ask = ask;
