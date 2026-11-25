import { formatDate } from '../play/DateNav.jsx';

// Puzzles not yet used to update the lists, oldest first.
export function PuzzlesToAdd({ puzzles, adding, onAdd }) {
  return (
    <section class="section">
      <h2>Puzzles to add</h2>
      {!puzzles ? (
        <p class="muted">Loading…</p>
      ) : puzzles.length === 0 ? (
        <p class="muted">All puzzles have been added.</p>
      ) : (
        <div class="to-add">
          {puzzles.map((p) => (
            <div key={p.date} class="to-add-row">
              <span>{formatDate(p.date)}</span>
              <span class="letters">
                <strong>{p.center}</strong>
                {p.outer.join('')}
              </span>
              <span class="muted">{p.count} words</span>
              <button class="small" disabled={adding !== null} onClick={() => onAdd(p.date)}>
                {adding === p.date ? 'Adding…' : 'Add'}
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
