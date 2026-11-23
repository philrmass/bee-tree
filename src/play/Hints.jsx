// A collapsible section (closed by default) with one row per first
// letter × length: found words, then blanks.
// Unfound words are ordered by how much is revealed, not alphabetically,
// so their position doesn't give anything away.
export function Hints({ rows, found, total, onShow }) {
  return (
    <details class="section toggle">
      <summary>Hints</summary>
      <p class="hint-count">
        Found {found} of {total} words
      </p>
      <div class="hint-rows">
        {rows.map((row) => {
          const found = row.words.filter((w) => w.found);
          const unfound = row.words.filter((w) => !w.found).sort((a, b) => b.shown - a.shown);
          const canShow = unfound.some((w) => w.shown < w.word.length);
          return (
            <div key={row.key} class={`hint-row${row.done ? ' done' : ''}`}>
              <span class="hint-key">
                {row.letter.toUpperCase()}
                {row.length}
              </span>
              <span class="hint-words">
                {found.map((w) => (
                  <span key={w.word} class="found">{w.word}</span>
                ))}
                {unfound.map((w) => (
                  <span key={w.word} class="blank">{w.pattern}</span>
                ))}
              </span>
              {!row.done && (
                <button class="small" disabled={!canShow} onClick={() => onShow(row)}>
                  Show
                </button>
              )}
            </div>
          );
        })}
      </div>
    </details>
  );
}
