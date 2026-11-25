import { useEffect, useState } from 'preact/hooks';
import { getLists, getPuzzles, addPuzzle } from '../api.js';
import { Status } from './Status.jsx';
import { WordLists } from './WordLists.jsx';
import { PuzzlesToAdd } from './PuzzlesToAdd.jsx';
import { Inspect } from './Inspect.jsx';

export function Lists() {
  const [lists, setLists] = useState(null);
  const [puzzles, setPuzzles] = useState(null);
  const [changes, setChanges] = useState({}); // name -> { added, removed } from the last Add
  const [adding, setAdding] = useState(null);
  const [version, setVersion] = useState(0); // bumps after data changes
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([getLists(), getPuzzles()])
      .then(([l, p]) => {
        setLists(l);
        setPuzzles(p.filter((x) => !x.added).reverse());
      })
      .catch((e) => setError(e.message));
  }, [version]);

  async function add(date) {
    setAdding(date);
    setError(null);
    try {
      const result = await addPuzzle(date);
      setChanges(
        Object.fromEntries(
          result.lists.map((l) => [l.name, { added: l.added.length, removed: l.removed.length }]),
        ),
      );
      setVersion((v) => v + 1);
    } catch (e) {
      setError(e.message);
    } finally {
      setAdding(null);
    }
  }

  return (
    <main class="page lists-page">
      <Status version={version} onScraped={() => setVersion((v) => v + 1)} />
      {error && <p class="error">{error}</p>}
      <WordLists lists={lists} changes={changes} />
      <PuzzlesToAdd puzzles={puzzles} adding={adding} onAdd={add} />
      <Inspect lists={lists} version={version} />
    </main>
  );
}
