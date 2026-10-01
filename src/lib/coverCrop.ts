/**
 * Square (1:1) deck cover crops, set in the admin. Must match the admin's naming
 * (scripts/lib/cover-crop.js in the admin repo).
 *
 * decks.json:  "crop": { "x": 0.12, "y": 0.05, "size": 0.8 }   (fractions of the image)
 * File:        covers/crops/<deck id>--<card id>-<x>-<y>-<size>.jpg   (values in 1/1000)
 */
export type Crop = { x: number; y: number; size: number };

function normalizeCrop(crop: unknown) {
  if (!crop || typeof crop !== 'object') return null;
  const c = crop as Record<string, unknown>;
  const x = Math.round(Number(c.x) * 1000);
  const y = Math.round(Number(c.y) * 1000);
  const size = Math.round(Number(c.size) * 1000);
  if (![x, y, size].every(Number.isFinite) || size <= 0 || size > 1000 || x < 0 || y < 0) return null;
  return { x, y, size };
}

/** File name (inside covers/crops) of a deck's cropped cover, or null without a valid crop. */
export function cropFileName(deckId: string, img: string, crop: unknown): string | null {
  const c = normalizeCrop(crop);
  if (!c || !/^\d+$/.test(String(img))) return null;
  return `${deckId}--${img}-${c.x}-${c.y}-${c.size}.jpg`;
}
