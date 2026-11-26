import { useEffect, useState } from 'preact/hooks';
import { useRoute } from 'preact-iso';
import { getPuzzles, getPuzzle, getCenters } from '../api.js';
import { DateNav } from '../play/DateNav.jsx';
import { Centers } from './Centers.jsx';
import { LetterRuns } from './LetterRuns.jsx';
import { LetterUse } from './LetterUse.jsx';
import { Histogram } from './Histogram.jsx';

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
      {puzzle && <LetterUse puzzle={puzzle} />}
      {puzzle && puzzles && <Trends puzzles={puzzles} date={puzzle.date} />}
      {puzzle && <LetterRuns answers={puzzle.answers} />}
    </main>
  );
}

// Word count and max score of this puzzle against all saved puzzles.
function Trends({ puzzles, date }) {
  const summary = puzzles.find((p) => p.date === date);
  if (!summary) return null;
  return (
    <>
      <Histogram title="Words per puzzle" unit="words" values={puzzles.map((p) => p.count)} current={summary.count} />
      <Histogram title="Max score per puzzle" unit="points" values={puzzles.map((p) => p.score)} current={summary.score} />
    </>
  );
}
