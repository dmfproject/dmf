'use client';

import RulingsView from '../RulingsView';
import PageLoading from './PageLoading';
import { useContent } from './useContent';
import { getContentText } from '@/lib/content';

export default function RulingsPage() {
  const markdown = useContent(() => getContentText('rulings.md'));
  if (markdown === null) return <PageLoading />;
  return <RulingsView markdown={markdown} />;
}
