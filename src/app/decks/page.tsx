import type { Metadata } from 'next';
import DecksPage from '@/components/pages/DecksPage';

export const metadata: Metadata = { title: 'Decks' };

export default function Page() {
  return <DecksPage />;
}
