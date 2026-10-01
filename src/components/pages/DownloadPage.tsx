'use client';

import DownloadView from '../DownloadView';
import PageLoading from './PageLoading';
import { useContent } from './useContent';
import { getLatestPack } from '@/lib/download';
import { readDecksJson } from '@/lib/content';

export default function DownloadPage() {
  const data = useContent(() => Promise.all([getLatestPack(), readDecksJson()]));
  if (!data) return <PageLoading />;
  const [pack, decks] = data;
  // No decks or no archive yet: "in development" instead of a download
  const ready = decks.length > 0 && pack !== null;
  return <DownloadView pack={ready ? pack : null} inDevelopment={!ready} />;
}
