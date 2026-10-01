'use client';

import { useEffect, useState } from 'react';
import PhilosophyView from '../PhilosophyView';
import PageLoading from './PageLoading';
import { useContent } from './useContent';
import { pickRandomCards } from '@/lib/cards';
import { getContentText, getLatestUpdateNews, type UpdateNews } from '@/lib/content';

/**
 * Main page. The loading screen only waits for the text (philosophy.md); the hero cards and the
 * latest-update note load after the page is shown (the cards wait face-down until then).
 */
export default function HomePage() {
  const markdown = useContent(() => getContentText('philosophy.md'));
  const [cards, setCards] = useState<string[] | null>(null); // null = still loading
  const [news, setNews] = useState<UpdateNews | null>(null);

  useEffect(() => {
    let alive = true;
    pickRandomCards(Infinity).then((c) => alive && setCards(c), () => alive && setCards([]));
    getLatestUpdateNews().then((n) => alive && setNews(n), () => {});
    return () => {
      alive = false;
    };
  }, []);

  if (markdown === null) return <PageLoading />;
  return <PhilosophyView markdown={markdown} cards={cards} news={news} />;
}
