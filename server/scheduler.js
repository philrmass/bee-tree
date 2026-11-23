import { nextDailyRun, MINUTE, HOUR } from './time.js';

export const BACKOFF = [5 * MINUTE, 15 * MINUTE, 30 * MINUTE, HOUR];

// When to try next: the daily run after success; after failures, back off
// 5, 15, 30, 60 min then hourly, but never past the next daily run.
export function nextRunAfter(now, failures) {
  const daily = nextDailyRun(now);
  if (failures === 0) return daily;
  const delay = BACKOFF[Math.min(failures, BACKOFF.length) - 1];
  return Math.min(now + delay, daily);
}

// Runs `job` at startup, daily, and on demand, with retries on failure.
export function createScheduler(job, { now = Date.now, onResult = () => {} } = {}) {
  let timer = null;
  let running = null;
  let failures = 0;
  let nextRun = null;

  function schedule() {
    clearTimeout(timer);
    nextRun = nextRunAfter(now(), failures);
    // setTimeout caps near 24.8 days; daily runs are always well below that.
    timer = setTimeout(() => runNow('scheduled'), Math.max(0, nextRun - now()));
    timer.unref?.();
  }

  function runNow(reason = 'manual') {
    if (running) return running;
    running = (async () => {
      const at = new Date(now()).toISOString();
      let attempt;
      try {
        const result = await job();
        failures = 0;
        attempt = { at, reason, ok: true, ...result };
      } catch (error) {
        failures++;
        attempt = { at, reason, ok: false, error: error.message, ...error.result };
      }
      schedule();
      await onResult(attempt);
      return attempt;
    })().finally(() => {
      running = null;
    });
    return running;
  }

  return {
    start: () => runNow('startup'),
    runNow,
    stop: () => clearTimeout(timer),
    status: () => ({
      running: Boolean(running),
      failures,
      nextRun: nextRun && new Date(nextRun).toISOString(),
    }),
  };
}
