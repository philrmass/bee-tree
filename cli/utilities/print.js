function printWords(words, start = '  ', columns = 5) {
  words.sort();
  const max = words.reduce((max, word) => word.length > max ? word.length : max, 0);
  const spaced = words.map((word) => word.padEnd(max + 1, ' '));

  const lines = Math.ceil(spaced.length / columns)
  let out = start;
  for (let line = 0; line < lines; line++) {
    for (let i = line; i < spaced.length; i += lines) {
      out += spaced[i];
    }
    out += `\n${start}`;
  }
  return out;
}

exports.printWords = printWords;
