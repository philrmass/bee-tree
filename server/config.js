import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const DATA_DIR = process.env.DATA_DIR ?? path.join(ROOT, 'data');
export const CACHE_DIR = process.env.CACHE_DIR ?? path.join(ROOT, 'cache');
export const DIST_DIR = path.join(ROOT, 'dist');
export const PORT = Number(process.env.PORT ?? 2323);

export const LIST_NAMES = ['nyt', 'original', 'small', 'medium', 'large'];
export const DEFAULT_LIST = 'nyt';
