import { findWords, puzzleUpdate } from '../utilities/solver.js';
import { LIST_NAMES } from './config.js';

// Update every list from a puzzle's official answers: nyt only gains words;
// the other lists also lose words they'd find that aren't answers.
export async function addPuzzleToLists(store, tries, puzzle) {
  const results = [];
  for (const name of LIST_NAMES) {
    const words = await store.readList(name);
    const found = findWords(await tries.get(name), puzzle.center, puzzle.outer);
    const change = puzzleUpdate(words, found, puzzle.answers, { trim: name !== 'nyt' });
    const { added, removed, count } = await store.editList(name, change);
    results.push({ name, added, removed, count });
  }
  return results;
}
