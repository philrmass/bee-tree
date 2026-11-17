export const PANGRAM_BONUS = 7;

// NYT rank names and the fraction of the max score needed for each.
export const RANKS = [
  { name: 'Beginner', fraction: 0 },
  { name: 'Good Start', fraction: 0.02 },
  { name: 'Moving Up', fraction: 0.05 },
  { name: 'Good', fraction: 0.08 },
  { name: 'Solid', fraction: 0.15 },
  { name: 'Nice', fraction: 0.25 },
  { name: 'Great', fraction: 0.4 },
  { name: 'Amazing', fraction: 0.5 },
  { name: 'Genius', fraction: 0.7 },
  { name: 'Queen Bee', fraction: 1 },
];

export function isPangram(word, letters) {
  const used = new Set(word);
  return [...letters].every((letter) => used.has(letter));
}

// 4-letter words score 1; longer words score their length; pangrams add 7.
export function wordScore(word, letters) {
  const base = word.length === 4 ? 1 : word.length;
  return base + (isPangram(word, letters) ? PANGRAM_BONUS : 0);
}

export function totalScore(words, letters) {
  return words.reduce((sum, word) => sum + wordScore(word, letters), 0);
}

// Rank thresholds as points, rounded like the NYT.
export function rankThresholds(maxScore) {
  return RANKS.map(({ name, fraction }) => ({
    name,
    min: Math.round(fraction * maxScore),
  }));
}

// The current rank, plus the next one (null at Queen Bee).
export function getRank(score, maxScore) {
  const thresholds = rankThresholds(maxScore);
  let index = 0;
  while (index + 1 < thresholds.length && score >= thresholds[index + 1].min) {
    index++;
  }
  return {
    ...thresholds[index],
    index,
    next: thresholds[index + 1] ?? null,
  };
}
