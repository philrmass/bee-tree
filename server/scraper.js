import { fetchPage, parseGameData, extractPuzzles } from './nyt.js';
import { expectedPuzzleDate } from './time.js';

// One scrape: fetch the page and save any puzzles we don't have yet.
// Throws if the page fails, or if it doesn't yet show today's puzzle.
export function createScraper(store, { fetchHtml = fetchPage, now = Date.now } = {}) {
  return async function scrape() {
    const html = await fetchHtml();
    const puzzles = extractPuzzles(parseGameData(html));

    const have = new Set(await store.puzzleDates());
    const fresh = puzzles.filter((p) => !have.has(p.date));
    for (const puzzle of fresh) {
      await store.savePuzzle(puzzle);
    }

    const latest = puzzles.at(-1)?.date;
    const expected = expectedPuzzleDate(now());
    const result = { saved: fresh.map((p) => p.date), latest };
    if (!latest || latest < expected) {
      const error = new Error(`page shows ${latest}, expected ${expected}`);
      error.result = result;
      throw error;
    }
    return result;
  };
}
