import fs from 'node:fs/promises';
import path from 'node:path';

export async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return fallback;
    }
    throw error;
  }
}

// Write to a temp file then rename, so a crash never leaves a half-written file.
export async function writeAtomic(file, text) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const temp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(temp, text);
  await fs.rename(temp, file);
}

export function writeJson(file, value) {
  return writeAtomic(file, JSON.stringify(value, null, 2) + '\n');
}

export async function readWords(file) {
  const text = await fs.readFile(file, 'utf8');
  return text.split('\n').map((line) => line.trim()).filter(Boolean);
}

export function writeWords(file, words) {
  return writeAtomic(file, words.join('\n') + '\n');
}
