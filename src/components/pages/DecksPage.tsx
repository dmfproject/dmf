'use client';

import DecksView from '../decks/DecksView';
import PageLoading from './PageLoading';
import { useContent } from './useContent';
import { getDecks, getUpdates } from '@/lib/content';

export default function DecksPage() {
  const data = useContent(() => Promise.all([getDecks(), getUpdates()]));
  if (!data) return <PageLoading />;
  return <DecksView decks={data[0]} updates={data[1]} />;
}
