// Hint rows: one row per (first letter, length) of the answers.
// `reveals` maps an unfound word to how many of its letters are shown (min 1,
// the first letter is always shown). It's plain data so Play can persist it.

export function rowKey(letter, length) {
  return `${letter}${length}`;
}

export function buildHintRows(answers, found = [], reveals = {}) {
  const foundSet = new Set(found);
  const rows = new Map();

  for (const word of [...answers].sort()) {
    const key = rowKey(word[0], word.length);
    if (!rows.has(key)) {
      rows.set(key, { key, letter: word[0], length: word.length, words: [] });
    }
    const isFound = foundSet.has(word);
    const shown = isFound ? word.length : Math.max(1, reveals[word] ?? 1);
    rows.get(key).words.push({
      word,
      found: isFound,
      shown,
      pattern: word.slice(0, shown) + '_'.repeat(word.length - shown),
    });
  }

  return [...rows.values()]
    .map((row) => {
      const foundCount = row.words.filter((w) => w.found).length;
      return {
        ...row,
        foundCount,
        total: row.words.length,
        done: foundCount === row.words.length,
      };
    })
    .sort((a, b) => a.letter.localeCompare(b.letter) || a.length - b.length);
}

// Reveal one more letter in a row: keep going on the most-revealed unfound
// word (alphabetical tiebreak) until it's fully shown, then move to the next.
// Returns new reveals, or the same object if nothing is left to reveal.
export function revealNext(row, reveals = {}) {
  const candidates = row.words.filter((w) => !w.found && w.shown < w.word.length);
  if (candidates.length === 0) {
    return reveals;
  }
  const target = candidates.reduce((best, w) => (w.shown > best.shown ? w : best));
  return { ...reveals, [target.word]: target.shown + 1 };
}
