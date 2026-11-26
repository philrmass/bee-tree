// Runs of 2+ consecutive letters, counted at every position they appear
// (overlapping, and more than once per word).
export function countRuns(words, min = 2) {
  const counts = new Map();
  for (const word of words) {
    for (let start = 0; start < word.length; start++) {
      for (let end = start + min; end <= word.length; end++) {
        const run = word.slice(start, end);
        counts.set(run, (counts.get(run) ?? 0) + 1);
      }
    }
  }
  return counts;
}

// Runs of 3+ letters that appear 2+ times, grouped by length (3, 4, 5+), each group
// sorted by count (highest first) then alphabetically. A run is left out when
// a one-letter-longer run containing it has the same count (e.g. "ion" when
// "tion" appears just as often); checking one letter longer is enough, since
// a run's count can only drop as it grows.
export const MIN_RUN = 3;
export const RUN_GROUPS = ['3', '4', '5+'];

export function letterRuns(words) {
  const counts = countRuns(words, MIN_RUN);
  for (const [run, count] of counts) {
    if (count < 2) counts.delete(run);
  }

  const hidden = new Set();
  for (const [run, count] of counts) {
    if (run.length <= MIN_RUN) continue;
    for (const part of [run.slice(0, -1), run.slice(1)]) {
      if (counts.get(part) === count) hidden.add(part);
    }
  }

  const groups = Object.fromEntries(RUN_GROUPS.map((label) => [label, []]));
  for (const [run, count] of counts) {
    if (hidden.has(run)) continue;
    groups[run.length >= 5 ? '5+' : String(run.length)].push({ run, count });
  }
  for (const label of RUN_GROUPS) {
    groups[label].sort((a, b) => b.count - a.count || a.run.localeCompare(b.run));
  }
  return groups;
}

// Percent of answers containing each letter: the center first, then the
// others from most to least used.
export function letterUse(answers, center, outer) {
  const percent = (letter) =>
    answers.length ? Math.round((100 * answers.filter((w) => w.includes(letter)).length) / answers.length) : 0;
  return [center, ...outer]
    .map((letter) => ({ letter, percent: percent(letter) }))
    .sort(
      (a, b) =>
        (b.letter === center) - (a.letter === center) || b.percent - a.percent || a.letter.localeCompare(b.letter),
    );
}

// Equal-width bins over whole-number values, using the smallest "nice" bin
// width that gives at most maxBins bins. Empty bins in between are kept.
const BIN_WIDTHS = [1, 2, 5, 10, 20, 25, 50, 100, 200, 500];

export function histogram(values, maxBins = 10) {
  if (values.length === 0) return { width: 1, bins: [] };
  const min = Math.min(...values);
  const max = Math.max(...values);
  const width =
    BIN_WIDTHS.find((w) => Math.floor(max / w) - Math.floor(min / w) + 1 <= maxBins) ?? BIN_WIDTHS.at(-1);
  const start = Math.floor(min / width) * width;
  const bins = [];
  for (let from = start; from <= max; from += width) {
    bins.push({ from, to: from + width - 1, count: 0 });
  }
  for (const value of values) {
    bins[Math.floor((value - start) / width)].count++;
  }
  return { width, bins };
}
