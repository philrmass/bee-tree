import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createStore } from '../server/store.js';
import { createScraper } from '../server/scraper.js';

const html = await fs.readFile(new URL('./fixtures/nyt-2026-11-16.html', import.meta.url), 'utf8');
const monday9am = () => Date.parse('2026-11-16T14:00:00Z');

async function tempStore() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'bee-tree-'));
  return createStore(dir, path.join(dir, 'cache'));
}

test('scrape saves new puzzles once', async () => {
  const store = await tempStore();
  const scrape = createScraper(store, { fetchHtml: async () => html, now: monday9am });

  const first = await scrape();
  assert.equal(first.saved.length, 8);
  assert.equal(first.latest, '2026-11-16');
  assert.equal((await store.getPuzzle('2026-11-16')).center, 'c');

  const second = await scrape();
  assert.deepEqual(second.saved, []);
});

test('scrape fails when the page is behind the expected date', async () => {
  const store = await tempStore();
  const tuesday9am = () => Date.parse('2026-11-17T14:00:00Z');
  const scrape = createScraper(store, { fetchHtml: async () => html, now: tuesday9am });
  await assert.rejects(scrape(), (error) => {
    assert.match(error.message, /expected 2026-11-17/);
    assert.equal(error.result.saved.length, 8); // still keeps what it found
    return true;
  });
});
