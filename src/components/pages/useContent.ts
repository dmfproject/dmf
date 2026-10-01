'use client';

import { useEffect, useState, type DependencyList } from 'react';
import { useRouter } from 'next/navigation';
import { goToServerError } from '@/lib/serverError';

/**
 * Load a page's content from the file server in the browser (on every visit).
 * Returns null while loading. If loading fails (file server down, broken file), the visitor is
 * sent to the 500 page.
 */
export function useContent<T>(load: () => Promise<T>, deps: DependencyList = []): T | null {
  const router = useRouter();
  const [data, setData] = useState<T | null>(null);
  useEffect(() => {
    let alive = true;
    setData(null);
    load()
      .then((d) => alive && setData(d))
      .catch((err) => {
        if (!alive) return;
        console.error('[content]', err);
        goToServerError(router);
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return data;
}
