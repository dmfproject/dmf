import { readDecksJson } from './content';
import { parseYdk } from './decklist';
import { cardImageUrl, fetchText } from './fileServer';

/** Image URLs of every card used in any deck (on the file server). */
export async function listCards(): Promise<string[]> {
  const decks = await readDecksJson();
  const ydks = await Promise.all(decks.map(async (d) => (await fetchText(`decks/${d.id}.ydk`)) ?? ''));
  const ids = new Set<string>();
  for (const ydk of ydks) {
    const { main, extra, side } = parseYdk(ydk);
    for (const id of [...main, ...extra, ...side]) ids.add(id);
  }
  return [...ids].map((id) => cardImageUrl(id));
}

/** Pick `count` distinct cards at random (Fisher–Yates shuffle). */
export async function pickRandomCards(count = 3): Promise<string[]> {
  const cards = await listCards();
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards.slice(0, count);
}
