import fs from 'node:fs';
import path from 'node:path';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { ROOT, DATA_DIR, CACHE_DIR, DIST_DIR, PORT } from './config.js';
import { createStore } from './store.js';
import { createTrieCache } from './tries.js';
import { createScraper } from './scraper.js';
import { createScheduler } from './scheduler.js';
import { createGit } from './git.js';
import { createApp } from './app.js';

const store = createStore(DATA_DIR, CACHE_DIR);
const tries = createTrieCache(store, CACHE_DIR);
const git = createGit(ROOT);
const scheduler = createScheduler(createScraper(store), {
  onResult: async (attempt) => {
    await store.appendLog(attempt);
    const summary = attempt.ok
      ? `saved ${attempt.saved.length} puzzle(s), queued ${attempt.queued.length} word(s)`
      : `failed: ${attempt.error}`;
    console.log(`[scrape ${attempt.reason}] ${summary}; next ${scheduler.status().nextRun}`);
  },
});

const app = createApp({ store, tries, scheduler, git });

// In production, serve the built client from dist/ with an index.html fallback.
if (fs.existsSync(DIST_DIR)) {
  const root = path.relative(process.cwd(), DIST_DIR) || '.';
  app.use('/*', serveStatic({ root }));
  app.get('*', serveStatic({ path: path.join(root, 'index.html') }));
}

serve({ fetch: app.fetch, port: PORT }, ({ port }) => {
  console.log(`bee-tree server on http://localhost:${port}`);
  if (process.env.SCRAPE !== 'off') {
    scheduler.start();
  }
});
