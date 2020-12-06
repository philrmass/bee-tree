function printWords(words, game) {
  words.sort();
  const max = words.reduce((max, word) => word.length > max ? word.length : max, 0);
  const spaced = words.map((word) => word.padEnd(max + 1, ' '));

  const init = 7;
  let lines = init;
  const root = Math.sqrt(words.length);
  if (root > init) {
    lines = Math.ceil(words.length / init);
  }

  let out = '';
  for (let line = 0; line < lines; line++) {
    for (let i = line; i < spaced.length; i += lines) {
      out += spaced[i];
    }
    out += '\n';
  }
  return out;
}

exports.printWords = printWords;
