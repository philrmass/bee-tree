export function formatDate(date) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

// ◀ older · date · newer ▶ — steps through saved puzzles (newest first).
export function DateNav({ puzzles, date, base = '/play' }) {
  const index = puzzles?.findIndex((p) => p.date === date) ?? -1;
  const older = index >= 0 ? puzzles[index + 1] : null;
  const newer = index > 0 ? puzzles[index - 1] : null;

  return (
    <div class="date-nav">
      <Arrow to={older} base={base} label="Older puzzle">◀</Arrow>
      <span class="date">{date ? formatDate(date) : ' '}</span>
      <Arrow to={newer} base={base} label="Newer puzzle">▶</Arrow>
    </div>
  );
}

function Arrow({ to, base, label, children }) {
  return to ? (
    <a class="arrow" href={`${base}/${to.date}`} aria-label={label}>
      {children}
    </a>
  ) : (
    <span class="arrow disabled" aria-hidden="true">
      {children}
    </span>
  );
}
