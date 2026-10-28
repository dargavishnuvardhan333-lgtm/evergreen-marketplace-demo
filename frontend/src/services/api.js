const API_URL = (import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '')).replace(/\/$/, '');
export const API_ENABLED = Boolean(API_URL);

export async function api(path, options = {}) {
  if (!API_ENABLED) {
    throw new Error('Accounts and store administration are not enabled for this demo deployment.');
  }

  const token = sessionStorage.getItem('commers-token');
  const headers = { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error(`Could not reach the store API at ${API_URL}. Start the backend and check its MongoDB configuration.`);
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'The request could not be completed.');
  return data;
}

export { API_URL };
