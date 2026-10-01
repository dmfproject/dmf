import { readDecksJson } from './content';
import { cardImageUrl, fetchText } from './fileServer';

export type DeckList = {
  id: string;
  title: string;
  main: string[];
  extra: string[];
  side: string[];
  /** card id → image URL on the file server (null if missing) */
  images: Record<string, string | null>;
};

/** Split a .ydk file into main / extra / side card ids (duplicates kept, order kept). */
export function parseYdk(text: string) {
  const out = { main: [] as string[], extra: [] as string[], side: [] as string[] };
  let section: keyof typeof out = 'main';
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim().toLowerCase();
    if (line === '#main') section = 'main';
    else if (line === '#extra') section = 'extra';
    else if (line === '!side') section = 'side';
    else if (/^\d+$/.test(line)) out[section].push(String(Number(line))); // drop leading zeros
  }
  return out;
}

function prettify(id: string) {
  return id.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Load decks/{id}.ydk from the file server (card ids + image URLs), or null if the deck doesn't exist. Card texts load later, on the page. */
export async function getDeckList(id: string): Promise<DeckList | null> {
  if (!/^[\w-]+$/.test(id)) return null; // keep the path inside decks/

  const ydk = await fetchText(`decks/${id}.ydk`);
  if (ydk === null) return null;
  const { main, extra, side } = parseYdk(ydk);
  const unique = [...new Set([...main, ...extra, ...side])];

  // Image URLs (cards/<id>.jpg); the images themselves load on the page
  const images = Object.fromEntries(unique.map((c) => [c, cardImageUrl(c)]));

  // Title from decks.json when the deck is listed there
  const listed = (await readDecksJson()).find((d) => d.id === id);

  return { id, title: listed?.title ?? prettify(id), main, extra, side, images };
}
