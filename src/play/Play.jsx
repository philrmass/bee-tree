import { useEffect, useState } from 'preact/hooks';
import { useRoute } from 'preact-iso';
import { getPuzzles, getPuzzle } from '../api.js';
import { DateNav } from './DateNav.jsx';
import { Game } from './Game.jsx';

// Route: "/" plays the newest puzzle, "/play/:date" a specific one.
export function Play() {
  const { params } = useRoute();
  const [puzzles, setPuzzles] = useState(null);
  const [puzzle, setPuzzle] = useState(null);
  const [error, setError] = useState(null);
  const [showRanks, setShowRanks] = useState(false);

  useEffect(() => {
    getPuzzles().then(setPuzzles).catch((e) => setError(e.message));
  }, []);

  const date = params.date ?? puzzles?.[0]?.date;

  useEffect(() => {
    if (!date) return;
    let current = true;
    setPuzzle(null);
    setError(null);
    getPuzzle(date)
      .then((p) => current && setPuzzle(p))
      .catch((e) => current && setError(e.message));
    return () => {
      current = false;
    };
  }, [date]);

  return (
    <main class="page play">
      <DateNav puzzles={puzzles} date={date} />
      {error && <p class="error">Couldn't load the puzzle: {error}</p>}
      {!error && puzzles?.length === 0 && <p class="muted">No puzzles saved yet.</p>}
      {!error && !puzzle && puzzles?.length !== 0 && <p class="muted">Loading…</p>}
      {puzzle && (
        <Game
          key={puzzle.date}
          puzzle={puzzle}
          showRanks={showRanks}
          onToggleRanks={() => setShowRanks((s) => !s)}
        />
      )}
    </main>
  );
}
