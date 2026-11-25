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

// A word that could ever be a Spelling Bee answer: a–z only, 4+ letters,
// at most 7 different letters.
export function isPossibleWord(word) {
  return /^[a-z]+$/.test(word) && word.length >= MIN_LENGTH && new Set(word).size <= 7;
}

// How adding a puzzle changes a list: add official answers it lacks; if
// `trim`, also remove words the list finds for the puzzle that aren't answers.
export function puzzleUpdate(listWords, found, answers, { trim }) {
  const has = listWords instanceof Set ? listWords : new Set(listWords);
  const answerSet = new Set(answers);
  return {
    add: answers.filter((word) => !has.has(word)).sort(),
    remove: trim ? found.filter((word) => !answerSet.has(word)).sort() : [],
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
