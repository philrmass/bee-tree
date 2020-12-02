function printWords(words) {
  const max = words.reduce((max, word) => word.length > max ? word.length : max, 0);
  const spaced = words.map((word) => word.padEnd(max + 1, ' '));
  return spaced.reduce((str, word, index) => {
    const end = (index % 5 === 4) ? '\n' : '';
    return str + word + end;
  }, '');
}

exports.printWords = printWords;
