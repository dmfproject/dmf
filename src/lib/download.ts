import { fetchJson, fileUrl } from './fileServer';

/** downloads/dmf_edopro.json on the file server (written by the admin's EDOPro pack build). */
type PackInfo = {
  file: string;
  /** yyyy-mm-dd */
  updated: string;
  /** bytes */
  size: number;
  decks: number;
  cards: number;
};

export type Pack = {
  file: string;
  url: string;
  /** "dd.mm.yyyy" */
  date: string;
  sizeMb: string;
  decks: number;
  cards: number;
};

/** The current EDOPro pack, read from the file server when the site is built; null if there's none. */
export async function getLatestPack(): Promise<Pack | null> {
  const info = await fetchJson<PackInfo>('downloads/dmf_edopro.json');
  if (!info || !info.file || !info.updated) return null;
  const [y, m, d] = info.updated.split('-');
  return {
    file: info.file,
    url: fileUrl(`downloads/${info.file}`),
    date: `${d}.${m}.${y}`,
    sizeMb: (info.size / 1024 / 1024).toFixed(1),
    decks: info.decks,
    cards: info.cards,
  };
}
