import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { findWords, compareLists } from '../utilities/solver.js';
import { LIST_NAMES, DEFAULT_LIST } from './config.js';
import { nyDate } from './time.js';

const LETTER = /^[a-z]$/;

function badRequest(message) {
  return new HTTPException(400, { message });
}

function listName(name = DEFAULT_LIST) {
  if (!LIST_NAMES.includes(name)) throw badRequest(`unknown list: ${name}`);
  return name;
}

function wordArray(value) {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.some((w) => typeof w !== 'string' || !/^[a-z]+$/.test(w))) {
    throw badRequest('words must be an array of lowercase words');
  }
  return value;
}

// center: one letter; outer: 6 distinct letters (string or array) not including center.
function puzzleLetters(body) {
  const center = String(body.center ?? '').toLowerCase();
  const outer = [...(Array.isArray(body.outer) ? body.outer.join('') : String(body.outer ?? '')).toLowerCase()];
  const all = new Set([center, ...outer]);
  if (!LETTER.test(center) || outer.length !== 6 || !outer.every((l) => LETTER.test(l)) || all.size !== 7) {
    throw badRequest('need a center letter and 6 other distinct letters');
  }
  return { center, outer };
}

export function createApp({ store, tries, scheduler, git }) {
  const app = new Hono();
  const api = new Hono();

  async function requirePuzzle(date) {
    const puzzle = await store.getPuzzle(date);
    if (!puzzle) throw new HTTPException(404, { message: `no puzzle for ${date}` });
    return puzzle;
  }

  async function solve(puzzle, name) {
    return findWords(await tries.get(name), puzzle.center, puzzle.outer);
  }

  // Puzzles
  api.get('/puzzles', async (c) => {
    const puzzles = await store.listPuzzles();
    return c.json(
      puzzles.reverse().map(({ date, center, outer, answers, pangrams }) => ({
        date,
        center,
        outer,
        count: answers.length,
        pangrams: pangrams.length,
      })),
    );
  });

  api.get('/puzzles/:date', async (c) => c.json(await requirePuzzle(c.req.param('date'))));

  api.get('/puzzles/:date/compare', async (c) => {
    const puzzle = await requirePuzzle(c.req.param('date'));
    const name = listName(c.req.query('list'));
    return c.json({ date: puzzle.date, list: name, ...compareLists(puzzle.answers, await solve(puzzle, name)) });
  });

  // Solver
  api.post('/solve', async (c) => {
    const body = await c.req.json();
    const letters = puzzleLetters(body);
    const name = listName(body.list);
    return c.json({ ...letters, list: name, words: await solve(letters, name) });
  });

  // Score every saved puzzle against a list.
  api.get('/test', async (c) => {
    const name = listName(c.req.query('list'));
    const puzzles = await store.listPuzzles();
    const results = [];
    for (const puzzle of puzzles) {
      const { matched, missed, extra } = compareLists(puzzle.answers, await solve(puzzle, name));
      results.push({ date: puzzle.date, answers: puzzle.answers.length, matched: matched.length, missed, extra: extra.length });
    }
    return c.json({ list: name, puzzles: results.reverse() });
  });

  // Lists
  api.get('/lists', async (c) => {
    const lists = await Promise.all(
      LIST_NAMES.map(async (name) => ({ name, count: (await store.readList(name)).length })),
    );
    return c.json(lists);
  });

  api.get('/lists/:name', async (c) => {
    const name = listName(c.req.param('name'));
    return c.json({ name, words: await store.readList(name) });
  });

  api.post('/lists/:name', async (c) => {
    const name = listName(c.req.param('name'));
    const body = await c.req.json();
    return c.json({ name, ...(await store.editList(name, { add: wordArray(body.add), remove: wordArray(body.remove) })) });
  });

  // Pending NYT answers: approve adds them to nyt; reject just drops them.
  api.get('/pending', async (c) => c.json(await store.readPending()));

  api.post('/pending', async (c) => {
    const body = await c.req.json();
    const approve = wordArray(body.approve);
    const reject = wordArray(body.reject);
    const done = new Set([...approve, ...reject]);
    const pending = await store.readPending();
    const toAdd = approve.filter((w) => pending.some((p) => p.word === w));
    const nyt = await store.editList('nyt', { add: toAdd });
    const remaining = pending.filter((p) => !done.has(p.word));
    await store.writePending(remaining);
    return c.json({ approved: nyt.added, pending: remaining });
  });

  // Scraping
  api.get('/scrape', async (c) => c.json({ ...(await store.readLog()), ...scheduler.status(), today: nyDate(Date.now()) }));
  api.post('/scrape', async (c) => c.json(await scheduler.runNow('manual')));

  // Git (data/ only)
  api.get('/git', async (c) => c.json(await git.status()));
  api.post('/commit', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const message = typeof body.message === 'string' && body.message.trim() ? body.message.trim() : `data: update ${nyDate(Date.now())}`;
    return c.json(await git.commit(message));
  });

  api.onError((error, c) => {
    if (error instanceof HTTPException) {
      return c.json({ error: error.message }, error.status);
    }
    if (error instanceof SyntaxError) {
      return c.json({ error: 'invalid JSON body' }, 400);
    }
    console.error(error);
    return c.json({ error: error.message }, 500);
  });

  app.route('/api', api);
  return app;
}
