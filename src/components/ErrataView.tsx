'use client';

import Box from '@mui/material/Box';
import type { ErrataData } from '@/lib/errata';
import { GlitchDivider, GradientTitle, SlashLabel } from './Decor';
import PageShell, { PAGE_TITLE_SIZE } from './PageShell';
import Markdown from './Markdown';
import CardBrowser from './cards/CardBrowser';
import ComingSoon from './ComingSoon';

export default function ErrataView({ data, hasDecks }: { data: ErrataData; hasDecks: boolean }) {
  return (
    <PageShell>
        <SlashLabel>DMF card changes</SlashLabel>
        <GradientTitle variant="h1" component="h1" sx={{ fontSize: PAGE_TITLE_SIZE }}>
          Errata
        </GradientTitle>
        <GlitchDivider />

        {data.intro && (
          <Box sx={{ maxWidth: 820, '& p, & li': { fontSize: '1.05rem' } }}>
            <Markdown>{data.intro}</Markdown>
          </Box>
        )}

        {!hasDecks ? (
          <ComingSoon title="Still shuffling" text="DMF errata come with the decks that use them. They show up here as soon as the first decks join the pool." />
        ) : data.cards.length === 0 ? (
          <ComingSoon title="No errata yet" text="Every card in the current decks plays exactly as printed. Changed cards will show up here." />
        ) : (
          <CardBrowser
            sections={[{ key: 'errata', label: 'Errata', cards: data.cards }]}
            images={data.images}
            errataTags={false}
          />
        )}
    </PageShell>
  );
}
