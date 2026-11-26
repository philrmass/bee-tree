import { histogram } from '../../utilities/stats.js';

// How a value is spread across all puzzles, with this puzzle's bar highlighted.
// `unit` names the value ("words", "points") for the caption and tooltips.
export function Histogram({ title, values, current, unit }) {
  const { width, bins } = histogram(values);
  const tallest = Math.max(1, ...bins.map((b) => b.count));
  const range = (b) => (width === 1 ? `${b.from}` : `${b.from}–${b.to}`);
  const puzzles = (n) => `${n} puzzle${n === 1 ? '' : 's'}`;

  return (
    <section class="section">
      <h2>{title}</h2>
      <p class="muted chart-caption">
        This puzzle: {current} {unit} · {puzzles(values.length)}
      </p>
      <div class="histogram" role="img" aria-label={`${title}: ${bins.map((b) => `${range(b)} ${unit}, ${puzzles(b.count)}`).join('; ')}`}>
        {bins.map((b) => {
          const here = current >= b.from && current <= b.to;
          return (
            <div key={b.from} class="bin" title={`${range(b)} ${unit}: ${puzzles(b.count)}`}>
              <span class="bin-count">{here ? b.count : ''}</span>
              <div class="bin-track">
                {b.count > 0 && (
                  <div class={`bar ${here ? 'current' : ''}`} style={{ height: `${(100 * b.count) / tallest}%` }} />
                )}
              </div>
              <span class="bin-label">{b.from}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
