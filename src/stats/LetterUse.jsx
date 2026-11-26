import { letterUse } from '../../utilities/stats.js';

// Percent of the official answers that contain each letter.
export function LetterUse({ puzzle }) {
  const use = letterUse(puzzle.answers, puzzle.center, puzzle.outer);
  return (
    <section class="section">
      <h2>Letter use</h2>
      <div class="letter-use">
        {use.map(({ letter, percent }) => (
          <span key={letter} class={letter === puzzle.center ? 'center' : ''}>
            <span class="letters">{letter}</span> {percent}%
          </span>
        ))}
      </div>
    </section>
  );
}
