import { isPangram } from '../../utilities/score.js';

// Collapsible "Words" section (open by default) listing found words.
export function Found({ found, letters }) {
  const sorted = [...found].sort();
  return (
    <details class="section toggle" open>
      <summary>Words</summary>
      {sorted.length > 0 ? (
        <p class="found-words">
          {sorted.map((word) => (
            <span key={word} class={isPangram(word, letters) ? 'pangram' : ''}>
              {word}
              {isPangram(word, letters) && ' ★'}
            </span>
          ))}
        </p>
      ) : (
        <p class="muted">No words yet.</p>
      )}
    </details>
  );
}
