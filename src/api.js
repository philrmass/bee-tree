async function request(path, options) {
  const response = await fetch(`/api${path}`, options);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error ?? `request failed (${response.status})`);
  }
  return body;
}

const post = (path, body) =>
  request(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  });

export const getPuzzles = () => request('/puzzles');
export const getPuzzle = (date) => request(`/puzzles/${date}`);
export const getCenters = (date) => request(`/puzzles/${date}/centers`);
export const addPuzzle = (date) => post(`/puzzles/${date}/add`);

export const getLists = () => request('/lists');
export function searchList(name, { q = '', offset = 0, limit = 1000 } = {}) {
  const params = new URLSearchParams({ q, offset, limit });
  return request(`/lists/${name}?${params}`);
}

export const getScrape = () => request('/scrape');
export const scrapeNow = () => post('/scrape');

export const getGit = () => request('/git');
export const commitData = () => post('/commit');
