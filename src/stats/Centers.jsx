import { Fragment } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { isPangram } from '../../utilities/score.js';

// Solution counts for the puzzle with each letter as the center (real puzzle
// first), one column per list. Clicking a count shows its words below.
export function Centers({ lists, rows }) {
  const [open, setOpen] = useState(null); // { row, list }
  const panel = useRef(null);

  useEffect(() => {
    panel.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [open]);

  const toggle = (row, list) =>
    setOpen((o) => (o?.row === row && o?.list === list ? null : { row, list }));

  const selected = open && rows[open.row];
  const words = selected?.words[open.list];

  return (
    <section class="section">
      <div class="centers" style={{ '--columns': lists.length }}>
        <span />
        {lists.map((name) => (
          <span key={name} class="centers-head">
            {name}
          </span>
        ))}
        {rows.map((row, r) => (
          <Fragment key={row.center}>
            <span class={`letters ${r === 0 ? 'real' : ''}`}>
              <strong>{row.center}</strong>
              {row.outer.join('')}
            </span>
            {lists.map((name) => {
              const list = row.words[name];
              const active = open?.row === r && open?.list === name;
              return (
                <span key={name} class={r === 0 ? 'real' : ''}>
                  <button
                    class={`count ${active ? 'active' : ''}`}
                    aria-pressed={active}
                    onClick={() => toggle(r, name)}
                  >
                    {list.length.toLocaleString('en-US')}
                  </button>
                </span>
              );
            })}
          </Fragment>
        ))}
      </div>

      {words && (
        <div class="words-panel" ref={panel}>
          <div class="words-panel-head">
            <span>
              {open.list} · center {selected.center.toUpperCase()} · {words.length.toLocaleString('en-US')} words
            </span>
            <button class="small" aria-label="Close" onClick={() => setOpen(null)}>
              ✕
            </button>
          </div>
          <div class="word-grid">
            {words.map((w) => (
              <span key={w} class={isPangram(w, [selected.center, ...selected.outer]) ? 'pangram' : ''}>
                {w}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
