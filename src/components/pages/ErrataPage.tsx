'use client';

import ErrataView from '../ErrataView';
import PageLoading from './PageLoading';
import { useContent } from './useContent';
import { getErrata } from '@/lib/errata';
import { readDecksJson } from '@/lib/content';

export default function ErrataPage() {
  const data = useContent(() => Promise.all([getErrata(), readDecksJson()]));
  if (!data) return <PageLoading />;
  return <ErrataView data={data[0]} hasDecks={data[1].length > 0} />;
}
