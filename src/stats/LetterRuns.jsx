import { letterRuns, RUN_GROUPS } from '../../utilities/stats.js';

// Letter combinations (3+ letters) that appear 2+ times in the official
// answers, one column per length (3, 4, 5+).
export function LetterRuns({ answers }) {
  const groups = letterRuns(answers);
  return (
    <section class="section">
      <h2>Letter combinations</h2>
      <div class="runs">
        {RUN_GROUPS.map((label) => (
          <div key={label} class="runs-column">
            <div class="runs-head">{label}</div>
            {groups[label].map(({ run, count }) => (
              <div key={run} class="run">
                <span class="letters">{run}</span>
                <span class="num">{count}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
