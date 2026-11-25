import { useEffect, useState } from 'preact/hooks';
import { getScrape, scrapeNow, getGit, commitData } from '../api.js';

function when(iso) {
  return iso
    ? new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
    : '—';
}

// Scrape status with Scrape now, and uncommitted data changes with Commit.
export function Status({ version, onScraped }) {
  const [scrape, setScrape] = useState(null);
  const [git, setGit] = useState(null);
  const [busy, setBusy] = useState(null);
  const [note, setNote] = useState(null);

  const refresh = () => Promise.all([getScrape().then(setScrape), getGit().then(setGit)]).catch((e) => setNote(e.message));

  useEffect(() => {
    refresh();
  }, [version]);

  async function run(kind, action) {
    setBusy(kind);
    setNote(null);
    try {
      setNote(await action());
    } catch (e) {
      setNote(e.message);
    } finally {
      setBusy(null);
      refresh();
    }
  }

  const scrapeClick = () =>
    run('scrape', async () => {
      const attempt = await scrapeNow();
      onScraped();
      return attempt.ok ? `Scraped: ${attempt.saved.length} new puzzle(s)` : `Scrape failed: ${attempt.error}`;
    });

  const commitClick = () =>
    run('commit', async () => {
      const result = await commitData();
      return result.committed ? `Committed ${result.changes} file(s) (${result.commit})` : 'Nothing to commit';
    });

  const last = scrape?.attempts?.[0];

  return (
    <section class="status">
      <div class="status-row">
        <div>
          <div>
            Last scrape: {when(last?.at)}{' '}
            {last && (last.ok ? <span class="ok">✓</span> : <span class="error">✗ {last.error}</span>)}
          </div>
          <div class="muted">Next: {when(scrape?.nextRun)}</div>
        </div>
        <button onClick={scrapeClick} disabled={busy !== null || scrape?.running}>
          {busy === 'scrape' ? 'Scraping…' : 'Scrape'}
        </button>
      </div>
      <div class="status-row">
        <div>{git ? `${git.changes} uncommitted change${git.changes === 1 ? '' : 's'}` : ' '}</div>
        <button onClick={commitClick} disabled={busy !== null || !git?.changes}>
          {busy === 'commit' ? 'Committing…' : 'Commit'}
        </button>
      </div>
      {note && <p class="muted note">{note}</p>}
    </section>
  );
}
