'use client';

import { useMemo } from 'react';
import { dmf } from '@/theme';
import { splitMarkdown } from '@/lib/sections';
import type { UpdateNews } from '@/lib/content';
import UpdateNote from './UpdateNote';
import Hero from './Hero';
import SectionBand, { bandColor, type BandVariant } from './SectionBand';

// Band rhythm: dark pattern → dark surface → bright ice-blue, then repeat.
const RHYTHM: BandVariant[] = ['pattern', 'surface', 'ice'];

/** Renders the Main page text (philosophy.md) as a hero + full-width section bands. */
export default function PhilosophyView({ markdown, cards = null, news = null }: { markdown: string; cards?: string[] | null; news?: UpdateNews | null }) {
  const page = useMemo(() => splitMarkdown(markdown), [markdown]);

  const variants = page.sections.map((_, i) => RHYTHM[i % RHYTHM.length]);

  return (
    <>
      {news && <UpdateNote news={news} />}
      <Hero title={page.title || 'DMF'} intro={page.intro} cards={cards} />
      {page.sections.map((s, i) => (
        <SectionBand
          key={s.id}
          id={s.id}
          index={i}
          title={s.title}
          body={s.body}
          variant={variants[i]}
          prevColor={i > 0 ? bandColor[variants[i - 1]] : dmf.bg}
          nextColor={i < variants.length - 1 ? bandColor[variants[i + 1]] : dmf.header}
        />
      ))}
    </>
  );
}
