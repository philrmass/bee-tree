import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { cors } from 'hono/cors';
import { findWords, compareLists, centerVariants } from '../utilities/solver.js';
import { LIST_NAMES, DEFAULT_LIST } from './config.js';
import { nyDate } from './time.js';
import { addPuzzleToLists } from './lists.js';
import { totalScore } from '../utilities/score.js';

const LETTER = /^[a-z]$/;

function badRequest(message) {
  return new HTTPException(400, { message });
}

function listName(name = DEFAULT_LIST) {
  if (!LIST_NAMES.includes(name)) throw badRequest(`unknown list: ${name}`);
  return name;
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
  // allow read-only cross-origin requests (e.g. server-status checks)
  app.use('*', cors({ origin: '*', allowMethods: ['GET', 'HEAD'] }));
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
    const added = new Set(await store.readAdded());
    return c.json(
      puzzles.reverse().map(({ date, center, outer, answers, pangrams }) => ({
        date,
        center,
        outer,
        count: answers.length,
        score: totalScore(answers, [center, ...outer]),
        pangrams: pangrams.length,
        added: added.has(date),
      })),
    );
  });

  api.get('/puzzles/:date', async (c) => c.json(await requirePuzzle(c.req.param('date'))));

  // Use a puzzle's official answers to update every list (once per puzzle).
  // Adds run one at a time so list edits never overlap.
  let addQueue = Promise.resolve();
  api.post('/puzzles/:date/add', async (c) => {
    const puzzle = await requirePuzzle(c.req.param('date'));
    const run = addQueue.then(async () => {
      if ((await store.readAdded()).includes(puzzle.date)) {
        throw new HTTPException(409, { message: `${puzzle.date} was already added` });
      }
      const lists = await addPuzzleToLists(store, tries, puzzle);
      await store.markAdded(puzzle.date);
      return lists;
    });
    addQueue = run.catch(() => {});
    return c.json({ date: puzzle.date, lists: await run });
  });

  api.get('/puzzles/:date/compare', async (c) => {
    const puzzle = await requirePuzzle(c.req.param('date'));
    const name = listName(c.req.query('list'));
    return c.json({ date: puzzle.date, list: name, ...compareLists(puzzle.answers, await solve(puzzle, name)) });
  });

  // The puzzle with each letter as the center, solved with every list.
  api.get('/puzzles/:date/centers', async (c) => {
    const puzzle = await requirePuzzle(c.req.param('date'));
    const rows = [];
    for (const variant of centerVariants(puzzle.center, puzzle.outer)) {
      const words = {};
      for (const name of LIST_NAMES) words[name] = await solve(variant, name);
      rows.push({ ...variant, words });
    }
    return c.json({ date: puzzle.date, lists: LIST_NAMES, rows });
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

  // Words in a list, optionally filtered by `q` (contains), paged by offset/limit.
  api.get('/lists/:name', async (c) => {
    const name = listName(c.req.param('name'));
    const q = (c.req.query('q') ?? '').trim().toLowerCase();
    const offset = Math.max(0, Number(c.req.query('offset')) || 0);
    const limit = Math.min(5000, Math.max(1, Number(c.req.query('limit')) || 1000));
    const words = await store.readList(name);
    const matches = q ? words.filter((w) => w.includes(q)) : words;
    return c.json({
      name,
      total: words.length,
      matches: matches.length,
      offset,
      words: matches.slice(offset, offset + limit),
    });
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
