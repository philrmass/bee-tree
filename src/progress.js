// Play progress per puzzle date, kept in this browser only.
const key = (date) => `bee-tree:progress:${date}`;
const empty = () => ({ found: [], reveals: {} });

export function loadProgress(date) {
  try {
    const saved = JSON.parse(localStorage.getItem(key(date)));
    return saved ? { ...empty(), ...saved } : empty();
  } catch {
    return empty();
  }
}

export function saveProgress(date, progress) {
  try {
    localStorage.setItem(key(date), JSON.stringify(progress));
  } catch {
    // Storage can be unavailable (private mode); progress just won't persist.
  }
}
