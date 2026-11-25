import { useEffect, useState } from 'preact/hooks';
import { useRoute } from 'preact-iso';
import { getPuzzles, getPuzzle, getCenters } from '../api.js';
import { DateNav } from '../play/DateNav.jsx';
import { Centers } from './Centers.jsx';
import { LetterRuns } from './LetterRuns.jsx';

// Route: "/stats" shows the newest puzzle, "/stats/:date" a specific one.
export function Stats() {
  const { params } = useRoute();
  const [puzzles, setPuzzles] = useState(null);
  const [puzzle, setPuzzle] = useState(null);
  const [centers, setCenters] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getPuzzles().then(setPuzzles).catch((e) => setError(e.message));
  }, []);

  const date = params.date ?? puzzles?.[0]?.date;

  useEffect(() => {
    if (!date) return;
    let current = true;
    setPuzzle(null);
    setCenters(null);
    setError(null);
    Promise.all([getPuzzle(date), getCenters(date)])
      .then(([p, c]) => {
        if (!current) return;
        setPuzzle(p);
        setCenters(c);
      })
      .catch((e) => current && setError(e.message));
    return () => {
      current = false;
    };
  }, [date]);

  return (
    <main class="page">
      <DateNav puzzles={puzzles} date={date} base="/stats" />
      {error && <p class="error">Couldn't load the puzzle: {error}</p>}
      {!error && puzzles?.length === 0 && <p class="muted">No puzzles saved yet.</p>}
      {!error && !centers && puzzles?.length !== 0 && <p class="muted">Loading…</p>}
      {centers && <Centers key={centers.date} {...centers} />}
      {puzzle && <LetterRuns answers={puzzle.answers} />}
    </main>
  );
}
