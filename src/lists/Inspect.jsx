import { useEffect, useState } from 'preact/hooks';
import { searchList } from '../api.js';

const PAGE = 1000;

// Pick a list and search it; shows matches a page at a time.
export function Inspect({ lists, version }) {
  const [name, setName] = useState('nyt');
  const [query, setQuery] = useState('');
  const [q, setQ] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Wait for a pause in typing before searching.
  useEffect(() => {
    const timer = setTimeout(() => setQ(query.trim().toLowerCase()), 250);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    let current = true;
    setError(null);
    searchList(name, { q, limit: PAGE })
      .then((r) => current && setResult(r))
      .catch((e) => current && setError(e.message));
    return () => {
      current = false;
    };
  }, [name, q, version]);

  async function more() {
    try {
      const next = await searchList(name, { q, offset: result.words.length, limit: PAGE });
      setResult((r) => ({ ...r, words: [...r.words, ...next.words] }));
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <section class="section">
      <h2>Inspect</h2>
      <div class="inspect-controls">
        <select value={name} onChange={(e) => setName(e.currentTarget.value)}>
          {(lists ?? [{ name: 'nyt' }]).map((l) => (
            <option key={l.name} value={l.name}>
              {l.name}
            </option>
          ))}
        </select>
        <input
          type="search"
          placeholder="Search"
          value={query}
          onInput={(e) => setQuery(e.currentTarget.value)}
          autocapitalize="off"
          autocorrect="off"
          spellcheck={false}
        />
      </div>
      {error && <p class="error">{error}</p>}
      {result && (
        <>
          <p class="muted">
            {q
              ? `${result.matches.toLocaleString('en-US')} of ${result.total.toLocaleString('en-US')} words match`
              : `${result.total.toLocaleString('en-US')} words`}
            {result.words.length < result.matches && ` · showing ${result.words.length.toLocaleString('en-US')}`}
          </p>
          <div class="word-grid">
            {result.words.map((w) => (
              <span key={w}>{w}</span>
            ))}
          </div>
          {result.words.length < result.matches && (
            <button class="more" onClick={more}>
              Show more
            </button>
          )}
        </>
      )}
    </section>
  );
}
