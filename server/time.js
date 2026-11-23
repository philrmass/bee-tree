// Time helpers pinned to America/New_York, where the NYT publishes at 3am.
const ZONE = 'America/New_York';
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

const formatter = new Intl.DateTimeFormat('en-US', {
  timeZone: ZONE,
  hourCycle: 'h23',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

function nyParts(ms) {
  const parts = {};
  for (const { type, value } of formatter.formatToParts(new Date(ms))) {
    parts[type] = Number(value);
  }
  return parts;
}

function offsetAt(ms) {
  const p = nyParts(ms);
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(ms / 1000) * 1000;
}

// UTC ms for a New York wall-clock time.
export function nyToUtc(year, month, day, hour, minute) {
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  const first = guess - offsetAt(guess);
  return guess - offsetAt(first);
}

// 'YYYY-MM-DD' for a moment, in New York.
export function nyDate(ms) {
  const p = nyParts(ms);
  return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
}

// The puzzle date the NYT should be showing at a moment: it switches at 3am NY.
export function expectedPuzzleDate(ms) {
  return nyDate(ms - 3 * HOUR);
}

// The next daily run (default 3:15am NY) strictly after `ms`.
export function nextDailyRun(ms, hour = 3, minute = 15) {
  const p = nyParts(ms);
  let run = nyToUtc(p.year, p.month, p.day, hour, minute);
  if (run <= ms) {
    const tomorrow = new Date(Date.UTC(p.year, p.month - 1, p.day + 1));
    run = nyToUtc(tomorrow.getUTCFullYear(), tomorrow.getUTCMonth() + 1, tomorrow.getUTCDate(), hour, minute);
  }
  return run;
}

export { MINUTE, HOUR };
