'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Gradually loads card images instead of all at once.
 *
 * - The first `initial` cards are returned right away (the page renders and loads them).
 * - Then one more card is downloaded every `everyMs`, in the background.
 * - A card is only added to the returned list once it has fully loaded (and decoded),
 *   so animations never show a half-loaded image.
 * - Pauses while the tab is hidden, and stops once every card is loaded.
 */
export function useCardFeed(all: string[], { initial = 3, everyMs = 3000 }: { initial?: number; everyMs?: number } = {}) {
  const [loaded, setLoaded] = useState<string[]>(() => all.slice(0, initial));
  const nextIndex = useRef(Math.min(initial, all.length));

  useEffect(() => {
    let cancelled = false;
    let busy = false;

    const loadNext = () => {
      if (busy || document.hidden || nextIndex.current >= all.length) return;
      const url = all[nextIndex.current++];
      busy = true;
      const img = new Image();
      img.decoding = 'async';
      img.src = url;
      img
        .decode()
        .then(() => {
          if (!cancelled) setLoaded((prev) => (prev.includes(url) ? prev : [...prev, url]));
        })
        .catch(() => {
          /* broken image: skip it */
        })
        .finally(() => {
          busy = false;
        });
    };

    const timer = setInterval(() => {
      if (nextIndex.current >= all.length) clearInterval(timer);
      else loadNext();
    }, everyMs);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [all, everyMs]);

  return loaded;
}
