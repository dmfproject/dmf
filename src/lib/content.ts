import { withBase } from './basePath';
import { cropFileName } from './coverCrop';
import { fetchJson, fetchText, fileExists, fileUrl } from './fileServer';

/** Raw shapes of the JSON files in content/ on the file server. */
export type DeckJson = {
  id: string;
  title: string;
  img: string;
  update_id: string;
  /** Optional square crop of the cover (set in the admin), see ./coverCrop */
  crop?: { x: number; y: number; size: number } | null;
};
export type UpdateJson = { id: string; date: string; title: string };

/** Shapes passed to the page (image resolved, date parsed). */
export type Deck = DeckJson & {
  imgSrc: string | null;
  /** Date of the deck's update (from updates.json), or null if the update_id is unknown. */
  date: string | null;
  timestamp: number;
  /** "New" when the site was built: deck is from the latest update, and that update is under 30 days old */
  isNew: boolean;
  /** When the "New" tag ends (ms), for decks from the latest update; null for older decks. */
  newUntil: number | null;
  /** Position in decks.json (new decks are added at the end, so higher = added later) */
  order: number;
};

/** How long decks from the latest update keep their "New" tag after the update's date. */
const NEW_FOR_DAYS = 30;
export type Update = UpdateJson & { timestamp: number; description: string };

/** Parse "dd.mm.yyyy" into a timestamp (0 if the format is wrong). */
export function parseDate(value: string): number {
  const m = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(value.trim());
  if (!m) return 0;
  return Date.UTC(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
}

/** A list from content/<file> on the file server ([] if it's missing or not a list). */
async function readJson<T>(file: string): Promise<T[]> {
  const data = await fetchJson<unknown>(`content/${file}`);
  if (data === null) console.warn(`[content] content/${file} not found on the file server`);
  return Array.isArray(data) ? (data as T[]) : [];
}

/** Whether an update is out: its date (UTC midnight) is today or earlier in UTC. A bad date counts as out. */
function isReleased(u: UpdateJson): boolean {
  return parseDate(u.date ?? '') <= Date.now();
}

/** content/updates.json without updates dated in the future (UTC). */
async function readUpdatesJson(): Promise<UpdateJson[]> {
  return (await readJson<UpdateJson>('updates.json')).filter(isReleased);
}

/** Decks and updates that are out: decks whose update is dated in the future (UTC) are left out. */
async function readReleased(): Promise<{ decks: DeckJson[]; updates: UpdateJson[]; hiddenDeckIds: Set<string> }> {
  const [decks, allUpdates] = await Promise.all([readJson<DeckJson>('decks.json'), readJson<UpdateJson>('updates.json')]);
  const future = new Set(allUpdates.filter((u) => !isReleased(u)).map((u) => String(u.id)));
  const hidden = (d: DeckJson) => future.has(String(d.update_id ?? ''));
  return {
    decks: decks.filter((d) => !hidden(d)),
    updates: allUpdates.filter(isReleased),
    hiddenDeckIds: new Set(decks.filter(hidden).map((d) => d.id)),
  };
}

/** content/decks.json (released decks only, no covers or dates resolved): cheap, for ids and titles. */
export async function readDecksJson(): Promise<DeckJson[]> {
  return (await readReleased()).decks;
}

/** Whether a deck is listed but its update is dated in the future (UTC), so it must not be shown yet. */
export async function isUnreleasedDeck(id: string): Promise<boolean> {
  return (await readReleased()).hiddenDeckIds.has(id);
}

/**
 * Cover URL for a deck on the file server:
 * - with a crop: covers/crops/<deck>--<card>-....jpg, if it exists
 * - "68468459" -> covers/68468459.jpg; no cover if it's missing
 * - anything else (a path like "/art/x.webp" in this site, or a full URL) is used as-is
 */
async function resolveImage(deck: DeckJson): Promise<string | null> {
  const value = String(deck.img ?? '').trim();
  if (!value) return null;
  const cropped = deck.crop ? cropFileName(deck.id, value, deck.crop) : null;
  if (cropped) {
    if (await fileExists(`covers/crops/${cropped}`)) return fileUrl(`covers/crops/${cropped}`);
    console.warn(`[content] Missing cropped cover covers/crops/${cropped} on the file server`);
  }
  if (/^\d+$/.test(value)) {
    if (await fileExists(`covers/${value}.jpg`)) return fileUrl(`covers/${value}.jpg`);
    console.warn(`[content] Missing cover covers/${value}.jpg on the file server`);
    return null;
  }
  return withBase(value);
}

/** Decks from content/decks.json (file server), newest first. A deck's date comes from its update (update_id). */
export async function getDecks(): Promise<Deck[]> {
  const { decks: raw, updates } = await readReleased();
  const covers = await Promise.all(raw.map((d) => resolveImage(d)));
  const dateByUpdate = new Map(updates.map((u) => [String(u.id), u.date]));
  const now = Date.now();
  const newWindow = NEW_FOR_DAYS * 24 * 60 * 60 * 1000;

  // Only the latest update (by date) can have "New" decks, and only once there's more than one
  // update (in the first release every deck would be "New")
  let latestId: string | null = null;
  let latestTs = 0;
  for (const u of updates.length > 1 ? updates : []) {
    const ts = parseDate(u.date ?? '');
    if (ts > latestTs) {
      latestTs = ts;
      latestId = String(u.id);
    }
  }

  return raw
    .map((d, order) => {
      const date = dateByUpdate.get(String(d.update_id ?? '')) ?? null;
      if (!date) console.warn(`[content] Deck "${d.id}" has unknown update_id "${d.update_id}"`);
      const timestamp = date ? parseDate(date) : 0;
      return {
        ...d,
        order,
        imgSrc: covers[order],
        date,
        timestamp,
        newUntil: latestId !== null && String(d.update_id ?? '') === latestId ? latestTs + newWindow : null,
        isNew: latestId !== null && String(d.update_id ?? '') === latestId && now < latestTs + newWindow,
      };
    })
    .sort((a, b) => b.timestamp - a.timestamp || a.title.localeCompare(b.title));
}

/** content/updates/{id}.md from the file server ('' if it doesn't exist). */
async function readUpdateText(id: string): Promise<string> {
  if (!/^[\w-]+$/.test(id)) return '';
  const text = await fetchText(`content/updates/${id}.md`);
  if (text === null) console.warn(`[content] Missing content/updates/${id}.md on the file server`);
  return text ?? '';
}

/** A markdown file from content/ on the file server ('' if missing): philosophy.md, rulings.md, errata.md */
export async function getContentText(file: string): Promise<string> {
  return (await fetchText(`content/${file}`)) ?? '';
}

/** Updates from content/updates.json (+ each one's .md text), newest first. */
export async function getUpdates(): Promise<Update[]> {
  const raw = await readUpdatesJson();
  const updates = await Promise.all(
    raw.map(async (u) => ({
      ...u,
      timestamp: parseDate(u.date ?? ''),
      description: await readUpdateText(String(u.id ?? '')),
    })),
  );
  return updates.sort((a, b) => b.timestamp - a.timestamp);
}

/** How many days before an update's date the Main page announces it. */
const ANNOUNCE_DAYS = 5;
const DAY_MS = 24 * 60 * 60 * 1000;

/** The note on the Main page: an update coming soon, or the latest one released. */
export type UpdateNews = {
  /** 'upcoming': dated within the next 5 days; 'released': out, and under 30 days old */
  kind: 'upcoming' | 'released';
  id: string;
  title: string;
  date: string;
  /** Names of the decks released in it (empty for 'upcoming') */
  decks: string[];
  /** Shown while now < until: the update's date for 'upcoming', the date + 30 days for 'released' */
  until: number;
};

/**
 * The note for the Main page, in order:
 * 1. the soonest future update dated within the next 5 days (UTC)
 * 2. the latest released update, if it's under 30 days old (and isn't the first release)
 * 3. nothing (null)
 */
export async function getLatestUpdateNews(): Promise<UpdateNews | null> {
  const now = Date.now();
  const all = await readJson<UpdateJson>('updates.json');
  const upcoming = all
    .map((u) => ({ u, ts: parseDate(u.date ?? '') }))
    .filter(({ ts }) => ts > now && ts - now <= ANNOUNCE_DAYS * DAY_MS)
    .sort((a, b) => a.ts - b.ts)[0];
  if (upcoming) {
    return { kind: 'upcoming', id: String(upcoming.u.id), title: upcoming.u.title ?? '', date: upcoming.u.date, decks: [], until: upcoming.ts };
  }

  const [updates, decks] = await Promise.all([getUpdates(), readDecksJson()]);
  if (updates.length < 2) return null; // the first release isn't news
  const latest = updates.find((u) => u.timestamp > 0); // getUpdates() is newest first
  if (!latest) return null;
  const until = latest.timestamp + NEW_FOR_DAYS * DAY_MS;
  if (now >= until) return null;
  return {
    kind: 'released',
    id: String(latest.id),
    title: latest.title ?? '',
    date: latest.date,
    decks: decks.filter((d) => String(d.update_id ?? '') === String(latest.id)).map((d) => d.title),
    until,
  };
}
