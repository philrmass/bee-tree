const fs = require('fs');

function getListPath(index) {
  return `lists/list${index}.txt`;
}

function loadWords(path) {
  const data = fs.readFileSync(path, 'utf8');
  const lines = data.split('\n').map((line) => line.trim());
  const words = lines.filter((line) => line.length > 0);

  return words;
}

exports.getListPath = getListPath;
exports.loadWords = loadWords;
