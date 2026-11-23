export const NYT_URL = 'https://www.nytimes.com/puzzles/spelling-bee';

export async function fetchPage(fetchImpl = fetch) {
  const response = await fetchImpl(NYT_URL);
  if (!response.ok) {
    throw new Error(`NYT responded ${response.status}`);
  }
  return response.text();
}

// Pull the `window.gameData = {...}` object out of the page HTML.
export function parseGameData(html) {
  const marker = html.indexOf('window.gameData');
  if (marker === -1) {
    throw new Error('gameData not found in page');
  }
  const start = html.indexOf('{', marker);
  const scriptEnd = html.indexOf('</script>', start);
  const end = html.lastIndexOf('}', scriptEnd === -1 ? html.length : scriptEnd);
  if (start === -1 || end <= start) {
    throw new Error('gameData object is malformed');
  }
  return JSON.parse(html.slice(start, end + 1));
}

// NYT puzzle object -> our stored shape.
export function toPuzzle(raw) {
  const { printDate, centerLetter, outerLetters, pangrams, answers, id, editor } = raw;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(printDate) || !centerLetter || outerLetters?.length !== 6 || !answers?.length) {
    throw new Error(`unexpected puzzle shape for ${printDate}`);
  }
  return {
    date: printDate,
    center: centerLetter,
    outer: [...outerLetters].sort(),
    pangrams: [...pangrams].sort(),
    answers: [...answers].sort(),
    id,
    editor,
  };
}

// Every puzzle the page carries (today, yesterday, this week, last week), by date.
export function extractPuzzles(gameData) {
  const past = gameData.pastPuzzles ?? {};
  const raws = [
    gameData.today,
    gameData.yesterday,
    past.today,
    past.yesterday,
    ...(past.thisWeek ?? []),
    ...(past.lastWeek ?? []),
  ].filter(Boolean);

  const byDate = new Map();
  for (const raw of raws) {
    const puzzle = toPuzzle(raw);
    byDate.set(puzzle.date, puzzle);
  }
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}
