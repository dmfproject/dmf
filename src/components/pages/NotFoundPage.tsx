'use client';

import { useEffect, useState } from 'react';
import NotFoundView from '../NotFoundView';
import { pickRandomCards } from '@/lib/cards';

/** 404: the message right away; the shuffling cards join once they're loaded (none if the file server is down). */
export default function NotFoundPage() {
  const [cards, setCards] = useState<string[]>([]);
  useEffect(() => {
    pickRandomCards(Infinity).then(setCards, () => setCards([]));
  }, []);
  return <NotFoundView key={cards.length ? 'cards' : 'empty'} cards={cards} />;
}
