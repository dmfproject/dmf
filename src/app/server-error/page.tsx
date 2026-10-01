import type { Metadata } from 'next';
import ServerErrorView from '@/components/ServerErrorView';

export const metadata: Metadata = { title: 'Server unavailable', robots: { index: false } };

// Not /500: Next.js reserves that path for its own error page and the static export fails on it.
/** Shown when the file server (cards, decks, texts) can't be reached. Pages go here through useContent. */
export default function ServerErrorPage() {
  return <ServerErrorView />;
}
