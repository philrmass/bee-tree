// Runs the API server (with restart on change) and the Vite dev server together.
import { spawn } from 'node:child_process';

const children = [
  spawn('npm', ['run', '-s', 'dev:server'], { stdio: 'inherit' }),
  spawn('npm', ['run', '-s', 'dev:client'], { stdio: 'inherit' }),
];

function stop() {
  children.forEach((child) => child.kill());
  process.exit();
}
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
children.forEach((child) => child.on('exit', stop));
