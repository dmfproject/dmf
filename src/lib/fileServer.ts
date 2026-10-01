/**
 * Content (decks, card images and texts, covers, .json/.md files, the EDOPro pack) lives on a
 * separate file server: FILE_SERVER in .env (e.g. http://localhost:3002/ locally, or its hosted
 * URL). The site is a static shell: every page loads its content from the file server in the
 * browser, on every visit, so content changes show up without rebuilding the site.
 */
const RAW = process.env.NEXT_PUBLIC_FILE_SERVER || process.env.FILE_SERVER || '';

/** File server URL without a trailing slash. */
export const FILE_SERVER = RAW.replace(/\/+$/, '');

/** The file server can't be reached, or answered with a server error. Pages show /server-error/ for it. */
export class FileServerError extends Error {}

/** Full URL of a file on the file server: fileUrl('cards/123.jpg') */
export function fileUrl(file: string): string {
  if (!FILE_SERVER) throw new FileServerError('FILE_SERVER is not set. Add it to .env, e.g. FILE_SERVER=http://localhost:3002/');
  return `${FILE_SERVER}/${file.replace(/^\/+/, '')}`;
}

// Within one page visit every file is fetched once (card texts and deck lists are shared between
// the things on a page). A reload or a new visit fetches everything fresh.
const cache = new Map<string, Promise<unknown>>();
function once<T>(key: string, load: () => Promise<T>): Promise<T> {
  if (!cache.has(key)) {
    const p = load();
    cache.set(key, p);
    p.catch(() => cache.delete(key)); // a failed request can be retried
  }
  return cache.get(key) as Promise<T>;
}

async function request(file: string, method: 'GET' | 'HEAD'): Promise<Response> {
  const url = fileUrl(file);
  let res: Response;
  try {
    res = await fetch(url, { method, cache: 'no-store' });
  } catch (err) {
    throw new FileServerError(`Could not reach the file server for ${url}: ${(err as Error).message}`);
  }
  if (res.status >= 500) throw new FileServerError(`File server answered HTTP ${res.status} for ${url}`);
  return res;
}

/** A text file from the file server, or null if it doesn't exist. Throws FileServerError if the server is down. */
export function fetchText(file: string): Promise<string | null> {
  return once(`text:${file}`, async () => {
    const res = await request(file, 'GET');
    return res.ok ? res.text() : null;
  });
}

/** A JSON file from the file server, or null if it doesn't exist. */
export async function fetchJson<T>(file: string): Promise<T | null> {
  const text = await fetchText(file);
  if (text === null) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`${fileUrl(file)} is not valid JSON`);
  }
}

/** Whether a file exists on the file server (HEAD request). */
export function fileExists(file: string): Promise<boolean> {
  return once(`head:${file}`, async () => (await request(file, 'HEAD')).ok);
}

/** Card image URL (cards/<id>.jpg). Not checked: a missing image shows the card placeholder. */
export function cardImageUrl(id: string): string {
  return fileUrl(`cards/${id}.jpg`);
}

/** Card text (card_texts/<id>.txt), '' if missing. */
export async function cardText(id: string): Promise<string> {
  return ((await fetchText(`card_texts/${id}.txt`)) ?? '').trim();
}
