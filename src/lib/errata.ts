import { getContentText, readDecksJson } from './content';
import { parseYdk } from './decklist';
import { cardImageUrl, fetchText } from './fileServer';

const ERRATA_ID = /^90000\d{4}$/;

export type ErrataData = {
  /** Intro text from content/errata.md ('' if missing) */
  intro: string;
  /** Erratum card ids (90000nnnn) used in any deck, in deck-list order */
  cards: string[];
  images: Record<string, string | null>;
};

/**
 * All erratum card ids that appear in the deck lists (decks/<id>.ydk on the file server, for every
 * deck in decks.json), in the order they first appear: decks by id, cards in deck-list order.
 */
async function errataFromDecks(): Promise<string[]> {
  const ids = (await readDecksJson()).map((d) => d.id).sort((a, b) => a.localeCompare(b));
  const ydks = await Promise.all(ids.map(async (id) => (await fetchText(`decks/${id}.ydk`)) ?? ''));

  const cards = new Set<string>(); // a Set keeps insertion order
  for (const ydk of ydks) {
    const { main, extra, side } = parseYdk(ydk);
    for (const id of [...main, ...extra, ...side]) if (ERRATA_ID.test(id)) cards.add(id);
  }
  return [...cards];
}

/** Errata from the deck lists (card ids + image URLs) and the intro text. Card texts load later, on the page. */
export async function getErrata(): Promise<ErrataData> {
  const [intro, cards] = await Promise.all([getContentText('errata.md'), errataFromDecks()]);
  const images = Object.fromEntries(cards.map((c) => [c, cardImageUrl(c)]));
  return { intro: intro.trim(), cards, images };
}
