import type { Metadata } from 'next';
import { Suspense } from 'react';
import DeckPage from '@/components/pages/DeckPage';
import PageLoading from '@/components/pages/PageLoading';

export const metadata: Metadata = { title: 'Deck' };

// /deck/?d=<deck id>: one static page for every deck; the deck itself loads in the browser
export default function Page() {
  return (
    <Suspense fallback={<PageLoading />}>
      <DeckPage />
    </Suspense>
  );
}
