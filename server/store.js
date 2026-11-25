import fs from 'node:fs/promises';
import path from 'node:path';
import { readJson, writeJson, readWords, writeWords } from './files.js';

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_LOG = 30;

// Reads and writes under data/ (committed), plus the scrape log in cache/
// (gitignored, so it doesn't show up as a change after every scrape).
export function createStore(dataDir, cacheDir) {
  const puzzlesDir = path.join(dataDir, 'puzzles');
  const listsDir = path.join(dataDir, 'lists');
  const addedFile = path.join(dataDir, 'added.json');
  const logFile = path.join(cacheDir, 'scrape-log.json');

  async function puzzleDates() {
    try {
      const files = await fs.readdir(puzzlesDir);
      return files
        .filter((f) => f.endsWith('.json') && DATE.test(f.slice(0, -5)))
        .map((f) => f.slice(0, -5))
        .sort();
    } catch (error) {
      if (error.code === 'ENOENT') return [];
      throw error;
    }
  }

  function getPuzzle(date) {
    if (!DATE.test(date)) return null;
    return readJson(path.join(puzzlesDir, `${date}.json`), null);
  }

  async function listPuzzles() {
    const dates = await puzzleDates();
    const puzzles = await Promise.all(dates.map(getPuzzle));
    return puzzles.filter(Boolean);
  }

  function savePuzzle(puzzle) {
    return writeJson(path.join(puzzlesDir, `${puzzle.date}.json`), puzzle);
  }

  const listFile = (name) => path.join(listsDir, `${name}.txt`);

  function readList(name) {
    return readWords(listFile(name));
  }

  async function listMtime(name) {
    return (await fs.stat(listFile(name))).mtimeMs;
  }

  // Add and remove words; keeps the list sorted and unique.
  async function editList(name, { add = [], remove = [] }) {
    const words = new Set(await readList(name));
    const added = add.filter((w) => !words.has(w));
    const removed = remove.filter((w) => words.has(w));
    added.forEach((w) => words.add(w));
    removed.forEach((w) => words.delete(w));
    if (added.length || removed.length) {
      await writeWords(listFile(name), [...words].sort());
    }
    return { added, removed, count: words.size };
  }

  // Dates of puzzles already used to update the lists.
  const readAdded = () => readJson(addedFile, []);
  async function markAdded(date) {
    const added = new Set(await readAdded());
    added.add(date);
    await writeJson(addedFile, [...added].sort());
  }

  const readLog = () => readJson(logFile, { lastSuccess: null, attempts: [] });
  async function appendLog(attempt) {
    const log = await readLog();
    log.attempts = [attempt, ...log.attempts].slice(0, MAX_LOG);
    if (attempt.ok) log.lastSuccess = attempt.at;
    await writeJson(logFile, log);
    return log;
  }

  return {
    puzzleDates,
    getPuzzle,
    listPuzzles,
    savePuzzle,
    readList,
    listMtime,
    editList,
    readAdded,
    markAdded,
    readLog,
    appendLog,
  };
}
