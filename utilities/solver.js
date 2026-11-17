export const MIN_LENGTH = 4;

// All 7 letters of a puzzle, center first.
export function puzzleLetters(center, outer) {
  return [center, ...outer];
}

// Walk the trie using only the puzzle letters; keep words of MIN_LENGTH+
// that contain the center letter. Returns a sorted list.
export function findWords(trie, center, outer) {
  const letters = puzzleLetters(center, outer);
  const found = [];

  function walk(node, prefix, hasCenter) {
    if (node.ok && hasCenter && prefix.length >= MIN_LENGTH) {
      found.push(prefix);
    }
    for (const letter of letters) {
      const next = node[letter];
      if (next) {
        walk(next, prefix + letter, hasCenter || letter === center);
      }
    }
  }

  walk(trie, '', false);
  return found.sort();
}

// Compare the official answers with the words a list produced.
export function compareLists(answers, found) {
  const answerSet = new Set(answers);
  const foundSet = new Set(found);
  return {
    matched: answers.filter((word) => foundSet.has(word)).sort(),
    missed: answers.filter((word) => !foundSet.has(word)).sort(),
    extra: found.filter((word) => !answerSet.has(word)).sort(),
  };
}

// Check a guess in Play. Returns { ok: true } or { ok: false, reason }.
export function checkGuess(guess, { center, outer, answers }, found = []) {
  const word = guess.trim().toLowerCase();
  const letters = new Set(puzzleLetters(center, outer));

  if (word.length < MIN_LENGTH) {
    return { ok: false, reason: 'too-short' };
  }
  if ([...word].some((letter) => !letters.has(letter))) {
    return { ok: false, reason: 'bad-letters' };
  }
  if (!word.includes(center)) {
    return { ok: false, reason: 'missing-center' };
  }
  if (found.includes(word)) {
    return { ok: false, reason: 'already-found' };
  }
  if (!answers.includes(word)) {
    return { ok: false, reason: 'not-in-list' };
  }
  return { ok: true, word };
}
