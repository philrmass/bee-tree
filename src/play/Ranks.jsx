import { rankThresholds } from '../../utilities/score.js';

// Every rank with its score: reached ranks bold, the rest show the points
// still needed in parens, e.g. "Nice 35 (12)".
export function Ranks({ score, maxScore }) {
  return (
    <ul class="ranks">
      {rankThresholds(maxScore).map((rank) => (
        <li key={rank.name} class={score >= rank.min ? 'reached' : ''}>
          {rank.name} {rank.min}
          {score < rank.min && <span class="need"> ({rank.min - score})</span>}
        </li>
      ))}
    </ul>
  );
}
