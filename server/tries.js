import fs from 'node:fs/promises';
import path from 'node:path';
import { buildTrie } from '../utilities/trie.js';
import { readJson, writeJson } from './files.js';

// Tries built from lists, cached in memory and in cache/tries/<name>.json.
// A cache entry is stale when the list file is newer than the cached trie.
export function createTrieCache(store, cacheDir) {
  const dir = path.join(cacheDir, 'tries');
  const memory = new Map(); // name -> { mtime, trie }

  async function get(name) {
    const mtime = await store.listMtime(name);
    const held = memory.get(name);
    if (held && held.mtime === mtime) {
      return held.trie;
    }

    const file = path.join(dir, `${name}.json`);
    let trie = null;
    try {
      const cachedAt = (await fs.stat(file)).mtimeMs;
      if (cachedAt >= mtime) {
        trie = await readJson(file, null);
      }
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }

    if (!trie) {
      trie = buildTrie(await store.readList(name));
      await writeJson(file, trie);
    }
    memory.set(name, { mtime, trie });
    return trie;
  }

  return { get };
}
