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

// Runs that appear 2+ times, grouped by length (2, 3, 4, 5+), each group
// sorted by count (highest first) then alphabetically. A run is left out when
// a one-letter-longer run containing it has the same count (e.g. "ion" when
// "tion" appears just as often); checking one letter longer is enough, since
// a run's count can only drop as it grows.
export const RUN_GROUPS = ['2', '3', '4', '5+'];

export function letterRuns(words) {
  const counts = countRuns(words);
  for (const [run, count] of counts) {
    if (count < 2) counts.delete(run);
  }

  const hidden = new Set();
  for (const [run, count] of counts) {
    if (run.length < 3) continue;
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
