import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);

// Git operations scoped to data/ only. No push.
export function createGit(root, dataPath = 'data') {
  const git = (...args) => run('git', args, { cwd: root });

  async function status() {
    const { stdout } = await git('status', '--porcelain', '--untracked-files=all', '--', dataPath);
    const files = stdout
      .split('\n')
      .filter(Boolean)
      .map((line) => ({ status: line.slice(0, 2).trim(), path: line.slice(3) }));
    return { changes: files.length, files };
  }

  async function commit(message) {
    const before = await status();
    if (before.changes === 0) {
      return { committed: false, changes: 0 };
    }
    await git('add', '--all', '--', dataPath);
    await git('commit', '-m', message, '--', dataPath);
    const { stdout } = await git('rev-parse', '--short', 'HEAD');
    return { committed: true, changes: before.changes, commit: stdout.trim() };
  }

  return { status, commit };
}
