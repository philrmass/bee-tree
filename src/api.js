async function request(path, options) {
  const response = await fetch(`/api${path}`, options);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error ?? `request failed (${response.status})`);
  }
  return body;
}

export const getPuzzles = () => request('/puzzles');
export const getPuzzle = (date) => request(`/puzzles/${date}`);
